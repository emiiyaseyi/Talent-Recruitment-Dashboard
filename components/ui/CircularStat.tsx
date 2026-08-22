import type { LucideIcon } from "lucide-react";
import { ink, seriesPrimary } from "@/components/charts/theme";

const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Badge-style stat: a filled circle with the number inside, label (and an
 * optional smaller caption, e.g. the same figure in a different unit) beside
 * it — the template's "21 / Average Days to Hire" pattern. */
export function CircularStat({
  value,
  label,
  caption,
  color = seriesPrimary,
}: {
  value: string;
  label: string;
  caption?: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
        style={{ background: color }}
      >
        {value}
      </div>
      <div>
        <div className="text-sm font-medium text-[var(--text-primary)]">{label}</div>
        {caption && <div className="text-xs text-[var(--text-muted)]">{caption}</div>}
      </div>
    </div>
  );
}

/** Ring/donut single-percentage indicator — the template's acceptance-rate
 * and withdrawal-rate badges. */
export function RingStat({
  percent,
  label,
  sublabel,
  color = seriesPrimary,
  icon: Icon,
}: {
  percent: number | null;
  label: string;
  sublabel?: string;
  color?: string;
  icon?: LucideIcon;
}) {
  const pct = percent == null ? 0 : Math.max(0, Math.min(1, percent));
  const offset = CIRCUMFERENCE * (1 - pct);

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
        <svg width="64" height="64" viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
          <circle cx="32" cy="32" r={RADIUS} fill="none" stroke={ink.grid} strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        {Icon && <Icon size={22} strokeWidth={2} style={{ color }} />}
      </div>
      <div>
        <div className="text-lg font-bold text-[var(--text-primary)]">
          {percent == null ? "—" : `${(percent * 100).toFixed(0)}%`}
        </div>
        <div className="text-sm text-[var(--text-primary)]">{label}</div>
        {sublabel && <div className="text-xs text-[var(--text-muted)]">{sublabel}</div>}
      </div>
    </div>
  );
}
