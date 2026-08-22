import { getDashboardData } from "@/lib/sheets";
import { parseFilters, type SearchParams } from "@/lib/filters";
import {
  applyFilters,
  costBreakdownByCategory,
  costPerHireByRole,
  costPerHireTrend,
  totalInvestmentByBU,
} from "@/lib/metrics";
import { FilterBar } from "@/components/ui/FilterBar";
import { ChartCard } from "@/components/charts/ChartCard";
import { DonutChart } from "@/components/charts/DonutChart";
import { FlatBarChart } from "@/components/charts/FlatBarChart";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { Wallet, Landmark, Users, TrendingUp } from "lucide-react";

export default async function FinancialInsightsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { records, config } = await getDashboardData();
  const filters = parseFilters(await searchParams);
  const filtered = applyFilters(records, filters);

  const breakdown = costBreakdownByCategory(filtered).map((c) => ({
    label: c.category,
    value: c.amount,
  }));
  const byBU = totalInvestmentByBU(filtered).map((g) => ({ label: g.key, value: g.total }));
  const byRole = costPerHireByRole(filtered).map((g) => ({
    label: g.key,
    value: g.avg,
    note: `n=${g.count}`,
  }));
  const trend = costPerHireTrend(filtered).map((p) => ({ period: p.month, value: p.value }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Financial Insights</h1>
      <FilterBar bus={config.bus} roles={config.roles} officeTypes={config.officeTypes} />

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Cost Breakdown by Category" icon={Wallet} iconColor="var(--series-5)">
          <DonutChart data={breakdown} valueFormat="currency" />
        </ChartCard>
        <ChartCard title="Total Recruitment Investment by BU" icon={Landmark} iconColor="var(--series-1)">
          <FlatBarChart data={byBU} valueFormat="currency" />
        </ChartCard>
        <ChartCard title="Cost per Hire by Role" icon={Users} iconColor="var(--series-2)">
          <FlatBarChart data={byRole} valueFormat="currency" />
        </ChartCard>
        <ChartCard title="Cost per Hire Trend" icon={TrendingUp} iconColor="var(--series-4)">
          <TrendLineChart data={trend} valueFormat="currency" />
        </ChartCard>
      </div>
    </div>
  );
}
