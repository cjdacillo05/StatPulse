import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { HistoryView } from "@/components/history/history-view";

export const metadata: Metadata = { title: "Analysis history" };

export default function HistoryPage() {
  return (
    <AppShell>
      <HistoryView />
    </AppShell>
  );
}
