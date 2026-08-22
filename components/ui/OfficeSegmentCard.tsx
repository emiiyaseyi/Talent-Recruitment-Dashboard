import { CircularStat, RingStat } from "./CircularStat";
import { categorical, status } from "@/components/charts/theme";

interface OfficeSegmentCardProps {
  title: string;
  accentColor: string;
  avgDaysToHire: number | null;
  avgDaysToFill: number | null;
  acceptanceRate: number | null;
  withdrawalRate: number | null;
}

export function OfficeSegmentCard({
  title,
  accentColor,
  avgDaysToHire,
  avgDaysToFill,
  acceptanceRate,
  withdrawalRate,
}: OfficeSegmentCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="mb-5 flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm" style={{ background: accentColor }} aria-hidden />
        <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CircularStat
          value={avgDaysToHire == null ? "—" : (avgDaysToHire / 7).toFixed(1)}
          label="Average Weeks to Hire"
          caption={avgDaysToHire == null ? undefined : `${avgDaysToHire.toFixed(0)} days`}
          color={categorical[4]}
        />
        <CircularStat
          value={avgDaysToFill == null ? "—" : (avgDaysToFill / 7).toFixed(1)}
          label="Average Weeks to Fill"
          caption={avgDaysToFill == null ? undefined : `${avgDaysToFill.toFixed(0)} days`}
          color={categorical[0]}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-5">
        <RingStat percent={acceptanceRate} label="Offer acceptance rate" color={accentColor} />
        <RingStat
          percent={withdrawalRate}
          label="Withdrawal Rate"
          sublabel="of resolved offers"
          color={status.critical}
        />
      </div>
    </div>
  );
}
