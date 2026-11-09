import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { RegressionView } from "@/components/regression/regression-view";

export const metadata: Metadata = { title: "Simple Linear Regression · ADVSTAT" };

export default function RegressionPage() {
  return (
    <AppShell>
      <RegressionView />
    </AppShell>
  );
}
