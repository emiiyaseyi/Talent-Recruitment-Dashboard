"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ink, seriesPrimary } from "./theme";
import { formatValue, type ValueFormat } from "./format";

interface TrendLineChartProps {
  data: { period: string; value: number }[];
  valueFormat?: ValueFormat;
}

export function TrendLineChart({ data, valueFormat = "number" }: TrendLineChartProps) {
  const tick = (v: number) => formatValue(v, valueFormat);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
        <CartesianGrid stroke={ink.grid} vertical={false} />
        <XAxis dataKey="period" stroke={ink.muted} fontSize={12} />
        <YAxis tickFormatter={tick} stroke={ink.muted} fontSize={12} />
        <Tooltip
          formatter={(value: unknown) => formatValue(Number(value), valueFormat)}
          contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={seriesPrimary}
          strokeWidth={2}
          dot={{ r: 4, fill: seriesPrimary }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
