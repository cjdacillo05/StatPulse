import { pearsonCorrelation } from "../lib/statistics/correlation";
import { linearRegression } from "../lib/statistics/regression";
import { oneSampleZTest, standardNormalCdf } from "../lib/statistics/hypothesis";

const correlation = pearsonCorrelation([
  { x: 1, y: 2 },
  { x: 2, y: 4 },
  { x: 3, y: 6 },
  { x: 4, y: 8 },
]);

const regression = linearRegression([
  { x: 1, y: 2 },
  { x: 2, y: 4 },
  { x: 3, y: 6 },
  { x: 4, y: 8 },
]);

const zTest = oneSampleZTest(105, 100, 12, 36);

const checks = [
  { label: "pearson r", value: correlation.r, expected: 1 },
  { label: "slope", value: regression.slope, expected: 2 },
  { label: "intercept", value: regression.intercept, expected: 0 },
  { label: "cdf(0)", value: standardNormalCdf(0), expected: 0.5 },
  { label: "z test z", value: zTest.statistic, expected: 2.5 },
];

let failed = false;
for (const check of checks) {
  const difference = Math.abs((check.value ?? 0) - check.expected);
  if (difference > 1e-6) {
    console.error(`FAIL: ${check.label} = ${check.value}; expected ${check.expected}`);
    failed = true;
  }
}

if (!failed) {
  console.log("All statistics checks passed.");
} else {
  process.exitCode = 1;
}
