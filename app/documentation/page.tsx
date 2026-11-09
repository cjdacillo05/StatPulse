import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { DocumentationView } from "@/components/documentation/documentation-view";

export const metadata: Metadata = { title: "Documentation" };

export default function DocumentationPage() {
  return (
    <AppShell>
      <DocumentationView />
    </AppShell>
  );
}
