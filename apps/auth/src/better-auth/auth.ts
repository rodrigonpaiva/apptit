import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@apptit/prisma";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  // Isola rotas do Better Auth no microservice Auth
  basePath: "/api/auth",

  // Secret for signing tokens
  secret: process.env.BETTER_AUTH_SECRET,

  // Trusted origins for CSRF protection
  trustedOrigins: ["http://localhost:3000", "http://localhost:4001"],

  // Postgres + Prisma
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Enable email/password authentication
  emailAndPassword: {
    enabled: true,
  },

  // Multi-tenant: Organization = Tenant
  plugins: [organization()],
});
