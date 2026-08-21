import { status } from "@/components/charts/theme";

type BadgeLevel = "good" | "warning" | "critical";

const LEVEL_LABEL: Record<BadgeLevel, string> = {
  good: "On track",
  warning: "Aging",
  critical: "Overdue",
};

const LEVEL_COLOR: Record<BadgeLevel, string> = {
  good: status.good,
  warning: status.warning,
  critical: status.critical,
};

export function StatusBadge({ level }: { level: BadgeLevel }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium"
      style={{ borderColor: LEVEL_COLOR[level], color: LEVEL_COLOR[level] }}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: LEVEL_COLOR[level] }} />
      {LEVEL_LABEL[level]}
    </span>
  );
}
