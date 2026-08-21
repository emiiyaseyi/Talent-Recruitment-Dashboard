// Chart color roles, sourced from the dataviz skill's validated reference
// palette (references/palette.md). Referenced as CSS custom properties so
// light/dark swap in one place (see app/globals.css) rather than per chart.

export const seriesPrimary = "var(--series-1)";

/** Fixed-order categorical slots for the small number of app-domain
 * categories that are genuinely multi-series on one chart (e.g. the three
 * cost components). Order is the CVD-safety mechanism — never reassign by
 * value/rank. */
export const categorical = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
  "var(--series-8)",
];

export const status = {
  good: "var(--status-good)",
  warning: "var(--status-warning)",
  serious: "var(--status-serious)",
  critical: "var(--status-critical)",
};

export const ink = {
  primary: "var(--text-primary)",
  secondary: "var(--text-secondary)",
  muted: "var(--text-muted)",
  grid: "var(--grid)",
  baseline: "var(--baseline)",
};
