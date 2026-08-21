import { getDashboardData } from "@/lib/sheets";
import { parseFilters, type SearchParams } from "@/lib/filters";
import {
  applyFilters,
  headcountByBU,
  hiringSeasonality,
  monthlyBreakdown,
  roleConcentration,
} from "@/lib/metrics";
import { formatCurrency } from "@/config/app.config";
import { FilterBar } from "@/components/ui/FilterBar";
import { ChartCard } from "@/components/charts/ChartCard";
import { FlatBarChart } from "@/components/charts/FlatBarChart";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { DataTable } from "@/components/ui/DataTable";
import { topNWithOther } from "@/lib/chartData";
import type { MonthlyBreakdownRow } from "@/lib/metrics";

export default async function BuRoleDemographicsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { records, config } = await getDashboardData();
  const filters = parseFilters(await searchParams);
  const filtered = applyFilters(records, filters);

  const headcount = headcountByBU(filtered).map((g) => ({ label: g.key, value: g.count }));
  const roles = topNWithOther(roleConcentration(filtered), 10).map((g) => ({
    label: g.key,
    value: g.count,
  }));
  const seasonality = hiringSeasonality(filtered).map((p) => ({
    period: p.period,
    value: p.count,
  }));
  const monthly = monthlyBreakdown(filtered);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">BU &amp; Role Demographics</h1>
      <FilterBar bus={config.bus} roles={config.roles} />

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Headcount by BU">
          <FlatBarChart data={headcount} />
        </ChartCard>
        <ChartCard title="Role Concentration">
          <FlatBarChart data={roles} />
        </ChartCard>
      </div>

      <ChartCard title="Hiring Seasonality">
        <TrendLineChart data={seasonality} />
      </ChartCard>

      <ChartCard title="Monthly Breakdown">
        <DataTable<MonthlyBreakdownRow>
          rowKey={(r) => r.month}
          emptyMessage="No offers in this range."
          columns={[
            { header: "Month", cell: (r) => r.month },
            { header: "Offers Extended", cell: (r) => r.offersExtended, align: "right" },
            { header: "Accepted", cell: (r) => r.accepted, align: "right" },
            { header: "Declined", cell: (r) => r.declined, align: "right" },
            {
              header: "Avg Time to Fill",
              cell: (r) => (r.avgTimeToFillDays == null ? "—" : `${r.avgTimeToFillDays.toFixed(0)}d`),
              align: "right",
            },
            { header: "Total Cost", cell: (r) => formatCurrency(r.totalCost), align: "right" },
          ]}
          rows={monthly}
        />
      </ChartCard>
    </div>
  );
}
