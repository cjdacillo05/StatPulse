"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { standardNormalCdf } from "@/lib/statistics/normal-distribution";
import type { MeanTail } from "@/lib/statistics/mean-test";

interface ZTableProps {
  statistic: number;
  criticalValues: number[];
  tail: MeanTail;
}

type Tone = "calculated" | "critical";

interface Target {
  key: string;
  title: string;
  z: number;
  tone: Tone;
}

function locate(z: number) {
  const hundredths = Math.round(Math.abs(z) * 100);
  return {
    sign: z < 0 ? (-1 as const) : (1 as const),
    row: Math.floor(hundredths / 10),
    col: hundredths % 10,
    outside: hundredths > 349,
  };
}

const ROWS = Array.from({ length: 35 }, (_, i) => i);
const COLS = Array.from({ length: 10 }, (_, i) => i);

function cellValue(sign: 1 | -1, row: number, col: number): number {
  return standardNormalCdf((sign * (row * 10 + col)) / 100);
}

function rowLabel(sign: 1 | -1, row: number): string {
  return `${sign < 0 ? "−" : ""}${(row / 10).toFixed(1)}`;
}

export function ZTable({ statistic, criticalValues, tail }: ZTableProps) {
  const [sign, setSign] = useState<1 | -1>(statistic < 0 ? -1 : 1);

  const targets: Target[] = useMemo(() => {
    const list: Target[] = [{ key: "calc", title: "Calculated Z", z: statistic, tone: "calculated" }];
    if (tail === "two") {
      list.push({ key: "lo", title: "Lower critical Z", z: criticalValues[0], tone: "critical" });
      list.push({ key: "hi", title: "Upper critical Z", z: criticalValues[1], tone: "critical" });
    } else {
      list.push({ key: "c", title: "Critical Z", z: criticalValues[0], tone: "critical" });
    }
    return list;
  }, [statistic, criticalValues, tail]);

  const located = targets.map((t) => ({ ...t, loc: locate(t.z) }));

  function toneFor(row: number, col: number): Tone | null {
    for (const t of located) {
      if (!t.loc.outside && t.loc.sign === sign && t.loc.row === row && t.loc.col === col) {
        return t.tone;
      }
    }
    return null;
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="inline-flex rounded-md bg-muted p-1" role="tablist" aria-label="Table sign">
          {([-1, 1] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={sign === s}
              onClick={() => setSign(s)}
              className={cn(
                "rounded-sm px-3 py-1 text-xs font-semibold transition-colors",
                sign === s ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s < 0 ? "Negative z" : "Positive z"}
            </button>
          ))}
        </div>
        <p className="hidden text-xs text-muted-foreground sm:block">Each cell is the area to the left of z, P(Z ≤ z).</p>
      </div>

      <div className="max-h-72 overflow-auto rounded-md border border-border">
        <table className="w-full min-w-[640px] border-collapse text-center text-xs tabular-nums">
          <thead className="sticky top-0 z-10 bg-accent text-accent-foreground">
            <tr>
              <th className="px-2 py-2 text-left font-semibold">z</th>
              {COLS.map((c) => (
                <th key={c} className="px-2 py-2 font-semibold">.0{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row} className="border-t border-border">
                <th className="bg-muted/50 px-2 py-1.5 text-left font-semibold">{rowLabel(sign, row)}</th>
                {COLS.map((col) => {
                  const tone = toneFor(row, col);
                  return (
                    <td key={col} className={cn("px-2 py-1.5", tone === "calculated" && "bg-warning font-bold text-white", tone === "critical" && "bg-danger font-bold text-white")}>
                      {cellValue(sign, row, col).toFixed(4)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
