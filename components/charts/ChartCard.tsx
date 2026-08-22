import type { LucideIcon } from "lucide-react";

interface ChartCardProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, icon: Icon, iconColor = "var(--series-1)", children }: ChartCardProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="mb-4 flex items-center gap-3">
        {Icon && (
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ background: `color-mix(in srgb, ${iconColor} 15%, white)`, color: iconColor }}
            aria-hidden
          >
            <Icon size={18} strokeWidth={2} />
          </span>
        )}
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">{title}</h3>
      </div>
      {children}
    </div>
  );
}
