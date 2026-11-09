"use client";

import { useMemo } from "react";
import { Area, ComposedChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { densityFor, type MeanTail, type MeanTestKind } from "@/lib/statistics/mean-test";

interface CurveChartProps {
  kind: MeanTestKind;
  df: number | null;
  tail: MeanTail;
  statistic: number;
  criticalValues: number[];
}

interface Point {
  x: number;
  density: number;
  reject: number | null;
  body: number | null;
}

function inRejection(x: number, tail: MeanTail, crit: number[]): boolean {
  switch (tail) {
    case "left":
      return x <= crit[0];
    case "right":
      return x >= crit[0];
    case "two":
      return x <= crit[0] || x >= crit[1];
  }
}

export function CurveChart({ kind, df, tail, statistic, criticalValues }: CurveChartProps) {
  const { data, half } = useMemo(() => {
    const reach = Math.max(4, Math.abs(statistic), ...criticalValues.map(Math.abs));
    const half = Math.min(12, Math.ceil(reach) + 1);
    const density = densityFor(kind, df);

    const xs: number[] = [];
    const steps = 320;
    for (let i = 0; i <= steps; i++) xs.push(-half + (2 * half * i) / steps);
    for (const c of criticalValues) xs.push(c);
    xs.sort((a, b) => a - b);

    const points: Point[] = xs.map((x) => {
      const d = density(x);
      const rej = inRejection(x, tail, criticalValues);
      const onBoundary = criticalValues.some((c) => Math.abs(c - x) < 1e-12);
      return {
        x,
        density: d,
        reject: rej ? d : null,
        body: !rej || onBoundary ? d : null,
      };
    });
    return { data: points, half };
  }, [kind, df, tail, statistic, criticalValues]);

  const label = kind === "z" ? "Z" : "t";
  const ticks = Array.from({ length: (2 * (Math.round((Number.isFinite(criticalValues[0]) ? Math.abs(criticalValues[0]) : 4) + 4))) + 1 }, (_, i) => i - (2 * (Math.round((Number.isFinite(criticalValues[0]) ? Math.abs(criticalValues[0]) : 4) + 4))) / 2);

  return (
    <div className="w-full">
      <div className="h-64 w-full" role="img" aria-label={`${label} distribution with rejection regions`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 22, right: 16, bottom: 4, left: 16 }}>
            <XAxis
              type="number"
              dataKey="x"
              domain={[-(Number.isFinite(criticalValues[0]) ? Math.max(4,Math.abs(criticalValues[0])+1) : 4), Number.isFinite(criticalValues[criticalValues.length - 1]) ? Math.max(4,Math.abs(criticalValues[criticalValues.length - 1])+1) : 4]}
              ticks={ticks}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              stroke="hsl(var(--border))"
              allowDataOverflow
            />
            <YAxis hide domain={[0, "auto"]} />
            <Area type="monotone" dataKey="body" stroke="hsl(var(--primary))" strokeWidth={2} fill="hsl(var(--primary))" fillOpacity={0.16} isAnimationActive={false} connectNulls={false} dot={false} />
            <Area type="monotone" dataKey="reject" stroke="hsl(var(--danger))" strokeWidth={2} fill="hsl(var(--danger))" fillOpacity={0.4} isAnimationActive={false} connectNulls={false} dot={false} />
            {criticalValues.map((c, i) => (
              <ReferenceLine key={i} x={c} stroke="hsl(var(--danger))" strokeDasharray="4 3" label={{ value: c.toFixed(2), position: "top", fill: "hsl(var(--danger))", fontSize: 11 }} />
            ))}
            <ReferenceLine x={statistic} stroke="hsl(var(--warning))" strokeWidth={2.5} label={{ value: `${label} = ${statistic.toFixed(2)}`, position: "insideTopRight", fill: "hsl(var(--warning))", fontSize: 11 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-danger" /> Rejection region</li>
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Non-rejection region</li>
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-warning" /> Calculated {label}</li>
      </ul>
    </div>
  );
}
