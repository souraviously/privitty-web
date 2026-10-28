
// This file is used by the Prisma CLI (migrate, generate, studio, etc.).
// It is NOT used by the Next.js runtime — the app reads DATABASE_URL directly
// from process.env via the schema.prisma datasource block.
//
// Do NOT add a datasource.url override here; it conflicts with schema.prisma's
// env("DATABASE_URL") validation and causes "resolved to an empty string" errors.
// DATABASE_URL must be present in the environment when running migrate/studio.
//
// prisma generate (postinstall) does NOT need DATABASE_URL — it only reads the
// schema shape, not the connection. The placeholder in schema.prisma's provider
// block satisfies the CLI's schema-load step without a real connection.
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
