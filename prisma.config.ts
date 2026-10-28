import "dotenv/config";
import { defineConfig } from "prisma/config";

// Guarantee DATABASE_URL is always defined so that schema validation never
// fails during `prisma generate` (which runs on every `npm install` and on
// Amplify's preBuild step — both happen before the real DB URL is needed).
//
// The placeholder is intentionally unreachable; it is ONLY used for schema
// validation. Any command that actually contacts the database (migrate deploy,
// studio, seed) must have a real DATABASE_URL present, either via:
//   • a .env file in the project root  (loaded above by dotenv/config)
//   • the shell environment            (set -a; source .env; set +a)
//   • Amplify Console environment vars (written to .env.production in amplify.yml)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://placeholder:placeholder@localhost:5432/placeholder";
}

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
