import { NextResponse } from "next/server";
import { getAdminSession, clearAdminSession, recordAuditLog } from "@/app/lib/auth";

export async function POST() {
  const admin = await getAdminSession();
  if (admin) {
    await recordAuditLog({
      adminEmail: admin.email,
      adminUserId: admin.id,
      action: "LOGOUT",
      targetType: "AUTH",
    });
  }
  await clearAdminSession();
  return NextResponse.json({ success: true });
}
