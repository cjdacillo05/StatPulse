import type { RegressionResult, ZTestResult } from "@/types";
import { formatEquation, formatNumber } from "@/lib/utils";

export interface InterpretationItem {
  title: string;
  text: string;
}

export function interpretRegression(result: RegressionResult, xLabel = "X", yLabel = "Y"): InterpretationItem[] {
  const { slope, intercept, correlation: c, n } = result;
  const rSquared = result.rSquared;
  const items: InterpretationItem[] = [];

  items.push({
    title: "Regression equation",
    text: `The fitted line is ${formatEquation(result)}, estimated from ${n} observations using least squares. It can be used to predict ${yLabel} from ${xLabel}.`,
  });

  const size = formatNumber(Math.abs(slope));
  let slopeText: string;
  if (slope > 0) {
    slopeText = `The slope is b = ${formatNumber(slope)}. For every 1-unit increase in ${xLabel}, ${yLabel} is predicted to increase by about ${size} units on average.`;
  } else if (slope < 0) {
    slopeText = `The slope is b = ${formatNumber(slope)}. For every 1-unit increase in ${xLabel}, ${yLabel} is predicted to decrease by about ${size} units on average.`;
  } else {
    slopeText = `The slope is b = 0, so the fitted line is flat: the model predicts no change in ${yLabel} as ${xLabel} changes.`;
  }
  items.push({ title: "Meaning of the slope", text: slopeText });

  items.push({
    title: "Meaning of the intercept",
    text: `The intercept is a = ${formatNumber(intercept)}. This is the predicted ${yLabel} when ${xLabel} = 0. It is only practically meaningful if ${xLabel} = 0 is within, or reasonably close to, the range of the observed data.`,
  });

  if (c.r === null || c.strength === null || c.direction === null || rSquared === null) {
    items.push({
      title: "Correlation",
      text: `Pearson's r is undefined because all ${yLabel} values are identical (there is no variation to correlate).`,
    });
  } else {
    const dirText =
      c.direction === "positive"
        ? `positive (${yLabel} tends to rise as ${xLabel} rises)`
        : c.direction === "negative"
          ? `negative (${yLabel} tends to fall as ${xLabel} rises)`
          : "absent";

    items.push({
      title: "Correlation strength and direction",
      text: `Pearson's r = ${formatNumber(c.r)}. Using |r| = ${formatNumber(Math.abs(c.r))}, the linear relationship is ${c.strength}, and its direction is ${dirText}.`,
    });
    items.push({
      title: "Coefficient of determination",
      text: `r² = ${formatNumber(rSquared)}, so about ${formatNumber(rSquared * 100, 2)}% of the variation in ${yLabel} is accounted for by the linear relationship with ${xLabel}.`,
    });
  }

  const cautions: string[] = ["Correlation does not by itself prove that changes in X cause changes in Y."];
  if (n < 10) cautions.push("With fewer than 10 observations, the estimates are unstable and should be treated cautiously.");
  cautions.push("Predictions outside the observed range of X (extrapolation) are unreliable.");
  items.push({ title: "Cautions", text: cautions.join(" ") });

  return items;
}

const TAIL_NAME = {
  left: "left-tailed",
  right: "right-tailed",
  two: "two-tailed",
} as const;

export function interpretZTest(result: ZTestResult, h0: string, h1: string): InterpretationItem[] {
  const { input, zStatistic: z, criticalValues: crit, pValue: p, decision } = result;
  const reject = decision === "reject";
  const critText = crit.length === 2 ? `±${formatNumber(crit[1])}` : formatNumber(crit[0]);
  const direction =
    input.tail === "two" ? "different from" : input.tail === "left" ? "less than" : "greater than";

  const items: InterpretationItem[] = [
    {
      title: "Z-statistic",
      text: `Z = ${formatNumber(z)}. The sample mean is ${formatNumber(input.sampleMean)} and the null hypothesis value is ${formatNumber(input.populationMean)}.`,
    },
    {
      title: "Significance level",
      text: `Using a significance level of ${formatNumber(input.alpha * 100, 2)}%, the rejection cutoff is ${critText} for a ${TAIL_NAME[input.tail]} test.`,
    },
    {
      title: "p-value",
      text: `The p-value is ${formatNumber(p, 4)}. This is the probability, assuming H0 is true, of obtaining a result at least as extreme as the observed sample.`,
    },
    {
      title: "Decision",
      text: reject
        ? `At the ${formatNumber(input.alpha * 100, 2)}% significance level, there is sufficient evidence to support H1: the population mean is ${direction} ${formatNumber(input.populationMean)}.${h1 ? ` (H1: ${h1})` : ""}`
        : `At the ${formatNumber(input.alpha * 100, 2)}% significance level, there is not sufficient evidence to support H1 (population mean ${direction} ${formatNumber(input.populationMean)}). This does not prove that H0 is true.${h0 ? ` (H0: ${h0})` : ""}`,
    },
  ];

  return items;
}

export function interpretCorrelation(result: { interpretation: string }) {
  return result.interpretation;
}

export function interpretHypothesis(result: { statistic: number; pValue: number; conclusion: string }) {
  return `The z-statistic is ${formatNumber(result.statistic, 3)} and the p-value is ${formatNumber(result.pValue, 4)}. ${result.conclusion}`;
}
