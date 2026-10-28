import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminSession, recordAuditLog } from "@/app/lib/auth";
import { WhitepaperSchema, sanitizeSlug } from "@/app/lib/validation";
import { deleteStorageObject } from "@/app/lib/s3";
import prisma from "@/app/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;

    const whitepaper = await prisma.whitepaper.findUnique({
      where: { id },
    });

    if (!whitepaper) {
      return NextResponse.json({ error: "Whitepaper not found" }, { status: 404 });
    }

    return NextResponse.json({ whitepaper });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch whitepaper" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminSession();
    const { id } = await params;

    const body = await req.json().catch(() => null);
    if (body?.slug) {
      body.slug = sanitizeSlug(body.slug);
    }

    const parsed = WhitepaperSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const existingSlug = await prisma.whitepaper.findFirst({
      where: {
        slug: parsed.data.slug,
        NOT: { id },
      },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: `The slug "${parsed.data.slug}" is already in use by another whitepaper.` },
        { status: 400 }
      );
    }

    const updated = await prisma.whitepaper.update({
      where: { id },
      data: {
        ...parsed.data,
        publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : undefined,
      },
    });

    await recordAuditLog({
      adminEmail: admin.email,
      adminUserId: admin.id,
      action: "UPDATE_WHITEPAPER",
      targetType: "WHITEPAPER",
      targetId: id,
      details: {
        title: updated.title,
        isPublished: updated.isPublished,
      },
    });

    revalidatePath("/whitepapers");
    revalidatePath(`/whitepapers/${updated.slug}`);
    revalidatePath("/");

    return NextResponse.json({ success: true, whitepaper: updated });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update whitepaper error:", err);
    return NextResponse.json({ error: "Failed to update whitepaper" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminSession();
    const { id } = await params;

    const searchParams = req.nextUrl.searchParams;
    const deleteFile = searchParams.get("deleteFile") === "true";

    const existing = await prisma.whitepaper.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Whitepaper not found" }, { status: 404 });
    }

    await prisma.whitepaper.delete({ where: { id } });

    if (deleteFile && existing.fileKey) {
      await deleteStorageObject(existing.fileKey);
    }

    await recordAuditLog({
      adminEmail: admin.email,
      adminUserId: admin.id,
      action: "DELETE_WHITEPAPER",
      targetType: "WHITEPAPER",
      targetId: id,
      details: { title: existing.title, slug: existing.slug },
    });

    revalidatePath("/whitepapers");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete whitepaper error:", err);
    return NextResponse.json({ error: "Failed to delete whitepaper" }, { status: 500 });
  }
}
