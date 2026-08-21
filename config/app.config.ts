// Non-spreadsheet constants only. Anything BU/Role/Status-shaped comes from
// the Google Sheet `Config` tab at request time (see lib/sheets.ts) — it does
// not belong in this file. See docs/03-architecture.md, "No-hardcoding principle".

export const appConfig = {
  appName: "Talent Acquisition Dashboard",
  currencySymbol: "₦",
  currencyCode: "NGN",
  locale: "en-NG",

  nav: [
    { href: "/executive-summary", label: "Executive Summary" },
    { href: "/financial-insights", label: "Financial Insights" },
    { href: "/bu-role-demographics", label: "BU & Role Demographics" },
    { href: "/efficiency-velocity", label: "Efficiency & Velocity" },
  ],

  /** Sheets API data is cached this long before Next.js revalidates it. */
  revalidateSeconds: 300,

  /** Boundary used to color a requisition "aging" in the pipeline view. */
  agingRequisitionWarningDays: 21,
} as const;

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(appConfig.locale, {
    style: "currency",
    currency: appConfig.currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}
