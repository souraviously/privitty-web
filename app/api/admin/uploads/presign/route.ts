import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/app/lib/auth";
import {
  validateUploadedFile,
  getPresignedUploadUrl,
} from "@/app/lib/s3";

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession();

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { folder, filename, contentType, sizeBytes } = body;

    if (!folder || !filename || !contentType) {
      return NextResponse.json(
        { error: "Folder, filename, and contentType are required." },
        { status: 400 }
      );
    }

    const category = folder === "whitepapers" ? "pdf" : "image";
    const validation = validateUploadedFile(
      filename,
      contentType,
      sizeBytes || 0,
      category
    );

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const presigned = await getPresignedUploadUrl({
      folder,
      filename,
      contentType,
    });

    return NextResponse.json(presigned);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Presign upload error:", err);
    return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 });
  }
}
