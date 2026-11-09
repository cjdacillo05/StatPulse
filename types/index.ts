export interface DataPoint {
  x: number;
  y: number;
}

export type CorrelationDirection = "positive" | "negative" | "none";

export type CorrelationStrength =
  | "very weak"
  | "weak"
  | "moderate"
  | "strong"
  | "very strong"
  | null;

export interface CorrelationResult {
  r: number | null;
  rSquared?: number | null;
  direction: CorrelationDirection | null;
  strength: CorrelationStrength;
  interpretation: string;
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  equation: string;
  rSquared: number | null;
  predicted: DataPoint[];
  residuals: number[];
  sse: number;
  ssr: number;
  sst: number;
  standardError: number | null;
  correlation: CorrelationResult;
  n: number;
}

export type TailType = "left" | "right" | "two";

export interface ZTestInput {
  sampleMean: number;
  populationMean: number;
  populationStdDev: number;
  sampleSize: number;
  alpha: number;
  tail: TailType;
}

export interface ZTestResult {
  input: ZTestInput;
  zStatistic: number;
  standardError: number;
  criticalValues: number[];
  pValue: number;
  decision: "reject" | "fail_to_reject";
  rejectByCriticalValue: boolean;
  rejectByPValue: boolean;
}

export interface HypothesisTestResult {
  statistic: number;
  pValue: number;
  alpha: number;
  rejectNull: boolean;
  conclusion: string;
}

export interface AnalysisHistoryItem {
  id: string;
  type: "correlation" | "regression" | "hypothesis";
  label: string;
  summary: string;
  createdAt: string;
}

export interface RegressionRecord {
  id: string;
  type: "regression";
  createdAt: string;
  title: string;
  xLabel?: string;
  yLabel?: string;
  points: DataPoint[];
  result: RegressionResult;
}

export interface HypothesisRecord {
  id: string;
  createdAt: string;
  title: string;
  type: "hypothesis";
  h0?: string;
  h1?: string;
  result: ZTestResult;
}

export type AnalysisRecord = RegressionRecord | HypothesisRecord;
