import { getDashboardData } from "@/lib/sheets";
import {
  applyFilters,
  averageCostOfHire,
  averageTimeToFillDays,
  averageTimeToFillWeeks,
  averageTimeToHireDays,
  costBreakdownByCategory,
  headcountByBU,
  hiringSeasonality,
  hiringSourceBreakdown,
  monthlyBreakdown,
  offerAcceptanceRate,
  pipelineByRole,
  roleConcentration,
  totalInvestmentByBU,
  totalOffersAccepted,
  totalOffersExtended,
  buVelocityRanking,
  timeToHireDistribution,
  withdrawalRate,
} from "@/lib/metrics";
import { formatCurrency } from "@/config/app.config";
import { StatTile } from "@/components/ui/StatTile";
import { ChartCard } from "@/components/charts/ChartCard";
import { DonutChart } from "@/components/charts/DonutChart";
import { FlatBarChart } from "@/components/charts/FlatBarChart";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { topNWithOther } from "@/lib/chartData";
import { OfficeSegmentCard } from "@/components/ui/OfficeSegmentCard";
import { PipelineTable } from "@/components/ui/PipelineTable";
import { categorical } from "@/components/charts/theme";

const SEGMENT_COLORS = [categorical[0], categorical[1], categorical[3], categorical[5]];

export default async function ExecutiveSummaryPage() {
  const { records, pipeline, config } = await getDashboardData();

  const acceptanceRate = offerAcceptanceRate(records);
  const avgDays = averageTimeToFillDays(records);
  const avgWeeks = averageTimeToFillWeeks(records);
  const avgCost = averageCostOfHire(records);

  const officeTypes = config.officeTypes.length > 0 ? config.officeTypes : ["Front Office", "Back Office"];
  const segments = officeTypes.map((officeType, i) => {
    const segRecords = applyFilters(records, { officeType });
    return {
      officeType,
      color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
      avgDaysToHire: averageTimeToHireDays(segRecords),
      avgDaysToFill: averageTimeToFillDays(segRecords),
      acceptanceRate: offerAcceptanceRate(segRecords),
      withdrawalRate: withdrawalRate(segRecords),
    };
  });

  const pipelineStages =
    config.pipelineStages.length > 0
      ? config.pipelineStages
      : ["Requisition", "Psychometric Assessment", "First Level with Hiring Team", "Second Level with HBUs", "Offer", "Medical", "Resumption"];
  const pipelineRows = pipelineByRole(pipeline, pipelineStages);

  const costBreakdown = costBreakdownByCategory(records).map((c) => ({
    label: c.category,
    value: c.amount,
  }));
  const buSpend = totalInvestmentByBU(records)
    .slice(0, 6)
    .map((g) => ({ label: g.key, value: g.total }));

  const monthlyCosts = monthlyBreakdown(records).map((m) => ({ period: m.month, value: m.totalCost }));
  const hiringSources = hiringSourceBreakdown(records).map((g) => ({ label: g.key, value: g.count }));

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

  const asOf = new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" });
  const quarter = `Q${Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}`;

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] pb-6">
        <div>
          <span className="inline-block rounded-full bg-[var(--series-1)] px-3 py-1 text-xs font-semibold text-white">
            {quarter}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-[var(--text-primary)]">Recruitment Dashboard</h1>
        </div>
        <span className="text-sm text-[var(--text-muted)]">As of {asOf}</span>
      </header>

      <section>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatTile label="Total Offers Extended" value={String(totalOffersExtended(records))} />
          <StatTile label="Total Offers Accepted" value={String(totalOffersAccepted(records))} />
          <StatTile
            label="Average Time to Fill"
            value={avgWeeks == null ? "—" : `${avgWeeks.toFixed(1)} weeks`}
            sublabel={avgDays == null ? undefined : `${avgDays.toFixed(0)} days`}
          />
          <StatTile
            label="Average Cost of Hire"
            value={avgCost == null ? "—" : formatCurrency(avgCost)}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Hiring by Office</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {segments.map((s) => (
            <OfficeSegmentCard
              key={s.officeType}
              title={`${s.officeType} Hiring`}
              accentColor={s.color}
              avgDaysToHire={s.avgDaysToHire}
              avgDaysToFill={s.avgDaysToFill}
              acceptanceRate={s.acceptanceRate}
              withdrawalRate={s.withdrawalRate}
            />
          ))}
        </div>
      </section>

      <section>
        <ChartCard title="Current Hiring Pipeline">
          <PipelineTable rows={pipelineRows} stages={pipelineStages} />
        </ChartCard>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Financial Snapshot</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <ChartCard title="Cost Breakdown by Category">
            <DonutChart data={costBreakdown} valueFormat="currency" />
          </ChartCard>
          <ChartCard title="Total Recruitment Investment by BU">
            <FlatBarChart data={buSpend} valueFormat="currency" />
          </ChartCard>
          <ChartCard title="Recruitment Costs">
            <TrendLineChart data={monthlyCosts} valueFormat="currency" />
          </ChartCard>
          <ChartCard title="Top Hiring Sources">
            <FlatBarChart data={hiringSources} layout="horizontal" />
          </ChartCard>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Efficiency Snapshot</h2>
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
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Demographics Snapshot</h2>
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
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Trend Snapshot</h2>
        <ChartCard title="Hiring Seasonality">
          <TrendLineChart data={seasonality} />
        </ChartCard>
      </section>
    </div>
  );
}
