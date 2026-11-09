"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES, LESSONS, type Category } from "@/lib/study-guide/content";
import { REFERENCES, type Reference } from "@/lib/study-guide/references";

type Filter = "All" | Category;

export function StudyGuideBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Filter>("All");
  const [selectedId, setSelectedId] = useState<string>(LESSONS[0].id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LESSONS.filter((lesson) => {
      if (category !== "All" && lesson.category !== category) return false;
      if (!q) return true;
      const haystack = [
        lesson.title,
        lesson.summary,
        ...lesson.explanation,
        ...lesson.terms.map((t) => `${t.term} ${t.definition}`),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, category]);

  const selected = filtered.find((l) => l.id === selectedId) ?? filtered[0] ?? null;
  const sources: Reference[] = selected
    ? selected.referenceIds
        .map((id) => REFERENCES.find((r) => r.id === id))
        .filter((r): r is Reference => Boolean(r))
    : [];

  const filters: Filter[] = ["All", ...CATEGORIES];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="relative">
          <label htmlFor="study-search" className="sr-only">
            Search the study guide
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="study-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics, terms or formulas…"
            className="h-11 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setCategory(f)}
              aria-pressed={category === f}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                category === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          No lessons match your search. Try a different word or clear the filter.
        </p>
      )}

      {selected && (
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <nav aria-label="Lessons" className="max-h-72 space-y-2 overflow-y-auto lg:max-h-none">
            {filtered.map((lesson) => (
              <button
                key={lesson.id}
                type="button"
                onClick={() => setSelectedId(lesson.id)}
                aria-current={selected.id === lesson.id ? "true" : undefined}
                className={cn(
                  "w-full rounded-lg border p-3 text-left transition-colors",
                  selected.id === lesson.id
                    ? "border-primary bg-accent"
                    : "border-border bg-card hover:bg-muted",
                )}
              >
                <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {lesson.category}
                </span>
                <span className="mt-0.5 block text-sm font-bold text-card-foreground">{lesson.title}</span>
              </button>
            ))}
          </nav>

          <article className="space-y-6 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
            <header>
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                {selected.category}
              </span>
              <h2 className="mt-2 text-2xl font-bold text-card-foreground">{selected.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{selected.summary}</p>
            </header>

            <section aria-label="Explanation" className="space-y-3 text-sm leading-relaxed text-card-foreground">
              {selected.explanation.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>

            {selected.formulas.length > 0 && (
              <section aria-label="Formulas">
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Formulas</h3>
                <div className="space-y-2">
                  {selected.formulas.map((f) => (
                    <div key={f.label} className="overflow-x-auto rounded-md border border-border bg-muted p-3">
                      <p className="text-xs font-semibold text-muted-foreground">{f.label}</p>
                      <p className="mt-1 whitespace-nowrap font-mono text-sm text-foreground">{f.expression}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section aria-label="Key terms">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Key terms</h3>
              <dl className="grid gap-3 sm:grid-cols-2">
                {selected.terms.map((t) => (
                  <div key={t.term} className="rounded-md border border-border p-3">
                    <dt className="text-sm font-bold text-card-foreground">{t.term}</dt>
                    <dd className="mt-1 text-sm text-muted-foreground">{t.definition}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {selected.example && (
              <section aria-label="Worked example" className="rounded-md border border-primary/30 bg-accent p-4">
                <h3 className="text-sm font-bold text-accent-foreground">Example: {selected.example.title}</h3>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-foreground">
                  {selected.example.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </section>
            )}

            <section aria-label="Notes">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Important notes</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-card-foreground">
                {selected.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </section>

            {sources.length > 0 && (
              <section aria-label="Sources" className="border-t border-border pt-4">
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Sources</h3>
                <ul className="space-y-1 text-sm">
                  {sources.map((r) => (
                    <li key={r.id}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        {r.title}
                        <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>
        </div>
      )}
    </div>
  );
}
