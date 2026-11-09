import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { AboutView } from "@/components/about/about-view";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <AppShell>
      <AboutView />
    </AppShell>
  );
}
