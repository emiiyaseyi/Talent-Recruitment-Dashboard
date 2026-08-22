import type { PipelineRow } from "@/lib/metrics";
import { DataTable } from "./DataTable";

/** "Current Hiring Pipeline" — one row per open role, one column per stage.
 * Stages come from Config!PipelineStages (admin-editable), so the column set
 * is driven entirely by `stages`, never hardcoded here. */
export function PipelineTable({ rows, stages }: { rows: PipelineRow[]; stages: string[] }) {
  return (
    <DataTable<PipelineRow>
      rowKey={(r) => r.role}
      emptyMessage="No open roles in the pipeline right now."
      columns={[
        { header: "Role", cell: (r) => r.role },
        ...stages.map((stage) => ({
          header: stage,
          cell: (r: PipelineRow) => r.stageCounts[stage] ?? 0,
          align: "right" as const,
        })),
        { header: "Total", cell: (r) => r.total, align: "right" as const },
      ]}
      rows={rows}
    />
  );
}
