"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/components/layout/theme-provider";
import { formatNumber } from "@/lib/utils";
import type { DataPoint, RegressionResult } from "@/types";

interface Props {
  points: DataPoint[];
  result: RegressionResult;
  xLabel: string;
  yLabel: string;
}

function paddedDomain(values: number[]): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const span = max - min;
  const pad = span === 0 ? Math.max(Math.abs(max) * 0.1, 1) : span * 0.08;
  return [min - pad, max + pad];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; payload?: { x: number; y: number } }>;
  xLabel: string;
  yLabel: string;
}

function ChartTooltip({ active, payload, xLabel, yLabel }: TooltipProps) {
  if (!active || !payload || payload.length === 0 || !payload[0].payload) return null;
  const { x, y } = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-semibold">{payload[0].name}</p>
      <p>
        {xLabel}: {formatNumber(x, 4)}
      </p>
      <p>
        {yLabel}: {formatNumber(y, 4)}
      </p>
    </div>
  );
}

export function RegressionScatterChart({ points, result, xLabel, yLabel }: Props) {
  const { resolved } = useTheme();
  const dark = resolved === "dark";
  const colors = {
    point: dark ? "#a5b4fc" : "#4f46e5",
    line: dark ? "#fb7185" : "#e11d48",
    grid: dark ? "#334155" : "#e2e8f0",
    axis: dark ? "#94a3b8" : "#64748b",
  };

  const { linePoints, xDomain, yDomain } = useMemo(() => {
    const xs = points.map((p) => p.x);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const line = [xMin, xMax].map((x) => ({
      x,
      y: result.intercept + result.slope * x,
    }));
    return {
      linePoints: line,
      xDomain: paddedDomain(xs),
      yDomain: paddedDomain([...points.map((p) => p.y), ...line.map((p) => p.y)]),
    };
  }, [points, result]);

  const tick = { fill: colors.axis, fontSize: 12 };

  return (
    <div className="h-[380px] w-full" role="img" aria-label={`Scatter plot of ${yLabel} against ${xLabel} with regression line`}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, bottom: 28, left: 10 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name={xLabel}
            domain={xDomain}
            tickCount={7}
            tick={tick}
            stroke={colors.axis}
            tickFormatter={(v: number) => formatNumber(v, 3)}
            label={{ value: xLabel, position: "insideBottom", offset: -16, fill: colors.axis }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yLabel}
            domain={yDomain}
            tickCount={7}
            tick={tick}
            stroke={colors.axis}
            tickFormatter={(v: number) => formatNumber(v, 3)}
            label={{ value: yLabel, angle: -90, position: "insideLeft", fill: colors.axis }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: colors.axis }}
            content={<ChartTooltip xLabel={xLabel} yLabel={yLabel} />}
          />
          <Legend verticalAlign="top" height={32} />
          <Scatter name="Data points" data={points} fill={colors.point} legendType="circle" />
          <Scatter
            name="Regression line"
            data={linePoints}
            fill={colors.line}
            line={{ stroke: colors.line, strokeWidth: 2.5 }}
            lineType="joint"
            shape={() => <g />}
            legendType="line"
            isAnimationActive={false}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
