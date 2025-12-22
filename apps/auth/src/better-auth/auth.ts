import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@apptit/prisma";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  // Isola rotas do Better Auth no microservice Auth
  basePath: "/api/auth",

  // Postgres + Prisma
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Multi-tenant: Organization = Tenant
  plugins: [organization()],
});
