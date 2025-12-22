import { PrismaClient } from "@prisma/client";

declare global {
  // Reutiliza instância em hot-reload para evitar muitas conexões
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

export const prisma =
  global.__prisma__ ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") global.__prisma__ = prisma;

export type { PrismaClient };
