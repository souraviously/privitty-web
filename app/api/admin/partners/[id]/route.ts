import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminSession, recordAuditLog } from "@/app/lib/auth";
import { PartnerSchema } from "@/app/lib/validation";
import prisma from "@/app/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;

    const partner = await prisma.partner.findUnique({
      where: { id },
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json({ partner });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch partner" }, { status: 500 });
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
    const parsed = PartnerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const updated = await prisma.partner.update({
      where: { id },
      data: parsed.data,
    });

    await recordAuditLog({
      adminEmail: admin.email,
      adminUserId: admin.id,
      action: "UPDATE_PARTNER",
      targetType: "PARTNER",
      targetId: id,
      details: {
        companyName: updated.companyName,
        isPublished: updated.isPublished,
      },
    });

    revalidatePath("/");

    return NextResponse.json({ success: true, partner: updated });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update partner error:", err);
    return NextResponse.json({ error: "Failed to update partner" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminSession();
    const { id } = await params;

    const existing = await prisma.partner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    await prisma.partner.delete({ where: { id } });

    await recordAuditLog({
      adminEmail: admin.email,
      adminUserId: admin.id,
      action: "DELETE_PARTNER",
      targetType: "PARTNER",
      targetId: id,
      details: {
        companyName: existing.companyName,
      },
    });

    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete partner error:", err);
    return NextResponse.json({ error: "Failed to delete partner" }, { status: 500 });
  }
}
