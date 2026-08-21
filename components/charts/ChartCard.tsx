export function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
      <h3 className="mb-4 text-sm font-medium text-[var(--text-secondary)]">{title}</h3>
      {children}
    </div>
  );
}
