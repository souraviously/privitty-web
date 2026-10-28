import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession, recordAuditLog } from "@/app/lib/auth";
import { deleteStorageObject } from "@/app/lib/s3";
import prisma from "@/app/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminSession();
    const { id } = await params;

    const asset = await prisma.mediaAsset.findUnique({
      where: { id },
    });

    if (!asset) {
      return NextResponse.json({ error: "Media asset not found" }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    const force = searchParams.get("force") === "true";

    // Check references before deleting
    const key = asset.key;
    const url = asset.url || "";

    const [testimonials, teamMembers, whitepapers] = await Promise.all([
      prisma.testimonial.findMany({
        where: {
          isPublished: true,
          OR: [
            { authorPortrait: { contains: key } },
            { companyLogo: { contains: key } },
            ...(url ? [{ authorPortrait: url }, { companyLogo: url }] : []),
          ],
        },
        select: { id: true, authorName: true },
      }),
      prisma.teamMember.findMany({
        where: {
          isPublished: true,
          OR: [
            { photoUrl: { contains: key } },
            ...(url ? [{ photoUrl: url }] : []),
          ],
        },
        select: { id: true, name: true },
      }),
      prisma.whitepaper.findMany({
        where: {
          isPublished: true,
          OR: [
            { fileKey: { contains: key } },
            { coverImageUrl: { contains: key } },
            ...(url ? [{ fileKey: url }, { coverImageUrl: url }] : []),
          ],
        },
        select: { id: true, title: true },
      }),
    ]);

    const activeReferences = [
      ...testimonials.map((t) => `Testimonial: ${t.authorName}`),
      ...teamMembers.map((m) => `Team Member: ${m.name}`),
      ...whitepapers.map((w) => `Whitepaper: ${w.title}`),
    ];

    if (activeReferences.length > 0 && !force) {
      return NextResponse.json(
        {
          error:
            "This asset is currently in use by published content. Deleting it will cause broken images or missing downloads.",
          referencedBy: activeReferences,
          canForce: true,
        },
        { status: 409 }
      );
    }

    // Safe to delete
    await deleteStorageObject(asset.key);
    await prisma.mediaAsset.delete({ where: { id } });

    await recordAuditLog({
      adminEmail: admin.email,
      adminUserId: admin.id,
      action: "DELETE_MEDIA",
      targetType: "MEDIA",
      targetId: id,
      details: {
        filename: asset.filename,
        key: asset.key,
        forced: force && activeReferences.length > 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete media error:", err);
    return NextResponse.json({ error: "Failed to delete media asset" }, { status: 500 });
  }
}
