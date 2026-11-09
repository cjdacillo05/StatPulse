"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Activity, RotateCcw, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { CurveChart } from "@/components/hypothesis/curve-chart";
import { TTable } from "@/components/hypothesis/t-table";
import { ZTable } from "@/components/hypothesis/z-table";
import { StatisticsError } from "@/lib/statistics/errors";
import { runMeanTest, type MeanTail, type MeanTestKind, type MeanTestResult } from "@/lib/statistics/mean-test";

const H1_TO_TAIL: Record<"ne" | "lt" | "gt", MeanTail> = { ne: "two", lt: "left", gt: "right" };
const H1_SYMBOL: Record<"ne" | "lt" | "gt", string> = { ne: "≠", lt: "<", gt: ">" };
const TAIL_TEXT: Record<MeanTail, string> = { two: "two-tailed", left: "left-tailed", right: "right-tailed" };
const ALPHA_CHOICES = ["0.10", "0.05", "0.025", "0.01"] as const;
const SAMPLE_VALUES: Record<MeanTestKind, { mean: string; mu0: string; spread: string; n: string }> = {
  z: { mean: "38", mu0: "40", spread: "9.5", n: "50" },
  t: { mean: "36", mu0: "40", spread: "7", n: "16" },
};

function parseNumber(label: string, raw: string): number {
  const value = raw.trim() === "" ? Number.NaN : Number(raw);
  if (!Number.isFinite(value)) throw new StatisticsError(`Enter a valid number for ${label}.`);
  return value;
}

function formatP(p: number): string {
  return p < 0.0001 ? "< 0.0001" : p.toFixed(4);
}

function conclusion(r: MeanTestResult, h1: "ne" | "lt" | "gt"): string {
  const label = r.kind === "z" ? "Z" : "t";
  const crit = r.criticalValues;
  const reject = r.decision === "reject";
  let where: string;
  if (r.input.tail === "two") {
    const c = Math.abs(crit[1]).toFixed(3);
    where = reject ? `is beyond ±${c}, so it falls in the rejection region` : `is not beyond ±${c}, so it stays in the non-rejection region`;
  } else if (r.input.tail === "left") {
    where = reject ? `is below ${crit[0].toFixed(3)}, so it falls in the rejection region` : `is not below ${crit[0].toFixed(3)}, so it stays in the non-rejection region`;
  } else {
    where = reject ? `is above ${crit[0].toFixed(3)}, so it falls in the rejection region` : `is not above ${crit[0].toFixed(3)}, so it stays in the non-rejection region`;
  }
  const h1Text = `μ ${H1_SYMBOL[h1]} ${r.input.hypothesizedMean}`;
  const ending = reject ? `There is enough evidence to support H₁ (${h1Text}).` : `There is not enough evidence to support H₁ (${h1Text}).`;
  return `${label} = ${r.statistic.toFixed(4)} ${where} at α = ${r.input.alpha}. ${ending}`;
}

const inputClass = "h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function Section({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-card-foreground">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums text-card-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

interface Outcome {
  id: number;
  result: MeanTestResult;
  h1: "ne" | "lt" | "gt";
  name: string;
}

