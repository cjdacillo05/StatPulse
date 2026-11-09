export class StatisticsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StatisticsError";
  }
}

export function safeDivide(numerator: number, denominator: number): number {
  if (Math.abs(denominator) < 1e-12) {
    return Number.NaN;
  }

  return numerator / denominator;
}

export function mean(values: number[]): number {
  if (values.length === 0) {
    return Number.NaN;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function variance(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }

  const avg = mean(values);
  return values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (values.length - 1);
}

export function standardDeviation(values: number[]): number {
  return Math.sqrt(variance(values));
}

export const stdDev = standardDeviation;
export const sampleStdDev = standardDeviation;
