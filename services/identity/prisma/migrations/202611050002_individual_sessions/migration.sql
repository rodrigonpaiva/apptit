BEGIN;

CREATE TABLE "IdentityUser" (
  "id" UUID NOT NULL,
  "login" VARCHAR(100) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "IdentityUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Tenant" (
  "id" UUID NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Site" (
  "id" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "timeZone" VARCHAR(100) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteMembership" (
  "userId" UUID NOT NULL,
  "siteId" UUID NOT NULL,
  "role" VARCHAR(20) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "SiteMembership_pkey" PRIMARY KEY ("userId", "siteId")
);

CREATE TABLE "AccessSession" (
  "id" UUID NOT NULL,
  "tokenHash" VARCHAR(64) NOT NULL,
  "userId" UUID NOT NULL,
  "selectedSiteId" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL,
  "lastSeenAt" TIMESTAMPTZ(3) NOT NULL,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  "revokedAt" TIMESTAMPTZ(3),
  CONSTRAINT "AccessSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AccessEvent" (
  "id" UUID NOT NULL,
  "sessionId" UUID NOT NULL,
  "subjectUserId" UUID NOT NULL,
  "actorId" UUID NOT NULL,
  "actorName" VARCHAR(200) NOT NULL,
  "siteId" UUID NOT NULL,
  "kind" VARCHAR(20) NOT NULL,
  "recordedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "AccessEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LoginRate" (
  "key" VARCHAR(80) NOT NULL,
  "startedAt" TIMESTAMPTZ(3) NOT NULL,
  "attempts" INTEGER NOT NULL,
  CONSTRAINT "LoginRate_pkey" PRIMARY KEY ("key")
);

CREATE UNIQUE INDEX "IdentityUser_login_key" ON "IdentityUser"("login");

CREATE UNIQUE INDEX "AccessSession_tokenHash_key" ON "AccessSession"("tokenHash");

CREATE INDEX "AccessSession_userId_idx" ON "AccessSession"("userId");

CREATE INDEX "Site_tenantId_idx" ON "Site"("tenantId");

CREATE INDEX "AccessEvent_sessionId_idx" ON "AccessEvent"("sessionId");

ALTER TABLE "Site" ADD CONSTRAINT "Site_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SiteMembership" ADD CONSTRAINT "SiteMembership_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SiteMembership" ADD CONSTRAINT "SiteMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "IdentityUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AccessSession" ADD CONSTRAINT "AccessSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "IdentityUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AccessSession" ADD CONSTRAINT "AccessSession_selectedSiteId_fkey" FOREIGN KEY ("selectedSiteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SiteMembership" ADD CONSTRAINT "SiteMembership_role" CHECK ("role" IN ('chef', 'storekeeper', 'cook') AND "version" > 0);

ALTER TABLE "LoginRate" ADD CONSTRAINT "LoginRate_attempts" CHECK ("attempts" > 0);

COMMIT;
