import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession, recordAuditLog } from "@/app/lib/auth";
import {
  validateUploadedFile,
  uploadBufferToStorage,
} from "@/app/lib/s3";
import prisma from "@/app/lib/prisma";
import type { MediaAsset } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireAdminSession();

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "18", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { filename: { contains: search, mode: "insensitive" } },
        { key: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category !== "all") {
      where.category = category.toUpperCase();
    }

    const [total, assets] = await Promise.all([
      prisma.mediaAsset.count({ where }),
      prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    // Check usage across tables for each asset
    const assetsWithUsage = await Promise.all(
      assets.map(async (asset: MediaAsset) => {
        const key = asset.key;
        const url = asset.url || "";

        const [tCount, tmCount, wpCount] = await Promise.all([
          prisma.testimonial.count({
            where: {
              OR: [
                { authorPortrait: { contains: key } },
                { companyLogo: { contains: key } },
                ...(url ? [{ authorPortrait: url }, { companyLogo: url }] : []),
              ],
            },
          }),
          prisma.teamMember.count({
            where: {
              OR: [
                { photoUrl: { contains: key } },
                ...(url ? [{ photoUrl: url }] : []),
              ],
            },
          }),
          prisma.whitepaper.count({
            where: {
              OR: [
                { fileKey: { contains: key } },
                { coverImageUrl: { contains: key } },
                ...(url ? [{ fileKey: url }, { coverImageUrl: url }] : []),
              ],
            },
          }),
        ]);

        const totalUsage = tCount + tmCount + wpCount;
        return {
          ...asset,
          usageCount: totalUsage,
          usageDetails: {
            testimonials: tCount,
            teamMembers: tmCount,
            whitepapers: wpCount,
          },
        };
      })
    );

    return NextResponse.json({
      assets: assetsWithUsage,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Fetch media error:", err);
    return NextResponse.json({ error: "Failed to fetch media assets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminSession();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as "testimonials" | "team" | "whitepapers" | "media") || "media";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validation = validateUploadedFile(
      file.name,
      file.type,
      file.size,
      file.type === "application/pdf" ? "pdf" : "image"
    );

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { fileKey, publicUrl } = await uploadBufferToStorage(
      buffer,
      folder,
      file.name,
      file.type
    );

    const asset = await prisma.mediaAsset.create({
      data: {
        filename: file.name,
        key: fileKey,
        mimeType: file.type,
        size: file.size,
        url: publicUrl,
        category: file.type === "application/pdf" ? "PDF" : "IMAGE",
        uploadedBy: admin.email,
      },
    });

    await recordAuditLog({
      adminEmail: admin.email,
      adminUserId: admin.id,
      action: "UPLOAD_MEDIA",
      targetType: "MEDIA",
      targetId: asset.id,
      details: {
        filename: file.name,
        key: fileKey,
        size: file.size,
      },
    });

    return NextResponse.json({ success: true, asset }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Upload media error:", err);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
