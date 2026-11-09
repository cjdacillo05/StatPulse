import { Activity, ArrowUpRight, Percent } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { NormalCurveChart } from "@/components/charts/normal-curve-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pearsonCorrelation } from "@/lib/statistics/correlation";
import { linearRegression } from "@/lib/statistics/regression";
import { oneSampleZTest } from "@/lib/statistics/hypothesis";

const data = [
  { x: 1, y: 2 },
  { x: 2, y: 4 },
  { x: 3, y: 5 },
  { x: 4, y: 6 },
  { x: 5, y: 9 },
  { x: 6, y: 10 },
];

export default function DashboardPage() {
  const regression = linearRegression(data);
  const correlation = pearsonCorrelation(data);
  const zTest = oneSampleZTest(105, 100, 12, 36);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Overview</p>
          <h1 className="mt-2 text-3xl font-bold">Statistical analysis dashboard</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Pearson r"
            value={correlation.r?.toFixed(3) ?? "N/A"}
            detail="Linear strength between variables"
            icon={<Activity className="h-5 w-5" />}
          />
          <StatCard
            label="Regression slope"
            value={Number.isFinite(regression.slope) ? regression.slope.toFixed(3) : "N/A"}
            detail="Average change in y per one-unit increase in x"
            icon={<ArrowUpRight className="h-5 w-5" />}
          />
          <StatCard
            label="p-value"
            value={zTest.pValue.toFixed(3)}
            detail="Evidence against the null hypothesis"
            icon={<Percent className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Regression summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{regression.equation}</p>
              <p className="mt-2 text-sm text-muted-foreground">R² = {regression.rSquared !== null ? regression.rSquared.toFixed(3) : "N/A"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribution spotlight</CardTitle>
            </CardHeader>
            <CardContent>
              <NormalCurveChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
