"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { categorical, ink } from "./theme";
import { formatValue, type ValueFormat } from "./format";

interface DonutChartProps {
  data: { label: string; value: number }[];
  valueFormat?: ValueFormat;
}

export function DonutChart({ data, valueFormat = "number" }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
        >
          {data.map((entry, i) => (
            <Cell key={entry.label} fill={categorical[i % categorical.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: unknown) => formatValue(Number(value), valueFormat)}
          contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        />
        <Legend wrapperStyle={{ color: ink.secondary, fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
