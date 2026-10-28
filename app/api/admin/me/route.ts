import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: admin });
}
