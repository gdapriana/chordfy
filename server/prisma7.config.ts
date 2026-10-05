import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts"
  },
  datasource: {
    url: "postgres://76a2d6eb11838e8a121d18d09a3c1d97c9cd696a28b78d6cb863133b074f74ce:sk_3pO_Rbbw-GKp594ElkTnn@pooled.db.prisma.io:5432/postgres?sslmode=require"
  }
});
