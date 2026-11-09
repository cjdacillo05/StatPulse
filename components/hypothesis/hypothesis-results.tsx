import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { NormalCurveChart } from "@/components/charts/normal-curve-chart";
import { interpretZTest } from "@/lib/interpretation";
import { formatNumber } from "@/lib/utils";
import type { TailType, ZTestResult } from "@/types";

const TAIL_NAME: Record<TailType, string> = {
  left: "Left-tailed",
  right: "Right-tailed",
  two: "Two-tailed",
};

function rejectionRule(tail: TailType, crit: number[]): string {
  if (tail === "left") return `Reject H0 if Z < ${formatNumber(crit[0], 4)}`;
  if (tail === "right") return `Reject H0 if Z > ${formatNumber(crit[0], 4)}`;
  return `Reject H0 if Z < ${formatNumber(crit[0], 4)} or Z > ${formatNumber(crit[1], 4)}`;
}

function methodLabel(reject: boolean) {
  return <Badge tone={reject ? "danger" : "success"}>{reject ? "Reject H0" : "Fail to reject H0"}</Badge>;
}

export function HypothesisResults({ result, h0, h1 }: { result: ZTestResult; h0: string; h1: string }) {
  const { input, zStatistic, criticalValues, pValue, decision, rejectByCriticalValue, rejectByPValue } = result;
  const reject = decision === "reject";
  const critText = criticalValues.length === 2 ? `±${formatNumber(criticalValues[1], 4)}` : formatNumber(criticalValues[0], 4);
  const interpretation = interpretZTest(result, h0, h1);

  return (
    <div className="space-y-6">
      <Card className={reject ? "border-danger/50" : "border-success/50"}>
        <CardHeader>
          <CardTitle>Statistical decision</CardTitle>
          <CardDescription>
            {TAIL_NAME[input.tail]} one-sample Z-test at α = {formatNumber(input.alpha)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className={`text-2xl font-semibold ${reject ? "text-danger" : "text-success"}`}>
            {reject ? "Reject the null hypothesis (H0)" : "Fail to reject the null hypothesis (H0)"}
          </p>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2">
              <span>Critical-value method</span>
              {methodLabel(rejectByCriticalValue)}
            </div>
            <div className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2">
              <span>P-value method</span>
              {methodLabel(rejectByPValue)}
            </div>
          </div>
          {rejectByCriticalValue !== rejectByPValue && (
            <Alert variant="warning">
              The two methods disagree. This should not happen except at an extremely close boundary caused by rounding; treat this result with caution.
            </Alert>
          )}
          {(h0 || h1) && (
            <dl className="grid gap-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-3">
              {h0 && (<><dt className="font-semibold">H0:</dt><dd className="text-muted-foreground">{h0}</dd></>)}
              {h1 && (<><dt className="font-semibold">H1:</dt><dd className="text-muted-foreground">{h1}</dd></>)}
            </dl>
          )}
        </CardContent>
      </Card>

      <section aria-label="Test statistics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Z-statistic" value={formatNumber(zStatistic, 6)} description="Z = (x̄ − μ) / (σ / √n)" />
        <StatCard label="Standard error (σ / √n)" value={formatNumber(result.standardError, 6)} />
        <StatCard label="Critical Z-value" value={critText} description={rejectionRule(input.tail, criticalValues)} />
        <StatCard label="P-value" value={formatNumber(pValue, 6)} />
        <StatCard label="Significance level (α)" value={formatNumber(input.alpha)} />
        <StatCard label="Test type" value={TAIL_NAME[input.tail]} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Standard normal distribution</CardTitle>
          <CardDescription>Shaded red = rejection region; shaded blue = non-rejection region.</CardDescription>
        </CardHeader>
        <CardContent>
          <NormalCurveChart zStatistic={zStatistic} criticalValues={criticalValues} tail={input.tail} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interpretation</CardTitle>
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
    </div>
  );
}
