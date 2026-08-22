"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ink, seriesPrimary } from "./theme";
import { formatValue, type ValueFormat } from "./format";

interface FlatBarChartProps {
  data: { label: string; value: number; note?: string }[];
  valueFormat?: ValueFormat;
  layout?: "horizontal" | "vertical";
}

/** Single-series magnitude comparison — one flat hue, no per-bar rainbow.
 * Category identity is carried by the axis label, not color. */
export function FlatBarChart({ data, valueFormat = "number", layout = "vertical" }: FlatBarChartProps) {
  const height = layout === "vertical" ? Math.max(180, data.length * 36) : 280;
  const tick = (v: number) => formatValue(v, valueFormat);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={layout === "vertical" ? "vertical" : "horizontal"}
        margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
      >
        <CartesianGrid stroke={ink.grid} horizontal={layout !== "vertical"} vertical={layout === "vertical"} />
        {layout === "vertical" ? (
          <>
            <XAxis type="number" tickFormatter={tick} stroke={ink.muted} fontSize={12} />
            <YAxis type="category" dataKey="label" stroke={ink.muted} fontSize={12} width={120} />
          </>
        ) : (
          <>
            <XAxis type="category" dataKey="label" stroke={ink.muted} fontSize={12} />
            <YAxis type="number" tickFormatter={tick} stroke={ink.muted} fontSize={12} />
          </>
        )}
        <Tooltip
          formatter={(value: unknown, _name: unknown, item: { payload?: { note?: string } }) => {
            const formatted = formatValue(Number(value), valueFormat);
            return item?.payload?.note ? `${formatted} (${item.payload.note})` : formatted;
          }}
          contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        />
        <Bar dataKey="value" fill={seriesPrimary} radius={4} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
