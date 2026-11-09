import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const SECTIONS = [
  { id: "introduction", title: "Introduction" },
  { id: "overview", title: "System Overview" },
  { id: "requirements", title: "System Requirements" },
  { id: "technologies", title: "Technologies Used" },
  { id: "dashboard", title: "How to Use the Dashboard" },
  { id: "how-regression", title: "How to Perform Simple Linear Regression" },
  { id: "regression-formulas", title: "Explanation of Regression Formulas" },
  { id: "how-hypothesis", title: "How to Perform Hypothesis Testing" },
  { id: "z-formulas", title: "Explanation of Z-test Formulas" },
  { id: "graphs", title: "Understanding the Statistical Graphs" },
  { id: "interpretation", title: "Interpretation of Results" },
  { id: "limitations", title: "Limitations of the System" },
  { id: "future", title: "Future Improvements" },
];

function Section({ id, index, title, children }: { id: string; index: number; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <Card className="space-y-3 p-5 sm:p-6">
        <h2 className="text-xl font-semibold">{index}. {title}</h2>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground [&_strong]:text-foreground">{children}</div>
      </Card>
    </section>
  );
}

function Formula({ children }: { children: ReactNode }) {
  return <pre className="overflow-x-auto whitespace-pre rounded-md bg-muted px-4 py-3 font-mono text-sm text-foreground">{children}</pre>;
}

function Steps({ items }: { items: ReactNode[] }) {
  return <ol className="list-decimal space-y-1.5 pl-5">{items.map((item, i) => <li key={i}>{item}</li>)}</ol>;
}

function Bullets({ items }: { items: ReactNode[] }) {
  return <ul className="list-disc space-y-1.5 pl-5">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
}

export function DocumentationView() {
  return (
    <div className="space-y-6">
      <PageHeader title="Documentation" description="How the system works, the formulas behind it, and how to read the results." />

      <Card className="p-5">
        <h2 className="mb-2 text-sm font-semibold">Contents</h2>
        <ol className="grid gap-1 text-sm sm:grid-cols-2">
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-primary hover:underline">{i + 1}. {s.title}</a>
            </li>
          ))}
        </ol>
      </Card>

      <Section id="introduction" index={1} title="Introduction">
        <p>ADVSTAT is a web-based tool for two core statistical procedures: <strong>Simple Linear Regression</strong> and <strong>one-sample Z-test hypothesis testing</strong>. It calculates results, draws graphs, and explains findings in plain language.</p>
      </Section>

      <Section id="overview" index={2} title="System Overview">
        <Bullets items={[
          <><strong>Dashboard:</strong> summary cards and shortcuts.</>,
          <><strong>Simple Linear Regression:</strong> editable data table, equation, Pearson&apos;s r, scatter diagram, interpretation, CSV export.</>,
          <><strong>Hypothesis Testing:</strong> one-sample Z-test with critical values, p-value, decision, and a shaded normal curve.</>,
          <><strong>Analysis History:</strong> saved analyses that can be reviewed or deleted.</>,
          <><strong>Documentation</strong> and <strong>About the System</strong>: guides and project notes.</>,
        ]} />
        <p>All calculations run in the browser using TypeScript functions written for the project. No data is sent to a server.</p>
      </Section>

      <Section id="requirements" index={3} title="System Requirements">
        <Bullets items={[
          "Modern web browser with JavaScript enabled.",
          "Node.js 18.17 or later with npm to run the project locally.",
          "Visual Studio Code is recommended but not required.",
        ]} />
      </Section>

      <Section id="technologies" index={4} title="Technologies Used">
        <Bullets items={[
          "Next.js 14 and React 18",
          "TypeScript",
          "Tailwind CSS",
          "Recharts",
          "Lucide React",
          "Zod",
          "Browser localStorage",
        ]} />
      </Section>

      <Section id="dashboard" index={5} title="How to Use the Dashboard">
        <Steps items={[
          "Use the sidebar navigation to move between pages.",
          "The summary cards show saved-analysis counts and shortcuts.",
          "Use the regression or Z-test shortcut cards to start a new analysis.",
          "Use the sun/moon toggle to switch themes.",
        ]} />
      </Section>

      <Section id="how-regression" index={6} title="How to Perform Simple Linear Regression">
        <Steps items={[
          "Open Simple Linear Regression from the sidebar.",
          "Rename the X and Y variables if needed.",
          "Enter your paired values or choose a sample dataset.",
          "Click Analyse data to compute the fitted line, Pearson&apos;s r, and interpretation.",
          "Use Save to history, Print, or Download CSV as needed.",
        ]} />
      </Section>

      <Section id="regression-formulas" index={7} title="Explanation of Regression Formulas">
        <p>The line is estimated by least squares using:</p>
        <Formula>{`b = Sxy / Sxx\n a = ȳ - b·x̄\n Equation: ŷ = a + bX`}</Formula>
        <p>Where <strong>b</strong> is the slope and <strong>a</strong> is the intercept. The coefficient of determination <strong>r²</strong> shows the fraction of variability explained by the model.</p>
      </Section>

      <Section id="how-hypothesis" index={8} title="How to Perform Hypothesis Testing">
        <Steps items={[
          "Open Hypothesis Testing from the sidebar.",
          "Choose the test direction and significance level.",
          "Enter the sample mean, null mean, sigma, and sample size.",
          "Run the test to view the Z statistic, p-value, and decision.",
        ]} />
      </Section>

      <Section id="z-formulas" index={9} title="Explanation of Z-test Formulas">
        <Formula>{`Z = (x̄ − μ0) / (σ / √n)\nSE = σ / √n\np-value = P(|Z| ≥ z_obs) for two-tailed tests`}</Formula>
        <p>When the p-value is below the significance level, the evidence suggests rejecting the null hypothesis.</p>
      </Section>

      <Section id="graphs" index={10} title="Understanding the Statistical Graphs">
        <p>The regression chart plots each pair of values and overlays the fitted line. The normal curve chart shades the rejection region and highlights critical values and the observed Z statistic.</p>
      </Section>

      <Section id="interpretation" index={11} title="Interpretation of Results">
        <p>In regression, a strong positive/negative Pearson correlation suggests a meaningful directional relationship. In hypothesis testing, a small p-value and a statistically significant result support rejecting H0.</p>
      </Section>

      <Section id="limitations" index={12} title="Limitations of the System">
        <Bullets items={[
          "This tool is designed for teaching and exploration, not formal published analysis.",
          "Regression and Z-tests require valid assumptions, such as a reasonably linear relationship or known population standard deviation.",
          "Outliers and small sample sizes can materially affect results.",
        ]} />
      </Section>

      <Section id="future" index={13} title="Future Improvements">
        <Bullets items={[
          "Add more hypothesis tests and confidence intervals.",
          "Support CSV import/export for larger datasets.",
          "Add richer reporting, annotations, and printable reports.",
        ]} />
      </Section>
    </div>
  );
}
