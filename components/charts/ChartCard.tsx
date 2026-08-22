import type { LucideIcon } from "lucide-react";
import { IconBadge } from "@/components/ui/IconBadge";

interface ChartCardProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, icon: Icon, iconColor = "var(--series-1)", children }: ChartCardProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">{title}</h3>
        {Icon && <IconBadge icon={Icon} color={iconColor} size={36} />}
      </div>
      {children}
    </div>
  );
}
