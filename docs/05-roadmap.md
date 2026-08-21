# Roadmap

## Phase 0 — Sheet setup (no code)
- Add `ID`, `Offer Status`, `Offer Extended Date` columns to `Hires`.
- Backfill `Offer Status = Accepted` on all existing rows.
- Create the `Config` tab (`BUs`, `Roles`, `OfferStatuses`).
- Add dropdown data validation on `BU` / `Role` / `Offer Status` in `Hires`, sourced from `Config`.
- Create the Google Cloud service account, share the sheet with its email (Editor access, ready for Phase 2 even though Phase 1 only reads).

## Phase 1 — Read-only dashboard
- Next.js + TypeScript scaffold, deployed to Vercel.
- Auth gate (NextAuth, domain-restricted Google OAuth or credentials fallback).
- `lib/sheets.ts` read integration + ISR caching.
- `lib/metrics.ts` implementing every formula in the metrics dictionary.
- Executive Summary (slides) + 3 menu pages (Financial Insights, BU & Role Demographics, Efficiency & Velocity).
- Shared filter bar (date range, BU, Role) on detail pages.

## Phase 2 — Admin write-back
- Authenticated admin route(s) for add/edit/delete on `Hires` rows, writing through the Sheets API using the `ID` column to target rows.
- Form-level validation mirroring the schema doc (required fields, conditional requirements like Resumption Date only for Accepted).
- Authorization layer: who can write vs. who can only view.

## Phase 3 — Optional / as-needed
- Export (PDF/Excel) of executive summary or any detail page.
- Alerting on aging requisitions past a configurable threshold.
- Additional data fields if you start capturing them: decline reasons, recruiter/owner, salary band — each unlocks a metric noted as "future" in the metrics dictionary.
