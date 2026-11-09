import type { TailType, ZTestInput, ZTestResult } from "@/types";
import { safeDivide } from "./errors";
import { inverseNormalCdf, standardNormalCdf } from "./normal-distribution";

export const MIN_ALPHA = 0.001;
export const MAX_ALPHA = 0.2;

export function oneSampleZTest(sampleMean: number, mu0: number, sigma: number, n: number) {
  const standardError = sigma / Math.sqrt(n);
  const statistic = safeDivide(sampleMean - mu0, standardError);
  const pValue = 2 * (1 - standardNormalCdf(Math.abs(statistic)));

  return {
    statistic,
    pValue,
    alpha: 0.05,
    rejectNull: pValue < 0.05,
    conclusion: pValue < 0.05 ? "Reject the null hypothesis at the 5% level." : "Fail to reject the null hypothesis at the 5% level.",
  };
}

export function runZTest(input: ZTestInput): ZTestResult {
  const standardError = input.populationStdDev / Math.sqrt(input.sampleSize);
  const zStatistic = safeDivide(input.sampleMean - input.populationMean, standardError);
  const pValue =
    input.tail === "two"
      ? 2 * (1 - standardNormalCdf(Math.abs(zStatistic)))
      : input.tail === "left"
        ? standardNormalCdf(zStatistic)
        : 1 - standardNormalCdf(zStatistic);

  const criticalValues =
    input.tail === "two"
      ? [-(inverseNormalCdf(1 - input.alpha / 2)), inverseNormalCdf(1 - input.alpha / 2)]
      : input.tail === "left"
        ? [inverseNormalCdf(input.alpha)]
        : [inverseNormalCdf(1 - input.alpha)];

  const rejectByCriticalValue =
    input.tail === "left"
      ? zStatistic < criticalValues[0]
      : input.tail === "right"
        ? zStatistic > criticalValues[0]
        : zStatistic < criticalValues[0] || zStatistic > criticalValues[1];

  const rejectByPValue = pValue < input.alpha;
  const decision = rejectByPValue ? "reject" : "fail_to_reject";

  return {
    input,
    zStatistic,
    standardError,
    criticalValues,
    pValue,
    decision,
    rejectByCriticalValue,
    rejectByPValue,
  };
}

export function zTestTwoSample(sampleMean1: number, sampleMean2: number, sigma1: number, sigma2: number, n1: number, n2: number) {
  const standardError = Math.sqrt((sigma1 ** 2) / n1 + (sigma2 ** 2) / n2);
  const statistic = safeDivide(sampleMean1 - sampleMean2, standardError);
  const pValue = 2 * (1 - standardNormalCdf(Math.abs(statistic)));

  return {
    statistic,
    pValue,
    alpha: 0.05,
    rejectNull: pValue < 0.05,
    conclusion: pValue < 0.05 ? "There is a statistically significant difference between group means." : "No statistically significant difference was found between group means.",
  };
}

export const zTestOneSample = oneSampleZTest;
export const twoSampleZTest = zTestTwoSample;
export const zTestTwoSampleAlias = zTestTwoSample;

export function zTest(input: ZTestInput): ZTestResult {
  return runZTest(input);
}

export { standardNormalCdf };
