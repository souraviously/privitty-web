import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminSession, recordAuditLog } from "@/app/lib/auth";
import { TeamMemberSchema } from "@/app/lib/validation";
import prisma from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireAdminSession();

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { jobTitle: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "published") {
      where.isPublished = true;
    } else if (status === "draft") {
      where.isPublished = false;
    }

    const [total, teamMembers] = await Promise.all([
      prisma.teamMember.count({ where }),
      prisma.teamMember.findMany({
        where,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      teamMembers,
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
    console.error("Fetch team error:", err);
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminSession();

    const body = await req.json().catch(() => null);
    const parsed = TeamMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const member = await prisma.teamMember.create({
      data: parsed.data,
    });

    await recordAuditLog({
      adminEmail: admin.email,
      adminUserId: admin.id,
      action: "CREATE_TEAM_MEMBER",
      targetType: "TEAM_MEMBER",
      targetId: member.id,
      details: {
        name: member.name,
        jobTitle: member.jobTitle,
        isPublished: member.isPublished,
      },
    });

    revalidatePath("/about");

    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create team member error:", err);
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
  }
}
