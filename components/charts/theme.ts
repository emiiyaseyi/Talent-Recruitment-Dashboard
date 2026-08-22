// Chart color roles. Literal hex, not CSS custom properties — Recharts sets
// `fill`/`stroke` as raw SVG presentation attributes on the root shapes (Bar,
// Line, Pie's Cell), and `var(--x)` doesn't reliably resolve there even
// though the same variables work fine everywhere else in the app (regular
// CSS/Tailwind classes on divs). Confirmed by screenshot: bars/lines/pie
// wedges rendered invisible with var() as the fill, while browser-verified
// working once switched to hex. Keep these in sync with app/globals.css by
// hand if that palette ever changes — this file exists only because SVG
// attributes need the literal value.

export const seriesPrimary = "#8b7cf6";

/** Fixed-order categorical slots for the small number of app-domain
 * categories that are genuinely multi-series on one chart (e.g. the cost
 * components, or hiring sources). Order is the CVD-safety mechanism — never
 * reassign by value/rank. Six slots — see app/globals.css for validation notes. */
export const categorical = [
  "#8b7cf6", // violet — brand primary
  "#0d9488", // teal — brand secondary
  "#dc2626", // red
  "#3d7fe0", // blue
  "#d97706", // amber — brand tertiary
  "#d6266f", // magenta
];

export const status = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
};

export const ink = {
  primary: "#ffffff",
  secondary: "#b8b5d1",
  muted: "#7d7a9c",
  grid: "#2c2a52",
  baseline: "#3a3765",
};
