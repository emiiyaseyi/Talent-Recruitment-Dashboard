import type { LucideIcon } from "lucide-react";

export function IconBadge({
  icon: Icon,
  color = "var(--series-1)",
  size = 36,
}: {
  icon: LucideIcon;
  color?: string;
  size?: number;
}) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `color-mix(in srgb, ${color} 15%, white)`,
        color,
      }}
      aria-hidden
    >
      <Icon size={Math.round(size * 0.5)} strokeWidth={2} />
    </span>
  );
}
