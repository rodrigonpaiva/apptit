import { Card, PageShell, Input, Button } from "@apptit/ui";

type InvitePageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function InviteMemberPage({ searchParams }: InvitePageProps) {
  const { success, error } = await searchParams;

  return (
    <PageShell title="Invite Member" subtitle="Send an invitation to your organization">
      <Card title="New Invitation">
        {success && (
          <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Invitation sent successfully!
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        <form action="/api/team/invite" method="post" className="grid gap-6">
          <Input label="Email" name="email" type="email" required placeholder="member@example.com" />

          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium text-neutral-700">Role</legend>
            <div className="grid gap-2">
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  className="h-4 w-4 border-neutral-300 text-neutral-900 focus:ring-neutral-500"
                />
                Admin
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="radio"
                  name="role"
                  value="MANAGER"
                  className="h-4 w-4 border-neutral-300 text-neutral-900 focus:ring-neutral-500"
                />
                Manager
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="radio"
                  name="role"
                  value="STAFF"
                  defaultChecked
                  className="h-4 w-4 border-neutral-300 text-neutral-900 focus:ring-neutral-500"
                />
                Staff
              </label>
            </div>
          </fieldset>

          <Button type="submit">Send Invitation</Button>
        </form>
      </Card>
    </PageShell>
  );
}
