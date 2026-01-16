import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  __prisma__?: PrismaClient;
};

export const prisma =
  globalForPrisma.__prisma__ ?? new PrismaClient({ log: ["error", "warn"] });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma__ = prisma;
}
