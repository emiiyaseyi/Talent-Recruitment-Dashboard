interface StatTileProps {
  label: string;
  value: string;
  sublabel?: string;
}

export function StatTile({ label, value, sublabel }: StatTileProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="text-sm text-[var(--text-secondary)]">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-[var(--text-primary)]">{value}</div>
      {sublabel && <div className="mt-1 text-xs text-[var(--text-muted)]">{sublabel}</div>}
    </div>
  );
}
