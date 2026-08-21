# Talent-Recruitment-Dashboard

A Talent Acquisition Dashboard backed by Google Sheets, deployed on Vercel.

## Docs

- [Data Schema](docs/01-data-schema.md) — Google Sheet structure, required columns, what's changing
- [Metrics Dictionary](docs/02-metrics-dictionary.md) — every KPI's exact formula and edge cases
- [Architecture](docs/03-architecture.md) — stack, data flow, auth, no-hardcoding principle
- [Information Architecture](docs/04-information-architecture.md) — page/menu map
- [Roadmap](docs/05-roadmap.md) — phased build plan

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in real values, see below
npm run dev
```

Without Google Sheets credentials configured, the app falls back to bundled sample data in development (see `lib/sampleData.ts`) so the UI can be reviewed before the real sheet is wired up. That fallback is disabled in production — a production deploy without credentials will fail loudly instead of silently showing fake numbers.

### Environment variables

See `.env.local.example`. You'll need:

- A Google Cloud **service account** with the Sheets API enabled, shared as Editor on your sheet (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`).
- A Google OAuth client for sign-in (`GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`), plus `AUTH_SECRET` (generate with `npx auth secret`) and `ALLOWED_EMAIL_DOMAIN` to restrict sign-in to your company domain.

### Sheet setup

Your Google Sheet needs the columns and `Config` tab described in [01-data-schema.md](docs/01-data-schema.md) — this includes new columns (`ID`, `Offer Status`, `Offer Extended Date`) beyond what you're tracking today. See [05-roadmap.md](docs/05-roadmap.md) Phase 0 for the exact setup checklist.

## Docs