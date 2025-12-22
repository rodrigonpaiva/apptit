import { PrismaClient } from "@prisma/client";

export const prisma =
  (globalThis as any).__prisma__ ??
  new PrismaClient({ log: ["error", "warn"] });

if (process.env.NODE_ENV !== "production") {
  (globalThis as any).__prisma__ = prisma;
}
