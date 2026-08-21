# Data Schema — Google Sheet

Single source of truth: a Google Sheet with two tabs.

## Tab 1: `Hires` (main data)

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

### Row semantics change

Previously every row implicitly meant "a completed hire." With `Offer Status` added, a row now means **"an offer extended to a candidate"** — outcome may still be open (`Pending`). This is what makes Offer Acceptance Rate computable, but it also means:

- `Resumption Date` and the three cost fields are legitimately blank for non-Accepted rows — don't treat blanks there as data-entry errors.
- Any metric about *hires* (time-to-fill, cost-of-hire, headcount, role/BU demographics) must filter to `Offer Status = Accepted` before aggregating. Metrics about the *pipeline* (acceptance rate, aging requisitions) use the full row set.

## Tab 2: `Config` (lookup lists — prevents hardcoding in the app)

| Column | Purpose |
|---|---|
| `BUs` | Canonical list of Business Units, used to populate dropdowns/filters and validate the `Hires.BU` column. |
| `Roles` | Canonical list of Roles, same purpose. |
| `OfferStatuses` | Fixed list: `Accepted`, `Declined`, `Pending`, `Withdrawn`. Kept in the sheet (not hardcoded in code) so HR can add a status like `Rescinded` without a code change. |

The app reads this tab at the same time as `Hires` and uses it to drive every dropdown, filter, and category label in the UI — no BU/Role/Status list lives in the codebase.

## Open items to apply directly in the sheet (not code)

1. Add `ID`, `Offer Status`, `Offer Extended Date` columns to `Hires`.
2. Backfill `Offer Status = Accepted` for all existing rows.
3. Create the `Config` tab with your actual BU and Role lists.
4. Add Sheets **Data Validation** (dropdown) on `BU`, `Role`, and `Offer Status` columns pointing at the `Config` tab ranges — this keeps manual entry consistent even before the admin UI exists in Phase 2.
