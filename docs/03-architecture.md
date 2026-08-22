# Architecture

## Stack

- **Framework:** Next.js (App Router) + TypeScript, deployed on Vercel.
- **Styling:** Tailwind CSS.
- **Charts:** Recharts (SVG, composable, plays well with Tailwind theming). Chart-specific design decisions (color palette, accessibility, layout) follow the project's `dataviz` skill at build time rather than being decided ad hoc per chart.
- **Data source:** Google Sheets API v4, via a Google Cloud **service account** (not OAuth-per-user) — the service account is shared with edit access to the sheet, and its credentials live only in Vercel environment variables, never in the repo.
- **Auth:** dashboard requires login from day one (confirmed). NextAuth.js (Auth.js v5) with Google OAuth, restricted via an exact-email allowlist (`ALLOWED_EMAILS`) and/or a company Workspace domain (`ALLOWED_EMAIL_DOMAIN`) — no passwords to manage. The allowlist matters specifically when the sheet owner signs in with a personal Gmail account: restricting by `@gmail.com` would admit anyone with a Gmail account, not just you, since that domain isn't actually owned by you.

## Why service account, not the Sheets "publish to web" / CSV approach

CSV export or `gviz` public-sheet reads are read-only and require the sheet to be publicly link-shared. Since Phase 2 is admin write-back, and since the cost data here is sensitive, the service-account approach is the only one of the three that supports authenticated read **and** write against a private sheet — worth setting up once now rather than migrating later.

## Data flow

1. Next.js server (Route Handler or Server Component) authenticates to the Sheets API with the service account and pulls both tabs: `Hires` and `Config`.
2. Raw rows are parsed into a typed `HireRecord[]` (see `lib/types.ts`) — this is the one place spreadsheet-row shape gets translated into app types. Nothing downstream touches raw cell values.
3. All KPI/chart numbers are derived by calling functions in `lib/metrics.ts`, which implements exactly the formulas in [02-metrics-dictionary.md](02-metrics-dictionary.md). Components receive computed numbers as props; they never aggregate raw rows themselves.
4. Pages are cached via Next.js ISR (`revalidate`, e.g. every 5–10 minutes) rather than hitting the Sheets API on every request — Sheets API has per-user rate limits, and dashboard data doesn't need to be second-fresh. A manual "Refresh now" action can trigger on-demand revalidation for anyone who just edited the sheet and wants to see it immediately.

## No-hardcoding principle (what this means concretely)

You asked for no hardcoding — here's how that's enforced structurally, not just as a rule someone has to remember:

| Instead of… | …the app reads from |
|---|---|
| A `BU` array pasted into a component | `Config!BUs` (fetched at request time, same call as the hires data) |
| A `Role` array pasted into a component | `Config!Roles` |
| Offer status options hardcoded in a `<select>` | `Config!OfferStatuses` |
| Currency symbol, company name, page titles typed into JSX | `config/app.config.ts` — one small file of true constants that aren't spreadsheet data (things like "₦" or the app's display name) |
| A metric formula duplicated per chart | `lib/metrics.ts` — single implementation per metric, per [02-metrics-dictionary.md](02-metrics-dictionary.md) |
| Chart colors picked per-chart | A single palette module, assigned by category name, not by chart |

The dividing line: **spreadsheet-shaped data** (BUs, roles, statuses, the records themselves) always comes from the Sheet at request time. **App-shaped constants** (currency symbol, nav labels, thresholds like "what counts as a slow hire") live in one config file, not scattered through components.

## Environment variables (Vercel)

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SHEET_ID`
- `NEXTAUTH_SECRET`, plus provider-specific vars once auth approach is finalized

None of these are committed to the repo; a `.env.local.example` documents the shape without real values.

## Folder structure (proposed)

```
/app
  /executive-summary        → default landing page, "slides" view
  /financial-insights
  /bu-role-demographics
  /efficiency-velocity
  /api/revalidate            → manual refresh endpoint
/lib
  sheets.ts                  → Google Sheets client, raw fetch + parse
  metrics.ts                 → every formula from 02-metrics-dictionary.md
  types.ts                   → HireRecord, ConfigLists, etc.
/config
  app.config.ts               → non-spreadsheet constants (currency, labels, thresholds)
/components
  charts/                     → one component per chart type, styled per dataviz skill
  ui/                          → stat tiles, filter bar, nav
/docs                          → this documentation set
```

## Phase 2 note (admin write-back, not built now)

Write-back needs the `ID` column (see schema doc) to target specific rows reliably, plus write scope on the service account (already covered by using a service account from the start). Auth already being in place from Phase 1 means Phase 2 just adds authorization (who's allowed to write, not just view) rather than bolting on auth from scratch.
