import { appConfig, formatCurrency } from "@/config/app.config";

// Chart components take a serializable format *name*, never a formatter
// function — Server Components (the pages) cannot pass function props across
// to "use client" chart components, so formatting must be resolved here,
// inside the client boundary.
export type ValueFormat = "currency" | "number";

export function formatValue(value: number, format: ValueFormat = "number"): string {
  if (format === "currency") return formatCurrency(value);
  return new Intl.NumberFormat(appConfig.locale).format(value);
}
