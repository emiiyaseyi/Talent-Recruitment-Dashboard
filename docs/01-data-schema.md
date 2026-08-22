# Data Schema — Google Sheet

Single source of truth: a Google Sheet with three tabs — `Hires`, `Pipeline`, `Config`.

## Tab 1: `Hires` (completed offers — Accepted/Declined/Withdrawn)

| Column               | Type                                          | Required                    | Status      | Notes |
|----------------------|------------------------------------------------|------------------------------|-------------|-------|
| `ID`                 | text (UUID)                                   | yes                          | **NEW**     | Stable row identifier. Sheets API addresses rows by index, which shifts on sort/insert/delete — a stable ID is required before any write-back (Phase 2 admin) can safely target a specific row. Generate on creation, never edit. |
| `Candidate Name`     | text                                           | yes                          | existing    | |
| `Role`               | text                                           | yes                          | existing    | Should match an entry in `Config!Roles` (see below) for clean grouping — free text drifts (e.g. "Frontend Dev" vs "Frontend Developer" split what should be one bar). |
| `BU`                 | text                                           | yes                          | existing    | Should match `Config!BUs`, same reasoning. |
| `Requisition Start Date` | date (YYYY-MM-DD)                         | yes                          | existing    | |
| `Offer Status`       | enum: `Accepted` / `Declined` / `Pending` / `Withdrawn` | yes                | **NEW**     | Drives Offer Acceptance Rate. Backfill existing rows as `Accepted` (they already have resumption dates, i.e. completed hires). |
| `Offer Extended Date`| date (YYYY-MM-DD)                             | optional                     | **NEW**     | Not required now. Adding it costs nothing and unlocks a future "time to decision" metric (Offer Extended → Resumption). Leave blank if unknown. |
| `Resumption Date`    | date (YYYY-MM-DD)                             | required only if `Offer Status = Accepted` | existing | Blank for Declined/Pending/Withdrawn. |
| `Time to Hire (week)`| number                                        | optional, informational only | existing    | Kept for manual cross-reference, but the app **computes** time-to-hire from dates rather than trusting this field (per your decision — manual entry drifts from the actual dates over time). If the two disagree by more than a set threshold, the dashboard should flag the row rather than silently pick one. |
| `Pre-employment Medical Test` | currency number (₦)                 | conditional                  | existing    | Confirmed as a **cost figure**, not a status. Blank/0 for non-Accepted rows (cost isn't incurred until onboarding proceeds). |
| `Airtime`            | currency number (₦)                           | conditional                  | existing    | Same as above. |
| `Feeding`            | currency number (₦)                           | conditional                  | existing    | Same as above. |
| `Total Cost`         | currency number (₦)                           | existing, but not trusted    | existing    | The app **recomputes** this as `Medical + Airtime + Feeding` rather than reading the manual column, same rationale as Time to Hire. Flag mismatches instead of silently overriding, so bad manual entries surface instead of hiding. |
| `Office Type`        | text                                           | recommended                  | **NEW**     | `Front Office` / `Back Office` (or whatever `Config!OfficeTypes` defines) — replaces the generic technical/non-technical split. Drives the "Hiring by Office" section on the executive summary. Blank rows are simply excluded from that split. |
| `Hiring Source`      | text                                           | optional                     | **NEW**     | Where the candidate came from (Referral, LinkedIn, Job Board, …) — should match `Config!HiringSources`. Drives the "Top Hiring Sources" chart. |

### Row semantics change

Previously every row implicitly meant "a completed hire." With `Offer Status` added, a row now means **"an offer extended to a candidate"** — outcome may still be open (`Pending`). This is what makes Offer Acceptance Rate computable, but it also means:

- `Resumption Date` and the three cost fields are legitimately blank for non-Accepted rows — don't treat blanks there as data-entry errors.
- Any metric about *hires* (time-to-fill, cost-of-hire, headcount, role/BU demographics) must filter to `Offer Status = Accepted` before aggregating. Metrics about the *pipeline* (acceptance rate, aging requisitions) use the full row set.

## Tab 2: `Pipeline` (open roles — candidates still in progress)

A separate tab from `Hires` (your call — cleaner separation between "what's open" and "what's done," at the cost of the admin UI eventually needing to write to two sheets). A row here means "a candidate currently moving through the funnel for an open requisition."

| Column | Type | Required | Notes |
|---|---|---|---|
| `ID` | text | yes | Same role as `Hires.ID` — stable identifier for future write-back. |
| `Candidate Name` | text | yes | |
| `Role` | text | yes | Should match `Config!Roles`. |
| `BU` | text | yes | Should match `Config!BUs`. |
| `Office Type` | text | recommended | Should match `Config!OfficeTypes`. |
| `Hiring Source` | text | optional | Should match `Config!HiringSources`. |
| `Requisition Start Date` | date | yes | Drives "days elapsed" for aging-pipeline views. |
| `Current Stage` | text | yes | Should match `Config!PipelineStages` — this is what populates the "Current Hiring Pipeline" table (one column per stage, one row per role, counting candidates at each stage). |

When a candidate resolves (accepted, declined, or withdrawn), they move from `Pipeline` to `Hires` — there's no automatic migration between the two tabs yet (that's a Phase 2 write-back concern); for now it's a manual cut-and-paste when a candidate's outcome is decided.

## Tab 3: `Config` (lookup lists — prevents hardcoding in the app)

| Column | Purpose |
|---|---|
| `BUs` | Canonical list of Business Units, used to populate dropdowns/filters and validate the `BU` columns. |
| `Roles` | Canonical list of Roles, same purpose. |
| `OfferStatuses` | Fixed list: `Accepted`, `Declined`, `Pending`, `Withdrawn`. Kept in the sheet (not hardcoded in code) so HR can add a status like `Rescinded` without a code change. |
| `OfficeTypes` | `Front Office`, `Back Office` (or your actual categories, if they change). |
| `HiringSources` | Your actual candidate sources — currently seeded with placeholders (Referral, LinkedIn, Job Board, Agency, Direct) until you provide the real list. Editing this column is enough; no code change needed. |
| `PipelineStages` | Your actual hiring funnel stages, in order: `Requisition`, `Psychometric Assessment`, `First Level with Hiring Team`, `Second Level with HBUs`, `Offer`, `Medical`, `Resumption`. Admin-editable by design — the pipeline table's columns are generated from whatever's in this list, not hardcoded. |

The app reads this tab at the same time as `Hires`/`Pipeline` and uses it to drive every dropdown, filter, and category label in the UI — no BU/Role/Status/OfficeType/Source/Stage list lives in the codebase.

## Open items to apply directly in the sheet (not code)

1. Add `ID`, `Offer Status`, `Offer Extended Date`, `Office Type`, `Hiring Source` columns to `Hires`.
2. Backfill `Offer Status = Accepted` for all existing rows; fill in `Office Type` per row.
3. Create the `Pipeline` tab with the columns above.
4. Extend the `Config` tab with `OfficeTypes`, `HiringSources`, `PipelineStages`.
5. Add Sheets **Data Validation** (dropdown) on every text column above pointing at its `Config` tab range — keeps manual entry consistent even before the admin UI exists in Phase 2.
