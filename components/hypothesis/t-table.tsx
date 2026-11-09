"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { tQuantile } from "@/lib/statistics/t-distribution";
import type { MeanTail } from "@/lib/statistics/mean-test";

interface TTableProps {
  df: number;
  alpha: number;
  tail: MeanTail;
  criticalValue: number;
}

const ONE_TAIL_ALPHAS = [0.1, 0.05, 0.025, 0.01, 0.005];
const DF_ROWS = [...Array.from({ length: 30 }, (_, i) => i + 1), 40, 60, 120];

export function TTable({ df, alpha, tail, criticalValue }: TTableProps) {
  const rowDf = useMemo(() => {
    let best = DF_ROWS[0];
    for (const d of DF_ROWS) if (d <= df) best = d;
    return best;
  }, [df]);

  const oneTailAlpha = tail === "two" ? alpha / 2 : alpha;
  const colIndex = ONE_TAIL_ALPHAS.findIndex((a) => Math.abs(a - oneTailAlpha) < 1e-12);
  const values = useMemo(
    () => DF_ROWS.map((d) => ONE_TAIL_ALPHAS.map((a) => tQuantile(1 - a, d))),
    [],
  );

  return (
    <div>
      <div className="mb-3 rounded-md bg-muted/60 px-3 py-2 text-xs">
        <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-danger align-middle" />
        <span className="font-semibold">Critical t:</span> {tail === "two" ? `±${criticalValue.toFixed(4)}` : criticalValue.toFixed(4)}
      </div>

      <div className="max-h-80 overflow-auto rounded-md border border-border">
        <table className="w-full min-w-[540px] border-collapse text-center text-xs tabular-nums">
          <thead className="sticky top-0 z-10 bg-accent text-accent-foreground">
            <tr>
              <th className="px-2 py-2 text-left font-semibold">df</th>
              {ONE_TAIL_ALPHAS.map((a) => (
                <th key={a} className="px-2 py-2 font-semibold">α = {a}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DF_ROWS.map((d, rowIndex) => (
              <tr key={d} className={cn("border-t border-border", d === rowDf && "bg-danger/10") }>
                <th className={cn("px-2 py-1.5 text-left font-semibold", d === rowDf && "text-danger")}>{d}</th>
                {ONE_TAIL_ALPHAS.map((_, colIndexCurrent) => (
                  <td
                    key={`${d}-${colIndexCurrent}`}
                    className={cn(
                      "px-2 py-1.5",
                      d === rowDf && colIndexCurrent === colIndex && "bg-danger font-bold text-white",
                    )}
                  >
                    {values[rowIndex][colIndexCurrent].toFixed(4)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
