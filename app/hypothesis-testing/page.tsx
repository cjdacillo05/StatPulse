import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { HypothesisTester } from "@/components/hypothesis/hypothesis-tester";

export const metadata: Metadata = { title: "Hypothesis testing" };

export default function HypothesisTestingPage() {
  return (
    <AppShell>
      <HypothesisTester />
    </AppShell>
  );
}
