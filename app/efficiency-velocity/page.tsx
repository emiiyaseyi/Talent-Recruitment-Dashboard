import { getDashboardData } from "@/lib/sheets";
import { parseFilters, type SearchParams } from "@/lib/filters";
import {
  agingRequisitions,
  applyFilters,
  buVelocityRanking,
  roleVelocityRanking,
  timeToHireDistribution,
} from "@/lib/metrics";
import { appConfig } from "@/config/app.config";
import { FilterBar } from "@/components/ui/FilterBar";
import { ChartCard } from "@/components/charts/ChartCard";
import { FlatBarChart } from "@/components/charts/FlatBarChart";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { AgingRequisition, VelocityRanking } from "@/lib/metrics";

export default async function EfficiencyVelocityPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { records, config } = await getDashboardData();
  const filters = parseFilters(await searchParams);
  const filtered = applyFilters(records, filters);

  const distribution = timeToHireDistribution(filtered).map((b) => ({
    label: b.label,
    value: b.count,
  }));
  const aging = agingRequisitions(filtered);
  const buRanking = buVelocityRanking(filtered);
  const roleRanking = roleVelocityRanking(filtered);

  const warningDays = appConfig.agingRequisitionWarningDays;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Efficiency &amp; Velocity Metrics</h1>
      <FilterBar bus={config.bus} roles={config.roles} />

      <ChartCard title="Time-to-Hire Distribution">
        <FlatBarChart data={distribution} layout="horizontal" />
      </ChartCard>

      <ChartCard title="Aging Requisitions (open pipeline)">
        <DataTable<AgingRequisition>
          rowKey={(r) => r.id}
          emptyMessage="No open requisitions in this range."
          columns={[
            { header: "Candidate", cell: (r) => r.candidateName },
            { header: "Role", cell: (r) => r.role },
            { header: "BU", cell: (r) => r.bu },
            { header: "Days Elapsed", cell: (r) => r.daysElapsed.toFixed(0), align: "right" },
            {
              header: "Status",
              cell: (r) => (
                <StatusBadge
                  level={
                    r.daysElapsed >= warningDays * 2
                      ? "critical"
                      : r.daysElapsed >= warningDays
                        ? "warning"
                        : "good"
                  }
                />
              ),
            },
          ]}
          rows={aging}
        />
      </ChartCard>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="BU Leaderboard — Fastest to Slowest">
          <VelocityTable rows={buRanking} />
        </ChartCard>
        <ChartCard title="Role Leaderboard — Fastest to Slowest">
          <VelocityTable rows={roleRanking} />
        </ChartCard>
      </div>
    </div>
  );
}

function VelocityTable({ rows }: { rows: VelocityRanking[] }) {
  return (
    <DataTable<VelocityRanking>
      rowKey={(r) => r.key}
      emptyMessage="No completed hires in this range."
      columns={[
        { header: "#", cell: (_r, i) => i + 1 },
        { header: "Name", cell: (r) => r.key },
        { header: "Avg Days", cell: (r) => r.avgDays.toFixed(0), align: "right" },
        { header: "Hires", cell: (r) => r.count, align: "right" },
      ]}
      rows={rows}
    />
  );
}
