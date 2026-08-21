# Information Architecture

## Executive Summary (landing page — "slides")

A scroll- or arrow-key-paginated sequence of dense summary slides, one screen each, no drill-down interaction — this page is for a glance, not analysis. Each slide pulls from the same computed metrics as the detail pages (no separate summary logic).

1. **Top-line KPIs** — stat tiles: Total Offers Extended, Total Offers Accepted, Offer Acceptance Rate, Average Time to Fill (days & weeks), Average Cost of Hire.
2. **Financial snapshot** — cost breakdown pie (Medical/Airtime/Feeding) + total spend by BU bar, compact versions of the Financial Insights page charts.
3. **Efficiency snapshot** — time-to-hire distribution histogram + fastest/slowest BU leaderboard (top 3 each).
4. **Demographics snapshot** — headcount by BU bar + top 5 roles by concentration.
5. **Trend snapshot** — hiring seasonality line + current month's row from the monthly breakdown table.

## Menu (detail pages)

Left nav, persistent across pages. A shared filter bar (date range, BU, Role) sits above all detail pages and drives every chart on that page — filters do not carry across pages by default (each page's analysis is independent), but this is worth revisiting once real usage shows whether people expect persistence.

### Financial Insights
- Cost Breakdown by Category (pie)
- Total Recruitment Investment by BU (bar)
- Cost per Hire by Role (bar, sorted)
- Cost per Hire Trend over time (line)

### BU & Role Demographics
- Headcount by BU (bar)
- Role Concentration (treemap or ranked list)
- Hiring Seasonality (line, monthly/quarterly toggle)
- Monthly Breakdown (table: offers extended/accepted/declined, avg time to fill, total cost per month)

### Efficiency & Velocity Metrics
- Time-to-Hire Distribution (histogram: 0–2wk / 2–4wk / 4+wk)
- Aging Requisitions — open pipeline (table, sorted by days elapsed, for `Offer Status = Pending` rows)
- Fastest / Slowest BUs (leaderboard)
- Fastest / Slowest Roles (leaderboard)

All formulas behind these charts are defined once in [02-metrics-dictionary.md](02-metrics-dictionary.md); this file only maps them to pages/layout.
