import { PageHeader } from '@/components/admin/AdminUI';

export default function AdminPlaceholder({
  title,
  description,
  features,
}: {
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div>
      <PageHeader title={title} subtitle={description} />
      <div className="rounded-2xl border border-dashed border-border p-8">
        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">
          Planned for this section
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground" />
              {f}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-xs text-muted-foreground">
          Coming in the next build phase. The data model and access rules are already in place.
        </p>
      </div>
    </div>
  );
}
