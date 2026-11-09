import { z } from "zod";
import type { DataPoint, TailType } from "@/types";
import { MAX_ALPHA, MIN_ALPHA } from "@/lib/statistics/hypothesis";

export interface RowInput {
  id: string;
  x: string;
  y: string;
}

export interface RowErrors {
  x?: string;
  y?: string;
}

export interface ParsedTable {
  points: DataPoint[];
  errors: Record<string, RowErrors>;
  message?: string;
}

function parseNumber(raw: string): number | null | "invalid" {
  const s = raw.trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : "invalid";
}

export function parseRegressionRows(rows: RowInput[]): ParsedTable {
  const points: DataPoint[] = [];
  const errors: Record<string, RowErrors> = {};

  for (const row of rows) {
    const x = parseNumber(row.x);
    const y = parseNumber(row.y);

    if (x === null && y === null) continue;

    const rowErrors: RowErrors = {};
    if (x === "invalid") rowErrors.x = "Enter a valid number.";
    else if (x === null) rowErrors.x = "X is required.";
    if (y === "invalid") rowErrors.y = "Enter a valid number.";
    else if (y === null) rowErrors.y = "Y is required.";

    if (rowErrors.x || rowErrors.y) {
      errors[row.id] = rowErrors;
    } else {
      points.push({ x: x as number, y: y as number });
    }
  }

  if (Object.keys(errors).length > 0) {
    return { points, errors, message: "Fix the highlighted cells before analysing." };
  }
  if (points.length < 2) {
    return { points, errors, message: "Enter at least 2 complete (X, Y) rows." };
  }
  return { points, errors };
}

const numberField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .transform((v) => Number(v))
    .refine((v) => Number.isFinite(v), `${label} must be a valid number.`);

export const zTestFormSchema = z.object({
  sampleMean: numberField("Sample mean"),
  populationMean: numberField("Population mean"),
  populationStdDev: numberField("Population standard deviation").refine((v) => v > 0, "Population standard deviation must be greater than 0."),
  sampleSize: numberField("Sample size").refine((v) => Number.isInteger(v) && v >= 1, "Sample size must be a whole number of at least 1."),
  alpha: numberField("Significance level").refine((v) => v >= MIN_ALPHA && v <= MAX_ALPHA, `Significance level must be between ${MIN_ALPHA} and ${MAX_ALPHA}.`),
  tail: z.enum(["left", "right", "two"]),
  h0: z.string().trim().max(300, "H0 must be at most 300 characters."),
  h1: z.string().trim().max(300, "H1 must be at most 300 characters."),
});

export interface ZTestFormRaw {
  sampleMean: string;
  populationMean: string;
  populationStdDev: string;
  sampleSize: string;
  alpha: string;
  tail: TailType;
  h0: string;
  h1: string;
}

export interface ZTestFormData {
  sampleMean: number;
  populationMean: number;
  populationStdDev: number;
  sampleSize: number;
  alpha: number;
  tail: TailType;
  h0: string;
  h1: string;
}

export type ZTestFormParse =
  | { ok: true; data: ZTestFormData }
  | { ok: false; errors: Record<string, string> };

export function parseZTestForm(raw: ZTestFormRaw): ZTestFormParse {
  const result = zTestFormSchema.safeParse(raw);
  if (result.success) return { ok: true, data: result.data };

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}

export const dataPointSchema = z.object({
  x: z.coerce.number(),
  y: z.coerce.number(),
});

export const dataSetSchema = z.array(dataPointSchema).min(2).max(1000);

export function parseDataSet(input: unknown) {
  return dataSetSchema.parse(input);
}

export const parseDataTable = parseDataSet;
