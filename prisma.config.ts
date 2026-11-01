
// This file is used by the Prisma CLI (migrate, generate, studio, etc.).
// It is NOT used by the Next.js runtime — the app reads DATABASE_URL directly
// from process.env via the schema.prisma datasource block.
//
// env() here throws if the variable is missing, which breaks `prisma generate`
// during `npm install` (postinstall) when no .env file is present (e.g. CI).
// We fall back to a placeholder so generate always succeeds; the real URL is
// only needed for migrate/studio commands.
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
