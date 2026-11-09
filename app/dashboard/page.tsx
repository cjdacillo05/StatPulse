import Link from "next/link";
import { Activity, ArrowUpRight, BookOpen, Percent } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { NormalCurveChart } from "@/components/charts/normal-curve-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/current-user";
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

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const firstName = user?.fullName.split(" ")[0];

  const regression = linearRegression(data);
  const correlation = pearsonCorrelation(data);
  const zTest = oneSampleZTest(105, 100, 12, 36);

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="sp-gradient rounded-lg p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
            {firstName ? `Welcome back, ${firstName}` : "Welcome to StatPulse"}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Feel the pulse of your progress.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/85">
            Every lesson counts. Keep learning, keep improving.
          </p>
          <Link
            href="/study-guide"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-bold text-primary shadow-sm transition-opacity hover:opacity-90"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Open the Study Guide
          </Link>
        </section>

        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Overview</p>
          <h2 className="mt-2 text-2xl font-bold">Statistical analysis dashboard</h2>
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
              <p className="mt-2 text-sm text-muted-foreground">
                R² = {regression.rSquared !== null ? regression.rSquared.toFixed(3) : "N/A"}
              </p>
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
