import { NextRequest, NextResponse } from "next/server";
import {
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginRateLimit,
  verifyPassword,
  createAdminSession,
  recordAuditLog,
  getClientIp,
} from "@/app/lib/auth";
import { LoginSchema } from "@/app/lib/validation";
import prisma from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const ip = await getClientIp();
    const rateCheck = checkLoginRateLimit(ip);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please wait ${rateCheck.waitSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parseResult = LoginSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid credentials format" },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;

    const admin = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin || !admin.isActive) {
      recordFailedLogin(ip);
      await recordAuditLog({
        adminEmail: email.toLowerCase(),
        action: "LOGIN_FAILED",
        targetType: "AUTH",
        details: { reason: "User not found or inactive", ip },
      });
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const passwordValid = await verifyPassword(password, admin.passwordHash);
    if (!passwordValid) {
      recordFailedLogin(ip);
      await recordAuditLog({
        adminEmail: admin.email,
        adminUserId: admin.id,
        action: "LOGIN_FAILED",
        targetType: "AUTH",
        details: { reason: "Incorrect password", ip },
      });
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Success: reset rate limit & issue session
    resetLoginRateLimit(ip);
    await createAdminSession(admin.id);

    await recordAuditLog({
      adminEmail: admin.email,
      adminUserId: admin.id,
      action: "LOGIN_SUCCESS",
      targetType: "AUTH",
      details: { ip },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err: unknown) {
    console.error("Login route error:", err);
    return NextResponse.json({ error: "Internal authentication error" }, { status: 500 });
  }
}
