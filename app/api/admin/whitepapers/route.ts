import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminSession, recordAuditLog } from "@/app/lib/auth";
import { WhitepaperSchema, sanitizeSlug } from "@/app/lib/validation";
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
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "published") {
      where.isPublished = true;
    } else if (status === "draft") {
      where.isPublished = false;
    }

    const [total, whitepapers] = await Promise.all([
      prisma.whitepaper.count({ where }),
      prisma.whitepaper.findMany({
        where,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      whitepapers,
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
    console.error("Fetch whitepapers error:", err);
    return NextResponse.json({ error: "Failed to fetch whitepapers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminSession();

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

    const existingSlug = await prisma.whitepaper.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: `The slug "${parsed.data.slug}" is already in use. Please choose a unique slug.` },
        { status: 400 }
      );
    }

    const whitepaper = await prisma.whitepaper.create({
      data: {
        ...parsed.data,
        publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : new Date(),
      },
    });

    await recordAuditLog({
      adminEmail: admin.email,
      adminUserId: admin.id,
      action: "CREATE_WHITEPAPER",
      targetType: "WHITEPAPER",
      targetId: whitepaper.id,
      details: {
        title: whitepaper.title,
        slug: whitepaper.slug,
        isPublished: whitepaper.isPublished,
      },
    });

    revalidatePath("/whitepapers");
    revalidatePath(`/whitepapers/${whitepaper.slug}`);
    revalidatePath("/");

    return NextResponse.json({ success: true, whitepaper }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create whitepaper error:", err);
    return NextResponse.json({ error: "Failed to create whitepaper" }, { status: 500 });
  }
}
