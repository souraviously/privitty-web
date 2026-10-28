-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "partners_isPublished_displayOrder_idx" ON "partners"("isPublished", "displayOrder");
