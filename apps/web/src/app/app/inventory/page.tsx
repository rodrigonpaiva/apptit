import { Card, PageShell } from "@apptit/ui";

export default function InventoryPage() {
  return (
    <PageShell title="Inventory" subtitle="Manage stock and availability">
      <Card title="Inventory" description="Placeholder module">
        <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-600">
          Inventory management screens will live here.
        </div>
      </Card>
    </PageShell>
  );
}
