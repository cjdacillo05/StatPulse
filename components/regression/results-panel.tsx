"use client";

import { useState } from "react";
import { Activity, Crosshair, Hash, Percent, Ruler, TrendingUp } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { RegressionScatterChart } from "@/components/charts/regression-scatter-chart";
import { interpretRegression } from "@/lib/interpretation";
import { formatEquation, predictY } from "@/lib/statistics/regression";
import { cn, formatNumber } from "@/lib/utils";
import type { CorrelationStrength, DataPoint, RegressionResult } from "@/types";

export interface AnalysisSnapshot {
  points: DataPoint[];
  result: RegressionResult;
  xLabel: string;
  yLabel: string;
}

const SCALE: { range: string; label: CorrelationStrength }[] = [
  { range: "0.00 – 0.19", label: "very weak" },
  { range: "0.20 – 0.39", label: "weak" },
  { range: "0.40 – 0.59", label: "moderate" },
  { range: "0.60 – 0.79", label: "strong" },
  { range: "0.80 – 1.00", label: "very strong" },
];

function strengthTone(s: CorrelationStrength | null) {
  if (s === "strong" || s === "very strong") return "success" as const;
  if (s === "moderate") return "primary" as const;
  return "warning" as const;
}

export function ResultsPanel({ analysis }: { analysis: AnalysisSnapshot }) {
  const { points, result, xLabel, yLabel } = analysis;
  const c = result.correlation;
  const interpretation = interpretRegression(result, xLabel, yLabel);
  const pearsonR = c.r == null ? null : c.r;
  const coefficientOfDetermination = c.rSquared == null ? null : c.rSquared;

  const [predictInput, setPredictInput] = useState("");
  const predictX = predictInput.trim() === "" ? null : Number(predictInput);
  const predictValid = predictX !== null && Number.isFinite(predictX);
  const xs = points.map((p) => p.x);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const extrapolating = predictValid && (predictX < xMin || predictX > xMax);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Regression equation</CardTitle>
          <CardDescription>Y = a + bX, fitted by least squares</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="break-words rounded-md bg-accent px-4 py-3 text-xl font-semibold text-accent-foreground sm:text-2xl">
            {formatEquation(result)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            where a = Y-intercept, b = slope, X = {xLabel}, Y = {yLabel}.
          </p>
        </CardContent>
      </Card>

      <section aria-label="Key results" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Observations (n)" value={result.n} icon={<Hash className="h-5 w-5" />} />
        <StatCard label="Slope (b)" value={formatNumber(result.slope, 6)} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Y-intercept (a)" value={formatNumber(result.intercept, 6)} icon={<Crosshair className="h-5 w-5" />} />
        <StatCard
          label="Pearson's r"
          value={pearsonR === null ? "Undefined" : formatNumber(pearsonR, 6)}
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          label="r² (coefficient of determination)"
          value={coefficientOfDetermination === null ? "Undefined" : formatNumber(coefficientOfDetermination, 6)}
          icon={<Percent className="h-5 w-5" />}
        />
        <StatCard
          label="Standard error of estimate"
          value={result.standardError === null ? "n/a" : formatNumber(result.standardError, 6)}
          description={result.standardError === null ? "Needs n > 2" : "√(SSE / (n − 2))"}
          icon={<Ruler className="h-5 w-5" />}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Correlation coefficient</CardTitle>
          <CardDescription>
            Strength is judged from the absolute value of r; direction is identified separately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {c.r === null ? (
            <Alert variant="warning">
              Pearson&apos;s r is undefined because all {yLabel} values are identical. The fitted line is flat.
            </Alert>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">
                {c.direction === "positive"
                  ? "Positive relationship"
                  : c.direction === "negative"
                    ? "Negative relationship"
                    : "No linear relationship"}
              </Badge>
              <Badge tone={strengthTone(c.strength)}>
                {c.strength ? `${c.strength[0].toUpperCase()}${c.strength.slice(1)}` : ""} (|r| = {formatNumber(Math.abs(c.r), 4)})
              </Badge>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-1.5 pr-4 font-medium">|r| range</th>
                  <th className="py-1.5 font-medium">Interpretation</th>
                </tr>
              </thead>
              <tbody>
                {SCALE.map((row) => (
                  <tr
                    key={row.label}
                    className={cn(
                      "border-t border-border",
                      c.strength === row.label && "bg-accent font-medium text-accent-foreground",
                    )}
                  >
                    <td className="py-1.5 pl-2 pr-4">{row.range}</td>
                    <td className="py-1.5 capitalize">{row.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scatter diagram</CardTitle>
          <CardDescription>Hover or tap a point to see its coordinates.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegressionScatterChart points={points} result={result} xLabel={xLabel} yLabel={yLabel} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results and interpretation</CardTitle>
          <CardDescription>Generated automatically from the calculated values.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            {interpretation.map((item) => (
              <div key={item.title}>
                <dt className="text-sm font-semibold">{item.title}</dt>
                <dd className="mt-0.5 text-sm text-muted-foreground">{item.text}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card className="no-print">
        <CardHeader>
          <CardTitle>Predict Y for a new X</CardTitle>
          <CardDescription>Uses the fitted equation above.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label={`${xLabel} value`} htmlFor="predict-x" className="max-w-xs">
            <Input
              id="predict-x"
              inputMode="decimal"
              placeholder="Enter a number"
              value={predictInput}
              invalid={predictInput.trim() !== "" && !predictValid}
              onChange={(e) => setPredictInput(e.target.value)}
            />
          </Field>
          {predictInput.trim() !== "" && !predictValid && (
            <p className="text-xs text-danger">Enter a valid number.</p>
          )}
          {predictValid && (
            <p className="text-sm">
              Predicted {yLabel} = <span className="font-semibold">{formatNumber(predictY(result, predictX), 6)}</span>
            </p>
          )}
          {extrapolating && (
            <Alert variant="warning">
              {formatNumber(predictX)} is outside the observed {xLabel} range ({formatNumber(xMin)} to {formatNumber(xMax)}). Extrapolated predictions are unreliable.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Predicted Y values</CardTitle>
          <CardDescription>Residual = observed Y − predicted Y</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">{xLabel}</th>
                  <th className="px-3 py-2 font-medium">{yLabel} (observed)</th>
                  <th className="px-3 py-2 font-medium">Ŷ (predicted)</th>
                  <th className="px-3 py-2 font-medium">Residual</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-1.5">{formatNumber(p.x, 6)}</td>
                    <td className="px-3 py-1.5">{formatNumber(p.y, 6)}</td>
                    <td className="px-3 py-1.5">{formatNumber(result.predicted[i]?.y ?? Number.NaN, 6)}</td>
                    <td className="px-3 py-1.5">{formatNumber(result.residuals[i] ?? Number.NaN, 6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
