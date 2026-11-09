import { tCdf, tQuantile, tPdf } from "@/lib/statistics/t-distribution";
import { runMeanTest, type MeanTail } from "@/lib/statistics/mean-test";
import { StatisticsError } from "@/lib/statistics/errors";

let passed = 0;
let failed = 0;

function close(name: string, actual: number, expected: number, tol = 1e-9) {
  const ok = Math.abs(actual - expected) <= tol * Math.max(1, Math.abs(expected));
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}: expected ${expected}, got ${actual}`);
  }
}

function check(name: string, condition: boolean) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}`);
  }
}

console.log("\nt-distribution (reference values from standard tables / scipy)");
close("t(0.975, df=10) = 2.228138851986274", tQuantile(0.975, 10), 2.228138851986274, 1e-9);
close("t(0.975, df=29) = 2.045229642132703", tQuantile(0.975, 29), 2.045229642132703, 1e-9);
close("t(0.95, df=5) = 2.0150483733330233", tQuantile(0.95, 5), 2.0150483733330233, 1e-9);
close("t(0.995, df=1) = 63.656741162871526", tQuantile(0.995, 1), 63.656741162871526, 1e-8);
close("tCdf(0, df=7) = 0.5", tCdf(0, 7), 0.5, 1e-12);
close("tCdf(2, df=10) = 0.9633059826146299", tCdf(2, 10), 0.9633059826146299, 1e-12);
close("tCdf(-2.5, df=4) = 0.03338327240599407", tCdf(-2.5, 4), 0.03338327240599407, 1e-10);
close("tPdf(0, df=5) = 0.3796066898224944", tPdf(0, 5), 0.3796066898224944, 1e-12);
check("symmetry tCdf(−x) + tCdf(x) = 1", Math.abs(tCdf(-1.7, 12) + tCdf(1.7, 12) - 1) < 1e-13);

console.log("\nZ-test through runMeanTest: x̄ = 38, μ₀ = 40, σ = 9.5, n = 50, two-tailed, α = 0.05");
{
  const r = runMeanTest({
    kind: "z",
    sampleMean: 38,
    hypothesizedMean: 40,
    spread: 9.5,
    sampleSize: 50,
    alpha: 0.05,
    tail: "two",
  });
  close("SE = 9.5/√50", r.standardError, 9.5 / Math.sqrt(50), 1e-12);
  close("Z = −2 / SE", r.statistic, -2 / (9.5 / Math.sqrt(50)), 1e-12);
  close("critical = ±1.959964", r.criticalValues[1], 1.959963984540054, 1e-9);
  check("fail to reject", r.decision === "fail-to-reject");
  check("df is null for Z", r.df === null);
}

console.log("\nt-test: x̄ = 52, μ₀ = 50, s = 6, n = 16 (df = 15), two-tailed, α = 0.05");
{
  const r = runMeanTest({
    kind: "t",
    sampleMean: 52,
    hypothesizedMean: 50,
    spread: 6,
    sampleSize: 16,
    alpha: 0.05,
    tail: "two",
  });
  close("t = 2 / 1.5", r.statistic, 2 / 1.5, 1e-12);
  check("df = 15", r.df === 15);
  close("critical = ±2.131449545559776", r.criticalValues[1], 2.131449545559776, 1e-9);
  close("two-tailed p = 0.20231858347363801", r.pValue, 0.20231858347363801, 1e-9);
  check("fail to reject", r.decision === "fail-to-reject");
}

console.log("\nCritical-value and p-value methods agree (Z and t)");
{
  let mismatches = 0;
  for (const kind of ["z", "t"] as const) {
    for (const tail of ["left", "right", "two"] as MeanTail[]) {
      for (const alpha of [0.1, 0.05, 0.025, 0.01]) {
        for (let mean = 40; mean <= 60; mean += 0.5) {
          const r = runMeanTest({
            kind,
            sampleMean: mean,
            hypothesizedMean: 50,
            spread: 10,
            sampleSize: 16,
            alpha,
            tail,
          });
          if (r.rejectByCriticalValue !== r.rejectByPValue) mismatches++;
        }
      }
    }
  }
  check("no disagreements across 2 tests × 3 tails × 4 alphas × 41 means", mismatches === 0);
}

console.log("\nValidation");
{
  const ok = {
    kind: "t" as const,
    sampleMean: 52,
    hypothesizedMean: 50,
    spread: 6,
    sampleSize: 16,
    alpha: 0.05,
    tail: "two" as MeanTail,
  };
  const expectThrow = (name: string, patch: Partial<typeof ok>) => {
    let threw = false;
    try {
      runMeanTest({ ...ok, ...patch });
    } catch (e) {
      threw = e instanceof StatisticsError;
    }
    check(name, threw);
  };
  expectThrow("s = 0 rejected", { spread: 0 });
  expectThrow("t-test with n = 1 rejected", { sampleSize: 1 });
  expectThrow("non-integer n rejected", { sampleSize: 10.5 });
  expectThrow("α = 0 rejected", { alpha: 0 });
  expectThrow("NaN mean rejected", { sampleMean: NaN });
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
