"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMonthLabel, formatNumber, formatRain } from "@/lib/format";

const tooltipStyle = {
  background: "rgba(247, 250, 252, 0.96)",
  border: "1px solid rgba(15, 76, 92, 0.12)",
  borderRadius: 12,
  boxShadow: "0 12px 30px rgba(12, 45, 56, 0.12)",
  color: "#0f2f38",
};

type SeriesPoint = { label: string; rainfall: number };

export function RainfallTrendChart({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="rainFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f8a8a" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#1f8a8a" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(15,76,92,0.08)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#5b7580", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={28}
        />
        <YAxis
          tick={{ fill: "#5b7580", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v) => formatNumber(Math.round(v))}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => [formatRain(Number(value)), "Rainfall"]}
          labelFormatter={(label) => String(label)}
        />
        <Area
          type="monotone"
          dataKey="rainfall"
          stroke="#147878"
          strokeWidth={2.25}
          fill="url(#rainFill)"
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DistrictBarChart({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 12, left: 8, bottom: 4 }}
      >
        <CartesianGrid stroke="rgba(15,76,92,0.08)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: "#5b7580", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatNumber(Math.round(v))}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={118}
          tick={{ fill: "#0f2f38", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => [formatRain(Number(value)), "Total"]}
        />
        <Bar dataKey="rainfall" radius={[0, 8, 8, 0]} animationDuration={800}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={i % 2 === 0 ? "#147878" : "#3aa0a0"}
              fillOpacity={0.9}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HourlyPatternChart({
  data,
}: {
  data: { label: string; rainfall: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="rgba(15,76,92,0.08)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#5b7580", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: "#5b7580", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v) => formatNumber(Math.round(v))}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => [
            `${Number(value).toFixed(1)} mm`,
            "Avg hourly",
          ]}
        />
        <Bar
          dataKey="rainfall"
          fill="#c9852d"
          radius={[6, 6, 0, 0]}
          animationDuration={850}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function YearCompareChart({
  data,
}: {
  data: { year: string; rainfall: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="rgba(15,76,92,0.08)" vertical={false} />
        <XAxis
          dataKey="year"
          tick={{ fill: "#5b7580", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: "#5b7580", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v) => formatNumber(Math.round(v))}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => [formatRain(Number(value)), "Rainfall"]}
        />
        <Bar
          dataKey="rainfall"
          fill="#0f4c5c"
          radius={[8, 8, 0, 0]}
          animationDuration={750}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function toMonthSeries(
  points: { month: string; rainfall: number }[],
): SeriesPoint[] {
  return points.map((p) => ({
    label: formatMonthLabel(p.month),
    rainfall: p.rainfall,
  }));
}
