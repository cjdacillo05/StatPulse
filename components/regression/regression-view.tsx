"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart3, Download, Printer, RotateCcw, Save } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/regression/data-table";
import { ResultsPanel, type AnalysisSnapshot } from "@/components/regression/results-panel";
import { SAMPLE_DATASETS } from "@/components/regression/sample-datasets";
import { buildRegressionCsv, downloadTextFile } from "@/lib/export";
import { StatisticsError } from "@/lib/statistics/errors";
import { linearRegression } from "@/lib/statistics/regression";
import { useHistory } from "@/lib/use-history";
import { generateId } from "@/lib/utils";
import { parseRegressionRows, type RowErrors, type RowInput } from "@/lib/validation";

const EMPTY_ROWS = (): RowInput[] => [1, 2, 3, 4, 5].map((n) => ({ id: `row-${n}`, x: "", y: "" }));

export function RegressionView() {
  const { save } = useHistory();

  const nextId = useRef(100);
  const newId = () => `row-${nextId.current++}`;
  const resultsRef = useRef<HTMLDivElement>(null);

  const [rows, setRows] = useState<RowInput[]>(EMPTY_ROWS);
  const [rowErrors, setRowErrors] = useState<Record<string, RowErrors>>({});
  const [xLabel, setXLabel] = useState("X");
  const [yLabel, setYLabel] = useState("Y");
  const [analysis, setAnalysis] = useState<AnalysisSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "failed" | null>(null);
  const [sampleValue, setSampleValue] = useState("");

  useEffect(() => {
    if (analysis) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [analysis]);

  function runAnalysis(sourceRows: RowInput[], xl: string, yl: string) {
    const parsed = parseRegressionRows(sourceRows);
    setRowErrors(parsed.errors);
    setSaveStatus(null);

    if (parsed.message) {
      setError(parsed.message);
      setAnalysis(null);
      return;
    }

    try {
      const result = linearRegression(parsed.points);
      const xLab = xl.trim() || "X";
      const yLab = yl.trim() || "Y";
      setAnalysis({ points: parsed.points, result, xLabel: xLab, yLabel: yLab });
      setTitle(`Regression: ${yLab} vs ${xLab}`);
      setError(null);
      setDirty(false);
    } catch (e) {
      setAnalysis(null);
      setError(
        e instanceof StatisticsError
          ? e.message
          : "Something went wrong while calculating. Please check your data and try again.",
      );
    }
  }

  function markEdited() {
    setDirty(true);
    setSaveStatus(null);
  }

  function handleChange(id: string, field: "x" | "y", value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    setRowErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    markEdited();
  }

  function handleRemove(id: string) {
    if (rows.length <= 2) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    markEdited();
  }

  function handleAdd() {
    setRows((prev) => [...prev, { id: newId(), x: "", y: "" }]);
  }

  function handlePaste(startIndex: number, text: string) {
    const pairs = text
      .trim()
      .split(/\r?\n/)
      .map((line) => line.trim().split(/[\t,; ]+/).filter(Boolean))
      .filter((cells) => cells.length > 0);

    const next = [...rows];
    pairs.forEach((cells, i) => {
      const idx = startIndex + i;
      const x = cells[0] ?? "";
      const y = cells[1] ?? "";
      if (idx < next.length) next[idx] = { ...next[idx], x, y };
      else next.push({ id: newId(), x, y });
    });
    setRows(next);
    setRowErrors({});
    markEdited();
  }

  function handleSample(id: string) {
    setSampleValue("");
    const ds = SAMPLE_DATASETS.find((d) => d.id === id);
    if (!ds) return;
    const sampleRows: RowInput[] = ds.points.map((p) => ({
      id: newId(),
      x: String(p.x),
      y: String(p.y),
    }));
    setRows(sampleRows);
    setXLabel(ds.xLabel);
    setYLabel(ds.yLabel);
    runAnalysis(sampleRows, ds.xLabel, ds.yLabel);
  }

  function handleReset() {
    setRows(EMPTY_ROWS());
    setRowErrors({});
    setXLabel("X");
    setYLabel("Y");
    setAnalysis(null);
    setError(null);
    setDirty(false);
    setTitle("");
    setSaveStatus(null);
  }

  function handleSave() {
    if (!analysis) return;
    const ok = save({
      id: generateId(),
      type: "regression",
      createdAt: new Date().toISOString(),
      title: title.trim() || `Regression: ${analysis.yLabel} vs ${analysis.xLabel}`,
      xLabel: analysis.xLabel,
      yLabel: analysis.yLabel,
      points: analysis.points,
      result: analysis.result,
    });
    setSaveStatus(ok ? "saved" : "failed");
  }

  function handleCsv() {
    if (!analysis) return;
    const csv = buildRegressionCsv(analysis.points, analysis.result, analysis.xLabel, analysis.yLabel);
    downloadTextFile("advstat-regression.csv", csv);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Simple Linear Regression"
        description="Enter paired X and Y values to fit the line Y = a + bX, measure the strength of the relationship with Pearson's r, and see everything on a scatter diagram."
      />

      <Card className="no-print">
        <CardHeader>
          <CardTitle>1. Enter your data</CardTitle>
          <CardDescription>
            At least 2 complete rows are needed, and the X values must not all be identical. Empty rows are ignored.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="X variable name" htmlFor="x-label">
              <Input
                id="x-label"
                value={xLabel}
                maxLength={40}
                onChange={(e) => {
                  setXLabel(e.target.value);
                  markEdited();
                }}
              />
            </Field>
            <Field label="Y variable name" htmlFor="y-label">
              <Input
                id="y-label"
                value={yLabel}
                maxLength={40}
                onChange={(e) => {
                  setYLabel(e.target.value);
                  markEdited();
                }}
              />
            </Field>
            <Field label="Sample datasets" htmlFor="sample" hint="Illustrative data, loaded and analysed instantly.">
              <Select id="sample" value={sampleValue} onChange={(e) => handleSample(e.target.value)}>
                <option value="">Load a sample…</option>
                {SAMPLE_DATASETS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <DataTable
            rows={rows}
            errors={rowErrors}
            xLabel={xLabel}
            yLabel={yLabel}
            onChange={handleChange}
            onRemove={handleRemove}
            onAdd={handleAdd}
            onPaste={handlePaste}
          />

          {error && <Alert variant="error">{error}</Alert>}

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => runAnalysis(rows, xLabel, yLabel)}>
              <BarChart3 className="h-4 w-4" /> Analyse data
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" /> Clear / reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <div ref={resultsRef} className="scroll-mt-20 space-y-6">
        {analysis && (
          <>
            <div className="hidden print:block">
              <h1 className="text-2xl font-bold">ADVSTAT – Simple Linear Regression Report</h1>
              <p className="text-sm">Generated {new Date().toLocaleString()}</p>
            </div>

            {dirty && (
              <Alert variant="warning" className="no-print">
                The data or labels changed since this analysis. Click “Analyse data” to update the results.
              </Alert>
            )}

            <Card className="no-print">
              <CardHeader>
                <CardTitle>2. Save or export</CardTitle>
                <CardDescription>Save to your analysis history, print, or download a CSV report.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field label="Title for history" htmlFor="save-title" className="max-w-md">
                  <Input id="save-title" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} />
                </Field>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4" /> Save to history
                  </Button>
                  <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" /> Print / save as PDF
                  </Button>
                  <Button variant="outline" onClick={handleCsv}>
                    <Download className="h-4 w-4" /> Download CSV
                  </Button>
                </div>
                {saveStatus === "saved" && <Alert variant="success">Saved. You can find it under Analysis History.</Alert>}
                {saveStatus === "failed" && (
                  <Alert variant="error">
                    Could not save. Your browser may have storage disabled or full (private mode can cause this).
                  </Alert>
                )}
              </CardContent>
            </Card>

            <ResultsPanel analysis={analysis} />
          </>
        )}
      </div>
    </div>
  );
}
