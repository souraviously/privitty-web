
// This file is used by the Prisma CLI (migrate, generate, studio, etc.).
// It is NOT used by the Next.js runtime — the app reads DATABASE_URL directly
// from process.env via the schema.prisma datasource block.
//
// When prisma.config.ts is present, Prisma 6 skips automatic .env loading.
// We restore that by explicitly calling dotenv/config here so that
// `prisma migrate deploy` and `prisma studio` pick up DATABASE_URL from .env.
// (prisma generate does not need DATABASE_URL — it only reads the schema shape.)
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
