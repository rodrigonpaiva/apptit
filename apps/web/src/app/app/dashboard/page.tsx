import { headers } from "next/headers";
import { getMe } from "@apptit/api";
import { Card, PageShell } from "@apptit/ui";

export default async function DashboardPage() {
  const cookieHeader = headers().get("cookie") ?? undefined;
  const me = await getMe(
    cookieHeader ? { cookie: cookieHeader } : undefined
  );

  if (!me) {
    return null;
  }

  return (
    <PageShell
      title="Dashboard"
      subtitle="Current session and organization snapshot"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Session"
          description="Live view of the authenticated user"
        >
          <div className="grid gap-2 text-sm text-neutral-600">
            <div>
              <span className="font-medium text-neutral-900">User</span> {me.userId}
            </div>
            <div>
              <span className="font-medium text-neutral-900">Role</span> {me.role}
            </div>
            <div>
              <span className="font-medium text-neutral-900">Tenant</span> {me.tenantId}
            </div>
          </div>
        </Card>

        <Card
          title="Organization"
          description="Placeholder for tenant/org summary"
        >
          <div className="grid gap-3 text-sm text-neutral-600">
            <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-6 text-center">
              Active organization summary will surface here.
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
