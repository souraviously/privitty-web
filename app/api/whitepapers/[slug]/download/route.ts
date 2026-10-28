import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/app/lib/auth";
import { getSecureDownloadUrl } from "@/app/lib/s3";
import prisma from "@/app/lib/prisma";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const whitepaper = await prisma.whitepaper.findUnique({
      where: { slug },
    });

    if (!whitepaper) {
      return new NextResponse("Whitepaper not found", { status: 404 });
    }

    if (!whitepaper.isPublished) {
      // Allow preview only for logged in administrators
      const admin = await getAdminSession();
      if (!admin) {
        return new NextResponse("Whitepaper not found or not published", { status: 404 });
      }
    }

    // Increment download count asynchronously
    prisma.whitepaper
      .update({
        where: { id: whitepaper.id },
        data: { downloadCount: { increment: 1 } },
      })
      .catch((err: unknown) => console.error("Failed to increment download count:", err));

    // If file is stored in local uploads directory
    if (whitepaper.fileKey.startsWith("/uploads/") || whitepaper.fileKey.startsWith("whitepapers/")) {
      const cleanKey = whitepaper.fileKey.replace(/^\/?uploads\//, "");
      const localFilePath = path.join(process.cwd(), "public", "uploads", cleanKey);

      if (fs.existsSync(localFilePath)) {
        const fileStream = fs.createReadStream(localFilePath);
        const headers = new Headers();
        headers.set("Content-Type", "application/pdf");
        headers.set(
          "Content-Disposition",
          `attachment; filename="${encodeURIComponent(whitepaper.fileName)}"`
        );
        // @ts-expect-error - ReadableStream type compatibility with Next.js Response
        return new NextResponse(fileStream, { headers });
      }
    }

    // Generate secure short-lived S3 download URL
    const downloadUrl = await getSecureDownloadUrl(
      whitepaper.fileKey,
      whitepaper.fileName,
      900 // 15 minutes
    );

    // Redirect user to authorized presigned S3 download link
    return NextResponse.redirect(downloadUrl);
  } catch (err: unknown) {
    console.error("Download whitepaper error:", err);
    return new NextResponse("Failed to download whitepaper", { status: 500 });
  }
}
