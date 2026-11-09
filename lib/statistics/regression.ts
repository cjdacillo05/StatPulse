import type { DataPoint, RegressionResult } from "@/types";
import { pearsonCorrelation } from "./correlation";
import { safeDivide } from "./errors";

export function formatEquation(result: Pick<RegressionResult, "slope" | "intercept">): string {
  const slopeText = Number.isFinite(result.slope) ? result.slope.toFixed(3) : "NaN";
  const interceptText = Number.isFinite(result.intercept) ? result.intercept.toFixed(3) : "NaN";
  return `ŷ = ${slopeText}x + ${interceptText}`;
}

export function predictY(result: Pick<RegressionResult, "slope" | "intercept">, x: number): number {
  return result.intercept + result.slope * x;
}

export function linearRegression(points: DataPoint[]): RegressionResult {
  if (points.length < 2) {
    const emptyCorrelation = {
      r: null,
      rSquared: null,
      direction: null,
      strength: null,
      interpretation: "At least two data points are required to estimate a correlation.",
    };

    return {
      slope: Number.NaN,
      intercept: Number.NaN,
      equation: "ŷ = NaN",
      rSquared: null,
      predicted: [],
      residuals: [],
      sse: Number.NaN,
      ssr: Number.NaN,
      sst: Number.NaN,
      standardError: null,
      correlation: emptyCorrelation,
      n: points.length,
    };
  }

  const xMean = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const yMean = points.reduce((sum, point) => sum + point.y, 0) / points.length;

  const numerator = points.reduce((sum, point) => sum + (point.x - xMean) * (point.y - yMean), 0);
  const denominator = points.reduce((sum, point) => sum + (point.x - xMean) ** 2, 0);

  const slope = safeDivide(numerator, denominator);
  const intercept = yMean - slope * xMean;

  const predicted = points.map((point) => ({
    x: point.x,
    y: slope * point.x + intercept,
  }));

  const residuals = points.map((point, index) => point.y - predicted[index].y);

  const ssTot = points.reduce((sum, point) => sum + (point.y - yMean) ** 2, 0);
  const ssRes = residuals.reduce((sum, residual) => sum + residual ** 2, 0);
  const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  const correlation = { ...pearsonCorrelation(points), rSquared };

  const sse = ssRes;
  const ssr = points.reduce((sum, point) => sum + (predictY({ slope, intercept }, point.x) - yMean) ** 2, 0);
  const sst = ssTot;
  const standardError = points.length > 2 ? Math.sqrt(sse / (points.length - 2)) : null;

  return {
    slope,
    intercept,
    equation: `ŷ = ${Number.isFinite(slope) ? slope.toFixed(3) : "NaN"}x + ${Number.isFinite(intercept) ? intercept.toFixed(3) : "NaN"}`,
    rSquared,
    predicted,
    residuals,
    sse,
    ssr,
    sst,
    standardError,
    correlation,
    n: points.length,
  };
}

export const simpleLinearRegression = linearRegression;
export const computeRegression = linearRegression;