export function HypothesisTester() {
  const [kind, setKind] = useState<MeanTestKind>("z");
  const [h1, setH1] = useState<"ne" | "lt" | "gt">("ne");
  const [alphaChoice, setAlphaChoice] = useState<string>("0.05");
  const [customAlpha, setCustomAlpha] = useState("");
  const [mu0, setMu0] = useState("");
  const [mean, setMean] = useState("");
  const [spread, setSpread] = useState("");
  const [n, setN] = useState("");
  const [name, setName] = useState("");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const counter = useRef(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const symbol = kind === "z" ? "Z" : "t";

  function changeKind(next: MeanTestKind) {
    setKind(next);
    setOutcome(null);
    setError(null);
  }

  function loadSample() {
    const sample = SAMPLE_VALUES[kind];
    setMean(sample.mean);
    setMu0(sample.mu0);
    setSpread(sample.spread);
    setN(sample.n);
    setError(null);
  }

  function clearAll() {
    setMean("");
    setMu0("");
    setSpread("");
    setN("");
    setName("");
    setAlphaChoice("0.05");
    setCustomAlpha("");
    setH1("ne");
    setOutcome(null);
    setError(null);
  }

  function calculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const alpha = alphaChoice === "custom" ? parseNumber("the significance level (α)", customAlpha) : Number(alphaChoice);
      const result = runMeanTest({
        kind,
        hypothesizedMean: parseNumber("the hypothesized mean (μ₀)", mu0),
        sampleMean: parseNumber("the sample mean (x̄)", mean),
        spread: parseNumber(kind === "z" ? "the population standard deviation (σ)" : "the sample standard deviation (s)", spread),
        sampleSize: parseNumber("the sample size (n)", n),
        alpha,
        tail: H1_TO_TAIL[h1],
      });

      counter.current += 1;
      setOutcome({
        id: counter.current,
        result,
        h1,
        name: name.trim() || `${kind === "z" ? "Z-test" : "t-test"}: μ ${H1_SYMBOL[h1]} ${result.input.hypothesizedMean}`,
      });
      requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ block: "start", behavior: "auto" }));
    } catch (err) {
      setOutcome(null);
      setError(err instanceof StatisticsError ? err.message : "Something went wrong. Check your inputs.");
    }
  }

  const r = outcome?.result;
  const small = kind === "z" && Number(n) > 0 && Number(n) < 30;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Hypothesis testing</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Test a claim about a population mean with a Z-test or a t-test. You get the test statistic, critical values, p-value, a decision, and a plain-language conclusion.</p>
      </div>

      <form onSubmit={calculate} className="space-y-6" noValidate>
        <Section title="1. Hypothesis setup" subtitle="Choose the test and α, then pick the signs for H₀ and H₁.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Test type">
              <select className={inputClass} value={kind} onChange={(e) => changeKind(e.target.value as MeanTestKind)}>
                <option value="z">Z-test (σ known, n ≥ 30)</option>
                <option value="t">t-test (σ unknown, uses sample SD)</option>
              </select>
            </Field>
            <Field label="Alternative hypothesis (H₁)">
              <select className={inputClass} value={h1} onChange={(e) => setH1(e.target.value as "ne" | "lt" | "gt")}>
                <option value="ne">μ ≠ μ₀</option>
                <option value="lt">μ &lt; μ₀</option>
                <option value="gt">μ &gt; μ₀</option>
              </select>
            </Field>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Significance level (α)">
              <select className={inputClass} value={alphaChoice} onChange={(e) => setAlphaChoice(e.target.value)}>
                {ALPHA_CHOICES.map((option) => <option key={option} value={option}>{option}</option>)}
                <option value="custom">Custom…</option>
              </select>
            </Field>
            {alphaChoice === "custom" && (
              <Field label="Custom α" hint="Between 0.0001 and 0.5.">
                <input className={inputClass} inputMode="decimal" value={customAlpha} onChange={(e) => setCustomAlpha(e.target.value)} />
              </Field>
            )}
          </div>
        </Section>

        <Section title="2. Sample information">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hypothesized mean (μ₀)">
              <input className={inputClass} inputMode="decimal" value={mu0} onChange={(e) => setMu0(e.target.value)} />
            </Field>
            <Field label="Sample mean (x̄)">
              <input className={inputClass} inputMode="decimal" value={mean} onChange={(e) => setMean(e.target.value)} />
            </Field>
            <Field
              label={kind === "z" ? "Known population standard deviation (σ)" : "Sample standard deviation (s)"}
              hint={kind === "t" ? "Degrees of freedom: n − 1" : undefined}
            >
              <input className={inputClass} inputMode="decimal" value={spread} onChange={(e) => setSpread(e.target.value)} />
            </Field>
            <Field label="Sample size (n)">
              <input className={inputClass} inputMode="numeric" value={n} onChange={(e) => setN(e.target.value)} />
            </Field>
            <Field label="Analysis name (optional)" hint="Auto-named if left blank.">
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
          </div>

          {small && (
            <p className="mt-4 flex items-start gap-2 rounded-md bg-warning/15 px-3 py-2 text-xs text-foreground">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" aria-hidden />
              n is below 30. A Z-test assumes σ is known and the population is roughly normal. If σ is unknown, switch to the t-test.
            </p>
          )}

          {error && <p role="alert" className="mt-4 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

          <div className="mt-5 flex items-center justify-between gap-3">
            <button type="button" onClick={clearAll} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><RotateCcw className="h-4 w-4" aria-hidden /> Clear</button>
            <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"><Activity className="h-4 w-4" aria-hidden /> Calculate {symbol}-statistic</button>
          </div>
        </Section>
      </form>

      {outcome && r && (
        <div ref={resultsRef} className="scroll-mt-4 space-y-6">
          <p className="text-sm font-semibold text-muted-foreground">Results for <span className="text-foreground">{outcome.name}</span></p>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label={`Calculated ${symbol}`} value={r.statistic.toFixed(4)} hint={r.kind === "t" ? `Test statistic, df = ${r.df}` : "Test statistic"} />
            <StatCard label={`Critical ${symbol} value(s)`} value={r.input.tail === "two" ? `${r.criticalValues[0].toFixed(3)} / ${r.criticalValues[1].toFixed(3)}` : r.criticalValues[0].toFixed(3)} hint={`α = ${r.input.alpha}, ${TAIL_TEXT[r.input.tail]}`} />
            <div className={cn("rounded-lg border p-4 shadow-sm", r.decision === "reject" ? "border-primary bg-primary text-primary-foreground" : "border-primary/40 bg-accent text-accent-foreground")}>
              <p className="text-xs font-semibold opacity-80">Decision</p>
              <p className="mt-1 text-2xl font-extrabold">{r.decision === "reject" ? "Reject H₀" : "Fail to reject H₀"}</p>
              <p className="mt-1 text-xs opacity-80">{symbol} is {r.decision === "reject" ? "inside" : "outside"} the rejection region</p>
            </div>
          </div>

          <Section title="3. Curve and critical regions" subtitle="Rejection regions are shaded according to the selected tail and α.">
            <CurveChart kind={r.kind} df={r.df} tail={r.input.tail} statistic={r.statistic} criticalValues={r.criticalValues} />
            <div className={cn("mt-4 rounded-md border px-4 py-3 text-sm", r.decision === "reject" ? "border-primary/50 bg-primary/10" : "border-border bg-muted/60")}>
              <p className="font-bold">{r.decision === "reject" ? "Reject H₀" : "Fail to reject H₀"}</p>
              <p className="mt-1 text-muted-foreground">{conclusion(r, outcome.h1)}</p>
              <p className="mt-1 text-muted-foreground">The p-value is {formatP(r.pValue)}, which is {r.pValue < r.input.alpha ? "less than" : "not less than"} α = {r.input.alpha}, so the p-value method gives the same decision.</p>
            </div>
          </Section>

          <Section title="4. Computation summary">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Standard error" value={r.standardError.toFixed(5)} hint={`${r.kind === "z" ? "σ" : "s"} / √n`} />
              <StatCard label="Test statistic" value={r.statistic.toFixed(5)} hint="(x̄ − μ₀) / SE" />
              <StatCard label="Critical value(s)" value={r.criticalValues.map((c) => c.toFixed(5)).join(", ")} hint={TAIL_TEXT[r.input.tail]} />
              <StatCard label="Significance level" value={`α = ${r.input.alpha}`} hint={`Confidence level ${((1 - r.input.alpha) * 100).toFixed(1).replace(/\.0$/, "")}%`} />
              <StatCard label="p-value" value={formatP(r.pValue)} hint={r.pValue < r.input.alpha ? "Less than α" : "Not less than α"} />
              <StatCard label={r.kind === "t" ? "Degrees of freedom" : "Sample size"} value={String(r.kind === "t" ? r.df : r.input.sampleSize)} hint={r.kind === "t" ? "n − 1" : "n"} />
            </div>
          </Section>

          <Section title={r.kind === "z" ? "5. Standard normal (Z) table" : "5. Student t table"} subtitle={r.kind === "z" ? "Your calculated and critical Z values are highlighted." : "Your degrees of freedom and critical value are highlighted."}>
            {r.kind === "z" ? (
              <ZTable key={outcome.id} statistic={r.statistic} criticalValues={r.criticalValues} tail={r.input.tail} />
            ) : (
              <TTable key={outcome.id} df={r.df ?? 1} alpha={r.input.alpha} tail={r.input.tail} criticalValue={r.criticalValues[r.criticalValues.length - 1]} />
            )}
          </Section>
        </div>
      )}
    </div>
  );
}
