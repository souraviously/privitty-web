import { NextRequest, NextResponse } from "next/server";
import {
  requireAdminSession,
  verifyPassword,
  hashPassword,
  recordAuditLog,
} from "@/app/lib/auth";
import { ChangePasswordSchema } from "@/app/lib/validation";
import prisma from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminSession();

    const body = await req.json().catch(() => null);
    const parsed = ChangePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.adminUser.findUnique({
      where: { id: admin.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const matches = await verifyPassword(currentPassword, user.passwordHash);
    if (!matches) {
      return NextResponse.json(
        { error: "Current password does not match" },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(newPassword);

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: newHash },
    });

    await recordAuditLog({
      adminEmail: admin.email,
      adminUserId: admin.id,
      action: "PASSWORD_CHANGED",
      targetType: "AUTH",
      details: { message: "Administrator successfully updated their password" },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
