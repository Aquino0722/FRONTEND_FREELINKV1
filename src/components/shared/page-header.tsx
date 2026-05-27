export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
