"use client";

import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/components/layout/theme-provider";
import { standardNormalPdf } from "@/lib/statistics/normal-distribution";
import { formatNumber } from "@/lib/utils";
import type { TailType } from "@/types";

interface Props {
  zStatistic: number;
  criticalValues: number[];
  tail: TailType;
}

interface Row {
  z: number;
  density: number;
  reject: number | null;
  nonReject: number | null;
}

function inRejection(z: number, tail: TailType, crit: number[]): boolean {
  if (tail === "left") return z <= crit[0];
  if (tail === "right") return z >= crit[0];
  return z <= crit[0] || z >= crit[1];
}

function inNonRejection(z: number, tail: TailType, crit: number[]): boolean {
  if (tail === "left") return z >= crit[0];
  if (tail === "right") return z <= crit[0];
  return z >= crit[0] && z <= crit[1];
}

export function NormalCurveChart({
  zStatistic = 0,
  criticalValues = [1.645],
  tail = "right",
}: Partial<Props>) {
  const { resolved } = useTheme();
  const dark = resolved === "dark";
  const colors = {
    curve: dark ? "#e2e8f0" : "#1e293b",
    reject: dark ? "#fb7185" : "#e11d48",
    keep: dark ? "#818cf8" : "#6366f1",
    zLine: dark ? "#fbbf24" : "#b45309",
    critLine: dark ? "#fda4af" : "#be123c",
    grid: dark ? "#334155" : "#e2e8f0",
    axis: dark ? "#94a3b8" : "#64748b",
  };

  const { data, domain, zPlot, outOfRange } = useMemo(() => {
    const maxCrit = Math.max(...criticalValues.map((c) => Math.abs(c)));
    const dom = Math.min(10, Math.max(4, Math.ceil(Math.abs(zStatistic) + 0.5), Math.ceil(maxCrit + 0.5)));
    const zClamped = Math.max(-dom, Math.min(dom, zStatistic));

    const xs = new Set<number>();
    const steps = 400;
    for (let i = 0; i <= steps; i += 1) {
      xs.add(Number((-dom + (i * 2 * dom) / steps).toFixed(6)));
    }
    criticalValues.forEach((c) => xs.add(c));
    xs.add(zClamped);

    const rows: Row[] = Array.from(xs)
      .sort((a, b) => a - b)
      .map((z) => ({
        z,
        density: standardNormalPdf(z),
        reject: inRejection(z, tail, criticalValues) ? standardNormalPdf(z) : null,
        nonReject: inNonRejection(z, tail, criticalValues) ? standardNormalPdf(z) : null,
      }));

    return {
      data: rows,
      domain: dom,
      zPlot: zClamped,
      outOfRange: Math.abs(zStatistic) > dom,
    };
  }, [zStatistic, criticalValues, tail]);

  const ticks = Array.from({ length: 2 * domain + 1 }, (_, i) => -domain + i);
  const tick = { fill: colors.axis, fontSize: 12 };

  return (
    <div className="space-y-3">
      <div className="h-[360px] w-full" role="img" aria-label="Standard normal curve with shaded rejection regions, critical values, and the calculated Z-statistic">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 30, right: 20, bottom: 24, left: 4 }}>
            <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="z"
              domain={[-domain, domain]}
              ticks={ticks}
              tick={tick}
              stroke={colors.axis}
              allowDataOverflow
              label={{ value: "Z", position: "insideBottom", offset: -14, fill: colors.axis }}
            />
            <YAxis
              domain={[0, 0.45]}
              tick={tick}
              stroke={colors.axis}
              tickFormatter={(v: number) => v.toFixed(1)}
              label={{ value: "Density", angle: -90, position: "insideLeft", fill: colors.axis }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const row = payload[0].payload as Row;
                return (
                  <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
                    <p>Z = {formatNumber(row.z, 3)}</p>
                    <p>Density = {formatNumber(row.density, 5)}</p>
                  </div>
                );
              }}
            />

            <Area dataKey="nonReject" stroke="none" fill={colors.keep} fillOpacity={0.3} connectNulls={false} isAnimationActive={false} activeDot={false} legendType="none" />
            <Area dataKey="reject" stroke="none" fill={colors.reject} fillOpacity={0.55} connectNulls={false} isAnimationActive={false} activeDot={false} legendType="none" />
            <Area dataKey="density" stroke={colors.curve} strokeWidth={2} fill="none" isAnimationActive={false} dot={false} activeDot={{ r: 4 }} legendType="none" />

            {criticalValues.map((c) => (
              <ReferenceLine
                key={c}
                x={c}
                stroke={colors.critLine}
                strokeDasharray="5 4"
                strokeWidth={1.5}
                label={{ value: `z = ${formatNumber(c, 3)}`, position: "top", fill: colors.critLine, fontSize: 11 }}
              />
            ))}

            <ReferenceLine
              x={zPlot}
              stroke={colors.zLine}
              strokeWidth={2.5}
              label={{
                value: `Z = ${formatNumber(zStatistic, 3)}`,
                position: zPlot >= 0 ? "insideTopRight" : "insideTopLeft",
                fill: colors.zLine,
                fontSize: 12,
                fontWeight: 600,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm" style={{ background: colors.reject, opacity: 0.7 }} />
          Rejection region{tail === "two" ? "s" : ""}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm" style={{ background: colors.keep, opacity: 0.45 }} />
          Non-rejection region
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-0.5 w-4" style={{ background: colors.critLine }} />
          Critical value{criticalValues.length > 1 ? "s" : ""}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-1 w-4" style={{ background: colors.zLine }} />
          Calculated Z
        </li>
      </ul>

      {outOfRange && (
        <p className="text-xs text-warning">
          The calculated Z ({formatNumber(zStatistic, 3)}) is beyond the plotted range, so its line is drawn at the edge of the chart.
        </p>
      )}
    </div>
  );
}
