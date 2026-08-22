# Metrics Dictionary

Every number the dashboard shows is defined here once. Components must call a shared function (see `lib/metrics.ts` in [03-architecture.md](03-architecture.md)) rather than recomputing formulas inline — this file is the spec for that module.

Notation: `rows` = all records from `Hires`. `hires` = `rows` filtered to `Offer Status = Accepted`.

## Executive Summary (top-line)

| Metric | Formula | Notes / edge cases |
|---|---|---|
| **Total Offers Extended** | `count(rows)` | Base denominator for acceptance rate. |
| **Total Offers Accepted** | `count(hires)` | |
| **Offer Acceptance Rate** | `count(hires) / count(rows where Offer Status != Pending)` | **Assumption, please confirm during review:** `Pending` rows are excluded from the denominator because their outcome isn't known yet — including them would understate the rate for a currently-open pipeline. If you'd rather include Pending in the denominator (i.e. "rate right now, including unresolved"), that's a one-line change in the formula module, flag it and I'll swap it. |
| **Average Time to Fill (days)** | `avg(Resumption Date − Requisition Start Date)` over `hires` with both dates present | Rows missing either date are excluded, not treated as 0. |
| **Average Time to Fill (weeks)** | `avg time to fill (days) / 7` | Derived from the days figure, not averaged separately, so the two numbers can never disagree. |
| **Average Cost of Hire** | `avg(Total Cost)` over `hires` | Total Cost = Medical + Airtime + Feeding (computed, see schema doc). |
| **Withdrawal Rate** | `count(Withdrawn) / count(rows where Offer Status != Pending)` | Same denominator convention as Offer Acceptance Rate, so the two are directly comparable. |
| **Average Days to Hire** | `avg(Offer Extended Date − Requisition Start Date)` over `hires` with `Offer Extended Date` present | Distinct from Time to Fill — this is "offer accepted," not "candidate resumed." Approximated from `Offer Extended Date` since there's no separate acceptance-date field; will read as `—` for most historical rows since that field is usually blank. |
| **Hiring by Office** | All of the above (Days to Hire, Days to Fill, Acceptance Rate, Withdrawal Rate), recomputed once per `Office Type` in `Config!OfficeTypes` | Splits the executive summary into one card per office type, mirroring the template's Technical/Non-Technical split. Rows with a blank `Office Type` are excluded from every segment (not silently bucketed into one). |

## Pipeline (open roles)

| Metric | Formula | Chart |
|---|---|---|
| **Current Hiring Pipeline** | `count(Pipeline rows)` grouped by `Role` × `Current Stage` | Table — one row per role, one column per stage (from `Config!PipelineStages`), a total column. Stage set is config-driven, not hardcoded, since stages are meant to be admin-editable. |
| **Pipeline Aging** | `today − Requisition Start Date` per `Pipeline` row | Same shape as the old Hires-based aging metric, now sourced from the dedicated `Pipeline` tab instead of `Offer Status = Pending` rows in `Hires`. |

## Financial Insights

| Metric | Formula | Chart |
|---|---|---|
| **Cost Breakdown by Category** | `sum(Medical)`, `sum(Airtime)`, `sum(Feeding)` over `hires`, each as % of their sum | Pie/donut |
| **Total Recruitment Investment by BU** | `sum(Total Cost)` grouped by `BU`, over `hires` | Bar |
| **Cost per Hire by Role** | `avg(Total Cost)` grouped by `Role`, over `hires`; show n per role since small samples are noisy | Bar, sorted descending |
| **Cost per Hire Trend** | `avg(Total Cost)` grouped by month of `Resumption Date` | Line — bonus metric beyond your original list, shows whether cost-per-hire is rising or falling over time |
| **Recruitment Costs (monthly)** | `sum(Total Cost)` grouped by month of `Requisition Start Date`, over `hires` | Bar/line — total spend per month, template's "Recruitment Costs" chart. |
| **Top Hiring Sources** | `count(hires)` grouped by `Hiring Source`, sorted descending | Bar — rows with a blank `Hiring Source` are excluded rather than counted as a category. |

## Efficiency & Velocity Metrics

| Metric | Formula | Chart |
|---|---|---|
| **Onboarding Cycle Time** | `Resumption Date − Requisition Start Date` per row, then averaged | Same underlying number as "time to fill," reframed as a bottleneck-diagnosis metric rather than a summary stat |
| **Aging Requisitions (open pipeline)** | For rows where `Offer Status = Pending`: `today − Requisition Start Date` | Table/list, sorted descending — this is a distinct metric from time-to-fill: it's elapsed time on *still-open* requisitions, not closed ones. Surfaces bottlenecks in real time rather than only in hindsight. |
| **Time-to-Hire Distribution** | Bucket each `hires` row's time-to-fill (weeks) into `0–2`, `2–4`, `4+` | Histogram |
| **Fastest / Slowest BUs** | `avg(time to fill days)` grouped by `BU`, over `hires`, ranked ascending | Leaderboard/table |
| **Fastest / Slowest Roles** | Same, grouped by `Role` | Leaderboard/table — bonus, mirrors the BU leaderboard |

## BU & Role Demographics

| Metric | Formula | Chart |
|---|---|---|
| **Headcount by BU** | `count(hires)` grouped by `BU` | Bar |
| **Role Concentration** | `count(hires)` grouped by `Role`, sorted descending | Treemap or ranked list |
| **Hiring Seasonality** | `count(hires)` grouped by month (or quarter) of `Resumption Date` | Line |
| **Monthly Breakdown** | Per calendar month: offers extended, accepted, declined, avg time to fill, total cost | Table — this directly answers your "monthly breakdown" ask as one combined view rather than scattering it across other charts |

## Possible future metrics (not built now — data doesn't support them yet)

These came up while reviewing your columns. Not recommending you build them now, just flagging what additional data would unlock:

- **Decline reason analysis** — needs a `Decline Reason` field on non-Accepted rows. Useful for comp/offer-competitiveness signals.
- **Recruiter/owner performance** — needs a `Recruiter` column. Useful once the admin UI exists and multiple people log hires.
- **Data completeness score** — % of rows missing required fields. More useful once entry moves to the admin UI (Phase 2), since that's when you can enforce it going forward and audit the backlog.
