import type { DataPoint, RegressionResult } from "@/types";
import { formatEquation } from "@/lib/statistics/regression";

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function csvRow(cells: (string | number)[]): string {
  return cells.map(csvCell).join(",");
}

export function buildRegressionCsv(
  points: DataPoint[],
  result: RegressionResult,
  xLabel: string,
  yLabel: string,
): string {
  const c = result.correlation;
  const lines: string[] = [
    csvRow(["ADVSTAT - Simple Linear Regression"]),
    csvRow(["Generated", new Date().toISOString()]),
    "",
    csvRow(["Summary", "Value"]),
    csvRow(["Observations (n)", result.n]),
    csvRow(["Slope (b)", result.slope]),
    csvRow(["Y-intercept (a)", result.intercept]),
    csvRow(["Equation", formatEquation(result)]),
    csvRow(["Pearson r", c.r ?? "undefined"]),
    csvRow(["r squared", c.rSquared ?? "undefined"]),
    csvRow(["Direction", c.direction ?? "undefined"]),
    csvRow(["Strength", c.strength ?? "undefined"]),
    csvRow(["SSE", result.sse]),
    csvRow(["SSR", result.ssr]),
    csvRow(["SST", result.sst]),
    csvRow(["Standard error of estimate", result.standardError ?? "n/a (n = 2)"]),
    "",
    csvRow(["#", xLabel, yLabel, `Predicted ${yLabel}`, "Residual"]),
  ];

  points.forEach((p, i) => {
    lines.push(csvRow([i + 1, p.x, p.y, result.predicted[i]?.y ?? "", result.residuals[i] ?? ""]));
  });

  return lines.join("\r\n");
}

export function downloadTextFile(
  filename: string,
  content: string,
  mime = "text/csv;charset=utf-8",
): void {
  const blob = new Blob(["\uFEFF", content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
