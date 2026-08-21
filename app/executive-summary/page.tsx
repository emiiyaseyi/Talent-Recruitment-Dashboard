import { getDashboardData } from "@/lib/sheets";
import {
  averageCostOfHire,
  averageTimeToFillDays,
  averageTimeToFillWeeks,
  costBreakdownByCategory,
  headcountByBU,
  hiringSeasonality,
  offerAcceptanceRate,
  roleConcentration,
  totalInvestmentByBU,
  totalOffersAccepted,
  totalOffersExtended,
  buVelocityRanking,
  timeToHireDistribution,
} from "@/lib/metrics";
import { formatCurrency } from "@/config/app.config";
import { StatTile } from "@/components/ui/StatTile";
import { ChartCard } from "@/components/charts/ChartCard";
import { DonutChart } from "@/components/charts/DonutChart";
import { FlatBarChart } from "@/components/charts/FlatBarChart";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { topNWithOther } from "@/lib/chartData";

export default async function ExecutiveSummaryPage() {
  const { records } = await getDashboardData();

  const acceptanceRate = offerAcceptanceRate(records);
  const avgDays = averageTimeToFillDays(records);
  const avgWeeks = averageTimeToFillWeeks(records);
  const avgCost = averageCostOfHire(records);

  const costBreakdown = costBreakdownByCategory(records).map((c) => ({
    label: c.category,
    value: c.amount,
  }));
  const buSpend = totalInvestmentByBU(records)
    .slice(0, 6)
    .map((g) => ({ label: g.key, value: g.total }));

  const distribution = timeToHireDistribution(records).map((b) => ({
    label: b.label,
    value: b.count,
  }));
  const buVelocity = buVelocityRanking(records).slice(0, 3);

  const headcount = topNWithOther(headcountByBU(records), 6).map((g) => ({
    label: g.key,
    value: g.count,
  }));
  const topRoles = topNWithOther(roleConcentration(records), 5).map((g) => ({
    label: g.key,
    value: g.count,
  }));

  const seasonality = hiringSeasonality(records).map((p) => ({
    period: p.period,
    value: p.count,
  }));

  return (
    <div className="space-y-16">
      <section>
        <h2 className="mb-6 text-lg font-semibold">Top-line KPIs</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <StatTile label="Total Offers Extended" value={String(totalOffersExtended(records))} />
          <StatTile label="Total Offers Accepted" value={String(totalOffersAccepted(records))} />
          <StatTile
            label="Offer Acceptance Rate"
            value={acceptanceRate == null ? "—" : `${(acceptanceRate * 100).toFixed(0)}%`}
            sublabel="Excludes still-pending offers"
          />
          <StatTile
            label="Average Time to Fill"
            value={avgDays == null ? "—" : `${avgDays.toFixed(0)} days`}
            sublabel={avgWeeks == null ? undefined : `${avgWeeks.toFixed(1)} weeks`}
          />
          <StatTile
            label="Average Cost of Hire"
            value={avgCost == null ? "—" : formatCurrency(avgCost)}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-lg font-semibold">Financial Snapshot</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <ChartCard title="Cost Breakdown by Category">
            <DonutChart data={costBreakdown} valueFormat="currency" />
          </ChartCard>
          <ChartCard title="Total Recruitment Investment by BU">
            <FlatBarChart data={buSpend} valueFormat="currency" />
          </ChartCard>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-lg font-semibold">Efficiency Snapshot</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <ChartCard title="Time-to-Hire Distribution">
            <FlatBarChart data={distribution} layout="horizontal" />
          </ChartCard>
          <ChartCard title="Fastest BUs to Onboard (top 3)">
            <ul className="space-y-3">
              {buVelocity.map((v, i) => (
                <li key={v.key} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">
                    {i + 1}. {v.key}
                  </span>
                  <span className="tabular-nums text-[var(--text-primary)]">
                    {v.avgDays.toFixed(0)} days avg ({v.count} hires)
                  </span>
                </li>
              ))}
              {buVelocity.length === 0 && (
                <p className="text-sm text-[var(--text-muted)]">No completed hires yet.</p>
              )}
            </ul>
          </ChartCard>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-lg font-semibold">Demographics Snapshot</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <ChartCard title="Headcount by BU">
            <FlatBarChart data={headcount} />
          </ChartCard>
          <ChartCard title="Top Roles by Concentration">
            <FlatBarChart data={topRoles} />
          </ChartCard>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-lg font-semibold">Trend Snapshot</h2>
        <ChartCard title="Hiring Seasonality">
          <TrendLineChart data={seasonality} />
        </ChartCard>
      </section>
    </div>
  );
}
