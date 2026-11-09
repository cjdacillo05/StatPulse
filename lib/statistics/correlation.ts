import type { CorrelationResult, DataPoint } from "@/types";
import { mean, variance } from "./errors";

export function pearsonCorrelation(points: DataPoint[]): CorrelationResult {
  if (points.length < 2) {
    return {
      r: null,
      rSquared: null,
      direction: "none",
      strength: "very weak",
      interpretation: "At least two data points are required to estimate a correlation.",
    };
  }

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  const xMean = mean(xs);
  const yMean = mean(ys);

  const numerator = points.reduce((sum, point) => {
    return sum + (point.x - xMean) * (point.y - yMean);
  }, 0);

  const denominator = Math.sqrt(
    points.reduce((sum, point) => sum + (point.x - xMean) ** 2, 0) *
      points.reduce((sum, point) => sum + (point.y - yMean) ** 2, 0),
  );

  if (Math.abs(denominator) < 1e-12 || !Number.isFinite(numerator)) {
    return {
      r: null,
      rSquared: null,
      direction: "none",
      strength: "very weak",
      interpretation: "The dataset is constant in one or both variables, so the correlation is undefined.",
    };
  }

  const r = numerator / denominator;
  const rSquared = r * r;
  let direction: CorrelationResult["direction"] = "none";
  if (Math.abs(r) < 0.2) direction = "none";
  else if (r > 0) direction = "positive";
  else direction = "negative";

  let strength: CorrelationResult["strength"] = "very weak";
  const magnitude = Math.abs(r);
  if (magnitude >= 0.9) strength = "very strong";
  else if (magnitude >= 0.7) strength = "strong";
  else if (magnitude >= 0.5) strength = "moderate";
  else if (magnitude >= 0.3) strength = "weak";

  const directionText =
    direction === "positive" ? "increases together" : direction === "negative" ? "moves in opposite directions" : "shows no clear linear relationship";

  const interpretation = `The correlation coefficient is ${r.toFixed(3)}, indicating a ${strength} ${direction} association where the variables ${directionText}.`;

  return { r, rSquared, direction, strength, interpretation };
}

export const computeCorrelation = pearsonCorrelation;
export const calculateCorrelation = pearsonCorrelation;
