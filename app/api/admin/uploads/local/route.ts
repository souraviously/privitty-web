import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/app/lib/auth";
import path from "path";
import fs from "fs/promises";
import prisma from "@/app/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdminSession();

    const searchParams = req.nextUrl.searchParams;
    const fileKey = searchParams.get("key");

    if (!fileKey) {
      return NextResponse.json({ error: "Missing key parameter" }, { status: 400 });
    }

    // Clean key preventing directory traversal
    const safeKey = fileKey.replace(/\.\./g, "").replace(/^\/+/, "");
    const localFilePath = path.join(process.cwd(), "public", "uploads", safeKey);

    await fs.mkdir(path.dirname(localFilePath), { recursive: true });

    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(localFilePath, buffer);

    const contentType = req.headers.get("content-type") || "application/octet-stream";
    const filename = path.basename(safeKey);

    // Register asset in MediaAsset table
    await prisma.mediaAsset.upsert({
      where: { key: safeKey },
      update: {
        size: buffer.length,
        mimeType: contentType,
        url: `/uploads/${safeKey}`,
      },
      create: {
        filename,
        key: safeKey,
        mimeType: contentType,
        size: buffer.length,
        url: `/uploads/${safeKey}`,
        category: safeKey.endsWith(".pdf") ? "PDF" : "IMAGE",
        uploadedBy: admin.email,
      },
    });

    return NextResponse.json({
      success: true,
      fileKey: safeKey,
      url: `/uploads/${safeKey}`,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Local upload error:", err);
    return NextResponse.json({ error: "Failed to save upload" }, { status: 500 });
  }
}
