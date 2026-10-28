import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminSession, recordAuditLog } from "@/app/lib/auth";
import { PartnerSchema } from "@/app/lib/validation";
import prisma from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireAdminSession();

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.companyName = { contains: search, mode: "insensitive" };
    }

    if (status === "published") {
      where.isPublished = true;
    } else if (status === "draft") {
      where.isPublished = false;
    }

    const [total, partners] = await Promise.all([
      prisma.partner.count({ where }),
      prisma.partner.findMany({
        where,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      partners,
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
    console.error("Fetch partners error:", err);
    return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminSession();

    const body = await req.json().catch(() => null);
    const parsed = PartnerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.create({
      data: parsed.data,
    });

    await recordAuditLog({
      adminEmail: admin.email,
      adminUserId: admin.id,
      action: "CREATE_PARTNER",
      targetType: "PARTNER",
      targetId: partner.id,
      details: {
        companyName: partner.companyName,
        isPublished: partner.isPublished,
      },
    });

    revalidatePath("/");

    return NextResponse.json({ success: true, partner }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create partner error:", err);
    return NextResponse.json({ error: "Failed to create partner" }, { status: 500 });
  }
}
