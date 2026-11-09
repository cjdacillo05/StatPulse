import type { DataPoint } from "@/types";

export interface SampleDataset {
  id: string;
  name: string;
  description: string;
  xLabel: string;
  yLabel: string;
  points: DataPoint[];
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: "study",
    name: "Study hours vs exam score (illustrative)",
    description: "A strong positive relationship.",
    xLabel: "Study hours",
    yLabel: "Exam score",
    points: [
      { x: 1, y: 52 }, { x: 2, y: 55 }, { x: 3, y: 61 }, { x: 4, y: 64 },
      { x: 5, y: 70 }, { x: 6, y: 74 }, { x: 7, y: 79 }, { x: 8, y: 85 },
    ],
  },
  {
    id: "ads",
    name: "Advertising spend vs sales (illustrative)",
    description: "A strong positive relationship, units in thousands.",
    xLabel: "Ad spend (thousands)",
    yLabel: "Sales (thousands)",
    points: [
      { x: 5, y: 40 }, { x: 8, y: 52 }, { x: 10, y: 55 }, { x: 12, y: 63 },
      { x: 15, y: 70 }, { x: 18, y: 81 }, { x: 20, y: 84 }, { x: 25, y: 98 },
    ],
  },
  {
    id: "temperature",
    name: "Temperature vs hot drinks sold (illustrative)",
    description: "A strong negative relationship.",
    xLabel: "Temperature (°C)",
    yLabel: "Hot drinks sold",
    points: [
      { x: 10, y: 92 }, { x: 12, y: 85 }, { x: 15, y: 78 }, { x: 18, y: 66 },
      { x: 20, y: 58 }, { x: 24, y: 45 }, { x: 27, y: 36 }, { x: 30, y: 28 },
    ],
  },
  {
    id: "textbook",
    name: "Hand-check dataset (b = 0.6, a = 2.2)",
    description: "Small dataset whose answers are easy to verify by hand.",
    xLabel: "X",
    yLabel: "Y",
    points: [
      { x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 5 }, { x: 4, y: 4 }, { x: 5, y: 5 },
    ],
  },
  {
    id: "perfect",
    name: "Perfect line (Y = 2X + 1)",
    description: "Should give r = 1 exactly.",
    xLabel: "X",
    yLabel: "Y",
    points: [
      { x: 1, y: 3 }, { x: 2, y: 5 }, { x: 3, y: 7 }, { x: 4, y: 9 },
    ],
  },
];
