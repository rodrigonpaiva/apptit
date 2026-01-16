import { Card, PageShell } from "@apptit/ui";

export default function ProductsPage() {
  return (
    <PageShell title="Products" subtitle="Catalog and pricing placeholders">
      <Card title="Products" description="Placeholder module">
        <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-600">
          Product catalog screens will live here.
        </div>
      </Card>
    </PageShell>
  );
}
