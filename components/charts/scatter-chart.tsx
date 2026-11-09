"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DataPoint } from "@/types";

export function ScatterChartPanel({ data, trendLine }: { data: DataPoint[]; trendLine: DataPoint[] }) {
  const combined = data.map((point, index) => ({
    x: point.x,
    observed: point.y,
    predicted: trendLine[index]?.y ?? point.y,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={combined} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="observed" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
