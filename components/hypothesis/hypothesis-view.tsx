"use client";

import { useRef, useState } from "react";
import { FlaskConical, Printer, RotateCcw, Save } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { HypothesisResults } from "@/components/hypothesis/hypothesis-results";
import { useHistory } from "@/lib/use-history";
import { generateId } from "@/lib/utils";
import { parseZTestForm } from "@/lib/validation";
import { runZTest } from "@/lib/statistics/hypothesis";
import type { TailType, ZTestResult } from "@/types";

interface Output {
  result: ZTestResult;
  h0: string;
  h1: string;
}

type AlphaChoice = "0.10" | "0.05" | "0.01" | "custom";

const TAILS: { value: TailType; label: string; symbol: string }[] = [
  { value: "left", label: "Left-tailed", symbol: "H1: μ < μ0" },
  { value: "right", label: "Right-tailed", symbol: "H1: μ > μ0" },
  { value: "two", label: "Two-tailed", symbol: "H1: μ ≠ μ0" },
];

export function HypothesisView() {
  const { save } = useHistory();
  const resultsRef = useRef<HTMLDivElement>(null);

  const [h0, setH0] = useState("");
  const [h1, setH1] = useState("");
  const [tail, setTail] = useState<TailType>("two");
  const [alphaChoice, setAlphaChoice] = useState<AlphaChoice>("0.05");
  const [customAlpha, setCustomAlpha] = useState("");
  const [sampleMean, setSampleMean] = useState("");
  const [populationMean, setPopulationMean] = useState("");
  const [populationStdDev, setPopulationStdDev] = useState("");
  const [sampleSize, setSampleSize] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [output, setOutput] = useState<Output | null>(null);
  const [dirty, setDirty] = useState(false);
  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "failed" | null>(null);

  function clearError(field: string) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function edited() {
    setDirty(true);
    setSaveStatus(null);
  }

  function getAlpha(): number {
    const alpha = alphaChoice === "custom" ? Number(customAlpha) : Number(alphaChoice);
    if (!Number.isFinite(alpha)) return 0.05;
    return alpha;
  }

  function run() {
    const parsed = parseZTestForm({
      sampleMean,
      populationMean,
      populationStdDev,
      sampleSize,
      alpha: String(getAlpha()),
      tail,
      h0,
      h1,
    });

    if (!parsed.ok) {
      setErrors(parsed.errors);
      setFormError("Please fix the highlighted fields before running the test.");
      setOutput(null);
      return;
    }

    const result = runZTest(parsed.data);
    setOutput({ result, h0: h0.trim(), h1: h1.trim() });
    setErrors({});
    setFormError(null);
    setDirty(false);
    setTitle(`Z Test: ${parsed.data.sampleMean} / ${parsed.data.populationMean}`);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function loadExample() {
    setH0("μ = 100");
    setH1("μ ≠ 100");
    setTail("two");
    setAlphaChoice("0.05");
    setCustomAlpha("");
    setSampleMean("105");
    setPopulationMean("100");
    setPopulationStdDev("12");
    setSampleSize("36");
    setErrors({});
    setFormError(null);
    const parsed = parseZTestForm({
      sampleMean: "105",
      populationMean: "100",
      populationStdDev: "12",
      sampleSize: "36",
      alpha: "0.05",
      tail: "two",
      h0: "μ = 100",
      h1: "μ ≠ 100",
    });
    if (parsed.ok) {
      const result = runZTest(parsed.data);
      setOutput({ result, h0: "μ = 100", h1: "μ ≠ 100" });
      setTitle("Z Test: 105 vs 100");
    }
    setDirty(false);
  }

  function reset() {
    setH0("");
    setH1("");
    setTail("two");
    setAlphaChoice("0.05");
    setCustomAlpha("");
    setSampleMean("");
    setPopulationMean("");
    setPopulationStdDev("");
    setSampleSize("");
    setErrors({});
    setFormError(null);
    setOutput(null);
    setDirty(false);
    setTitle("");
    setSaveStatus(null);
  }

  function handleSave() {
    if (!output) return;
    const ok = save({
      id: generateId(),
      type: "hypothesis",
      createdAt: new Date().toISOString(),
      title: title.trim() || "Z-test result",
      h0: output.h0,
      h1: output.h1,
      result: output.result,
    });
    setSaveStatus(ok ? "saved" : "failed");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="One-sample Z-test" description="Test whether a sample mean differs from a hypothesized population mean when the population standard deviation is known." />

      <Card className="no-print">
        <CardHeader>
          <CardTitle>1. Enter test details</CardTitle>
          <CardDescription>Use the form below to define the null and alternative hypotheses and enter your sample information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Null hypothesis (H0)" htmlFor="h0" hint="Optional but recommended.">
              <Input id="h0" value={h0} onChange={(e) => { setH0(e.target.value); edited(); clearError("h0"); }} />
            </Field>
            <Field label="Alternative hypothesis (H1)" htmlFor="h1" hint="Optional but recommended.">
              <Input id="h1" value={h1} onChange={(e) => { setH1(e.target.value); edited(); clearError("h1"); }} />
            </Field>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">Test type</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {TAILS.map((t) => (
                <label key={t.value} className={`flex cursor-pointer flex-col rounded-md border px-3 py-2.5 text-sm transition ${tail === t.value ? "border-primary bg-accent text-accent-foreground" : "border-border hover:bg-muted"}`}>
                  <span className="flex items-center gap-2 font-medium">
                    <input type="radio" name="tail" value={t.value} checked={tail === t.value} onChange={() => { setTail(t.value); edited(); }} className="accent-[hsl(var(--primary))]" />
                    {t.label}
                  </span>
                  <span className="mt-0.5 pl-6 text-xs text-muted-foreground">{t.symbol}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Significance level (α)" htmlFor="alpha-choice">
              <Select id="alpha-choice" value={alphaChoice} onChange={(e) => { setAlphaChoice(e.target.value as AlphaChoice); clearError("alpha"); edited(); }}>
                <option value="0.10">0.10</option>
                <option value="0.05">0.05</option>
                <option value="0.01">0.01</option>
                <option value="custom">Custom…</option>
              </Select>
            </Field>
            {alphaChoice === "custom" && (
              <Field label="Custom α" htmlFor="alpha-custom" error={errors.alpha} hint="Between 0.0001 and 0.5.">
                <Input id="alpha-custom" inputMode="decimal" value={customAlpha} invalid={!!errors.alpha} placeholder="0.025" onChange={(e) => { setCustomAlpha(e.target.value); clearError("alpha"); edited(); }} />
              </Field>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sample mean (x̄)" htmlFor="sample-mean" error={errors.sampleMean}>
              <Input id="sample-mean" inputMode="decimal" value={sampleMean} invalid={!!errors.sampleMean} onChange={(e) => { setSampleMean(e.target.value); clearError("sampleMean"); edited(); }} />
            </Field>
            <Field label="Population mean (μ)" htmlFor="population-mean" error={errors.populationMean}>
              <Input id="population-mean" inputMode="decimal" value={populationMean} invalid={!!errors.populationMean} onChange={(e) => { setPopulationMean(e.target.value); clearError("populationMean"); edited(); }} />
            </Field>
            <Field label="Population standard deviation (σ)" htmlFor="population-sd" error={errors.populationStdDev} hint="Must be greater than 0.">
              <Input id="population-sd" inputMode="decimal" value={populationStdDev} invalid={!!errors.populationStdDev} onChange={(e) => { setPopulationStdDev(e.target.value); clearError("populationStdDev"); edited(); }} />
            </Field>
            <Field label="Sample size (n)" htmlFor="sample-size" error={errors.sampleSize} hint="Whole number of at least 1.">
              <Input id="sample-size" inputMode="numeric" value={sampleSize} invalid={!!errors.sampleSize} onChange={(e) => { setSampleSize(e.target.value); clearError("sampleSize"); edited(); }} />
            </Field>
          </div>

          {formError && <Alert variant="error">{formError}</Alert>}

          <div className="flex flex-wrap gap-3">
            <Button onClick={run}><FlaskConical className="h-4 w-4" /> Run Z-test</Button>
            <Button variant="outline" onClick={loadExample}>Load illustrative example</Button>
            <Button variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" /> Clear / reset</Button>
          </div>
        </CardContent>
      </Card>

      <div ref={resultsRef} className="scroll-mt-20 space-y-6">
        {output && (
          <>
            <div className="hidden print:block">
              <h1 className="text-2xl font-bold">ADVSTAT – One-Sample Z-Test Report</h1>
              <p className="text-sm">Generated {new Date().toLocaleString()}</p>
            </div>

            {dirty && <Alert variant="warning" className="no-print">The inputs changed since this test was run. Click “Run Z-test” to update the results.</Alert>}

            <Card className="no-print">
              <CardHeader>
                <CardTitle>2. Save or export</CardTitle>
                <CardDescription>Save to your analysis history or print / save as PDF.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field label="Title for history" htmlFor="save-title" className="max-w-md">
                  <Input id="save-title" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} />
                </Field>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleSave}><Save className="h-4 w-4" /> Save to history</Button>
                  <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print / save as PDF</Button>
                </div>
                {saveStatus === "saved" && <Alert variant="success">Saved. You can find it under Analysis History.</Alert>}
                {saveStatus === "failed" && <Alert variant="error">Could not save. Your browser may have storage disabled or full (private mode can cause this).</Alert>}
              </CardContent>
            </Card>

            <HypothesisResults result={output.result} h0={output.h0} h1={output.h1} />
          </>
        )}
      </div>
    </div>
  );
}
