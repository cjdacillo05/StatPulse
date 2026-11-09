import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { CATEGORIES, LESSONS } from "@/lib/study-guide/content";
import { REFERENCES } from "@/lib/study-guide/references";

export const metadata: Metadata = { title: "References" };

export default function ReferencesPage() {
  const groups = CATEGORIES.map((category) => {
    const ids = new Set(
      LESSONS.filter((l) => l.category === category).flatMap((l) => l.referenceIds),
    );
    return { category, refs: REFERENCES.filter((r) => ids.has(r.id)) };
  });

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Sources</p>
          <h1 className="mt-2 text-3xl font-bold">References</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            The study guide lessons are written in StatPulse's own words and use standard statistical formulas. These
            are the open educational sources that cover the same topics.
          </p>
        </div>

        {groups.map(({ category, refs }) => (
          <section key={category} aria-label={category}>
            <h2 className="mb-3 text-lg font-bold text-foreground">{category}</h2>
            <ul className="space-y-3">
              {refs.map((r) => (
                <li key={r.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                  <p className="font-bold text-card-foreground">{r.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {r.author}
                    {r.date ? ` (${r.date})` : ""}
                  </p>
                  <p className="mt-2 text-sm text-card-foreground">{r.note}</p>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    Open source <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
