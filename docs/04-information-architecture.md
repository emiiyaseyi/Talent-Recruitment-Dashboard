# Information Architecture

## Executive Summary (landing page)

Built as a single scrolling page (not literal paginated slides — that idea was superseded once the branded template layout came in, which is denser and reads fine as one continuous page). No drill-down interaction — this page is for a glance, not analysis. Every number pulls from the same computed metrics as the detail pages (no separate summary logic). Sections, top to bottom:

1. **Header** — quarter badge (auto-computed from today's date) + page title + "as of" date.
2. **Top-line KPIs** — stat tiles: Total Offers Extended, Total Offers Accepted, Average Time to Fill (days & weeks), Average Cost of Hire.
3. **Hiring by Office** — one card per `Config!OfficeTypes` entry (Front Office / Back Office), each showing Average Days to Hire, Average Days to Fill, Offer Acceptance Rate, and Withdrawal Rate as circular badge/ring stats — the template's Technical/Non-Technical pattern, adapted to the org's actual categories.
4. **Current Hiring Pipeline** — table of open roles × pipeline stages, sourced from the `Pipeline` tab.
5. **Financial snapshot** — cost breakdown pie (Medical/Airtime/Feeding), total spend by BU, monthly recruitment costs trend, top hiring sources.
6. **Efficiency snapshot** — time-to-hire distribution histogram + fastest/slowest BU leaderboard (top 3).
7. **Demographics snapshot** — headcount by BU bar + top 5 roles by concentration.
8. **Trend snapshot** — hiring seasonality line.

### Visual design

Dark, branded theme (navy page/card surfaces, purple/teal/amber/blue/red/magenta accents) adapted from a reference template rather than the neutral palette originally scaffolded — see `app/globals.css` for the fixed (non-toggling) color tokens and `components/charts/theme.ts` for why chart marks use literal hex rather than `var(--x)` (Recharts doesn't reliably resolve CSS custom properties when they're set as raw SVG `fill`/`stroke` attributes on root shapes — confirmed by screenshot testing; regular CSS/Tailwind classes on non-chart elements are unaffected and still use the `var()` tokens).

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
