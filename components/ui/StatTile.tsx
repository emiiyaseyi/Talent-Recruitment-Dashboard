import type { LucideIcon } from "lucide-react";
import { IconBadge } from "./IconBadge";

interface StatTileProps {
  label: string;
  value: string;
  sublabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
}

export function StatTile({ label, value, sublabel, icon, iconColor = "var(--series-1)" }: StatTileProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm text-[var(--text-secondary)]">{label}</div>
        {icon && <IconBadge icon={icon} color={iconColor} size={32} />}
      </div>
      <div className="mt-1 text-3xl font-semibold text-[var(--text-primary)]">{value}</div>
      {sublabel && <div className="mt-1 text-xs text-[var(--text-muted)]">{sublabel}</div>}
    </div>
  );
}
