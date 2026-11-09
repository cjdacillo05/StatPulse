import { StatisticsError } from "./errors";
import {
  standardNormalCdf,
  standardNormalPdf,
  standardNormalQuantile,
} from "./normal-distribution";
import { tCdf, tPdf, tQuantile } from "./t-distribution";

export type MeanTestKind = "z" | "t";
export type MeanTail = "left" | "right" | "two";

export interface MeanTestInput {
  kind: MeanTestKind;
  sampleMean: number;
  hypothesizedMean: number;
  spread: number;
  sampleSize: number;
  alpha: number;
  tail: MeanTail;
}

export interface MeanTestResult {
  input: MeanTestInput;
  kind: MeanTestKind;
  df: number | null;
  standardError: number;
  statistic: number;
  criticalValues: number[];
  pValue: number;
  rejectByCriticalValue: boolean;
  rejectByPValue: boolean;
  decision: "reject" | "fail-to-reject";
}

export const ALPHA_MIN = 0.0001;
export const ALPHA_MAX = 0.5;

export function validateMeanTestInput(input: MeanTestInput): void {
  const { kind, sampleMean, hypothesizedMean, spread, sampleSize, alpha, tail } = input;

  if (![sampleMean, hypothesizedMean, spread, sampleSize, alpha].every(Number.isFinite)) {
    throw new StatisticsError("All numeric inputs must be valid finite numbers.");
  }
  if (kind !== "z" && kind !== "t") {
    throw new StatisticsError("Test type must be a Z-test or a t-test.");
  }
  if (spread <= 0) {
    throw new StatisticsError(
      kind === "z"
        ? "Population standard deviation (σ) must be greater than 0."
        : "Sample standard deviation (s) must be greater than 0.",
    );
  }
  if (!Number.isInteger(sampleSize) || sampleSize < 1) {
    throw new StatisticsError("Sample size (n) must be a whole number of at least 1.");
  }
  if (kind === "t" && sampleSize < 2) {
    throw new StatisticsError("A t-test needs a sample size of at least 2.");
  }
  if (alpha < ALPHA_MIN || alpha > ALPHA_MAX) {
    throw new StatisticsError(`Significance level (α) must be between ${ALPHA_MIN} and ${ALPHA_MAX}.`);
  }
  if (tail !== "left" && tail !== "right" && tail !== "two") {
    throw new StatisticsError("Test direction must be left-tailed, right-tailed, or two-tailed.");
  }
}

function cdfFor(kind: MeanTestKind, df: number | null) {
  return kind === "z" ? (x: number) => standardNormalCdf(x) : (x: number) => tCdf(x, df as number);
}

function quantileFor(kind: MeanTestKind, df: number | null) {
  return kind === "z" ? (p: number) => standardNormalQuantile(p) : (p: number) => tQuantile(p, df as number);
}

export function densityFor(kind: MeanTestKind, df: number | null) {
  return kind === "z" ? (x: number) => standardNormalPdf(x) : (x: number) => tPdf(x, df as number);
}

export function meanTestCriticalValues(kind: MeanTestKind, tail: MeanTail, alpha: number, df: number | null): number[] {
  const q = quantileFor(kind, df);
  switch (tail) {
    case "left":
      return [q(alpha)];
    case "right":
      return [q(1 - alpha)];
    case "two": {
      const c = q(1 - alpha / 2);
      return [-c, c];
    }
  }
}

export function meanTestPValue(kind: MeanTestKind, tail: MeanTail, statistic: number, df: number | null): number {
  const cdf = cdfFor(kind, df);
  switch (tail) {
    case "left":
      return cdf(statistic);
    case "right":
      return cdf(-statistic);
    case "two":
      return Math.min(1, 2 * cdf(-Math.abs(statistic)));
  }
}

export function isInRejectionRegion(statistic: number, tail: MeanTail, crit: number[]): boolean {
  switch (tail) {
    case "left":
      return statistic < crit[0];
    case "right":
      return statistic > crit[0];
    case "two":
      return statistic < crit[0] || statistic > crit[1];
  }
}

export function runMeanTest(input: MeanTestInput): MeanTestResult {
  validateMeanTestInput(input);

  const { kind, sampleMean, hypothesizedMean, spread, sampleSize, alpha, tail } = input;
  const df = kind === "t" ? sampleSize - 1 : null;

  const standardError = spread / Math.sqrt(sampleSize);
  const statistic = (sampleMean - hypothesizedMean) / standardError;

  const crit = meanTestCriticalValues(kind, tail, alpha, df);
  const pValue = meanTestPValue(kind, tail, statistic, df);

  const rejectByCriticalValue = isInRejectionRegion(statistic, tail, crit);
  const rejectByPValue = pValue < alpha;

  return {
    input,
    kind,
    df,
    standardError,
    statistic,
    criticalValues: crit,
    pValue,
    rejectByCriticalValue,
    rejectByPValue,
    decision: rejectByCriticalValue ? "reject" : "fail-to-reject",
  };
}
