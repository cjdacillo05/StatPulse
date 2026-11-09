"use client";

import { useCallback, useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { HypothesisResults } from "@/components/hypothesis/hypothesis-results";
import { ResultsPanel } from "@/components/regression/results-panel";
import { formatEquation } from "@/lib/statistics/regression";
import { useHistory } from "@/lib/use-history";
import { cn, formatDate, formatNumber } from "@/lib/utils";
import type { AnalysisRecord } from "@/types";

type Filter = "all" | "regression" | "hypothesis";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "regression", label: "Regression" },
  { value: "hypothesis", label: "Hypothesis tests" },
];

function summarize(record: AnalysisRecord): string {
  try {
    if (record.type === "regression") {
      const r = record.result.correlation.r;
      return `${formatEquation(record.result)} · r = ${r === null ? "undefined" : formatNumber(r, 4)} · n = ${record.result.n}`;
    }
    return `Z = ${formatNumber(record.result.zStatistic, 4)} · p = ${formatNumber(record.result.pValue, 5)} · ${record.result.decision === "reject" ? "Reject H0" : "Fail to reject H0"}`;
  } catch {
    return "Summary unavailable";
  }
}

function RecordDetail({ record }: { record: AnalysisRecord }) {
  try {
    if (record.type === "regression") {
      return (
        <ResultsPanel
          analysis={{
            points: record.points,
            result: record.result,
            xLabel: record.xLabel || "X",
            yLabel: record.yLabel || "Y",
          }}
        />
      );
    }
    return <HypothesisResults result={record.result} h0={record.h0 ?? ""} h1={record.h1 ?? ""} />;
  } catch {
    return <Alert variant="error">This saved record is damaged and cannot be displayed. You can delete it.</Alert>;
  }
}

export function HistoryView() {
  const { records, loaded, remove, clear } = useHistory();
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<AnalysisRecord | null>(null);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const closeDialog = useCallback(() => setSelected(null), []);
  const visible = records.filter((r) => filter === "all" || r.type === filter);

  function handleDelete(record: AnalysisRecord) {
    if (!window.confirm(`Delete "${record.title}"? This cannot be undone.`)) return;
    const ok = remove(record.id);
    if (selected?.id === record.id) setSelected(null);
    setMessage(ok ? { kind: "success", text: "Record deleted." } : { kind: "error", text: "Could not delete the record. Browser storage may be unavailable." });
  }

  function handleClear() {
    if (!window.confirm(`Delete all ${records.length} saved analyses? This cannot be undone.`)) return;
    const ok = clear();
    setSelected(null);
    setMessage(ok ? { kind: "success", text: "History cleared." } : { kind: "error", text: "Could not clear history. Browser storage may be unavailable." });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analysis History"
        description="Analyses you saved from the regression and hypothesis-testing pages. They are stored in this browser only (localStorage)."
        actions={<Button variant="danger" size="sm" onClick={handleClear} disabled={records.length === 0}><Trash2 className="h-4 w-4" /> Clear history</Button>}
      />

      {message && <Alert variant={message.kind}>{message.text}</Alert>}

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by analysis type">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition",
              filter === f.value ? "border-primary bg-accent font-medium text-accent-foreground" : "border-border hover:bg-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0 pt-0">
          {!loaded ? (
            <div className="m-5 h-24 animate-pulse rounded-md bg-muted" aria-label="Loading" />
          ) : visible.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              {records.length === 0 ? "No saved analyses yet. Run a regression or Z-test and click 'Save to history'." : "No saved analyses of this type."}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {visible.map((r) => (
                <li key={r.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{r.title}</p>
                      <Badge tone="primary">{r.type === "regression" ? "Regression" : "Hypothesis test"}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                    <p className="break-words text-sm text-muted-foreground">{summarize(r)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelected(r)}>
                      <Eye className="h-4 w-4" /> View
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(r)} aria-label={`Delete ${r.title}`}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={selected !== null} onClose={closeDialog} title={selected?.title ?? ""}>
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Saved {formatDate(selected.createdAt)} · {selected.type === "regression" ? "Simple Linear Regression" : "One-sample Z-test"}
            </p>
            <RecordDetail record={selected} />
          </div>
        )}
      </Dialog>
    </div>
  );
}
