import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { StudyGuideBrowser } from "@/components/study-guide/study-guide-browser";

export const metadata: Metadata = { title: "Study Guide" };

export default function StudyGuidePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Learn</p>
          <h1 className="mt-2 text-3xl font-bold">Study Guide</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Short lessons, key terms, formulas and worked examples for the statistics topics used in StatPulse.
          </p>
        </div>
        <StudyGuideBrowser />
      </div>
    </AppShell>
  );
}
