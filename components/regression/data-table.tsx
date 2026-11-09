"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RowErrors, RowInput } from "@/lib/validation";

interface DataTableProps {
  rows: RowInput[];
  errors: Record<string, RowErrors>;
  xLabel: string;
  yLabel: string;
  onChange: (id: string, field: "x" | "y", value: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  onPaste: (startIndex: number, text: string) => void;
}

export function DataTable({
  rows,
  errors,
  xLabel,
  yLabel,
  onChange,
  onRemove,
  onAdd,
  onPaste,
}: DataTableProps) {
  return (
    <div className="space-y-3">
      <div className="max-h-96 overflow-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted text-left">
            <tr>
              <th className="w-12 px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">{xLabel || "X"} (independent)</th>
              <th className="px-3 py-2 font-medium">{yLabel || "Y"} (dependent)</th>
              <th className="w-14 px-3 py-2">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const err = errors[row.id];
              return (
                <tr key={row.id} className="border-t border-border align-top">
                  <td className="px-3 py-2 text-muted-foreground">{index + 1}</td>
                  <td className="px-3 py-2">
                    <Input
                      id={`x-${row.id}`}
                      inputMode="decimal"
                      aria-label={`${xLabel || "X"} value, row ${index + 1}`}
                      value={row.x}
                      invalid={!!err?.x}
                      placeholder="e.g. 12.5"
                      onChange={(e) => onChange(row.id, "x", e.target.value)}
                      onPaste={(e) => {
                        const text = e.clipboardData.getData("text").trim();
                        if (/[\s,;]/.test(text)) {
                          e.preventDefault();
                          onPaste(index, text);
                        }
                      }}
                    />
                    {err?.x && <p className="mt-1 text-xs text-danger">{err.x}</p>}
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      id={`y-${row.id}`}
                      inputMode="decimal"
                      aria-label={`${yLabel || "Y"} value, row ${index + 1}`}
                      value={row.y}
                      invalid={!!err?.y}
                      placeholder="e.g. 80"
                      onChange={(e) => onChange(row.id, "y", e.target.value)}
                    />
                    {err?.y && <p className="mt-1 text-xs text-danger">{err.y}</p>}
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={`Remove row ${index + 1}`}
                      onClick={() => onRemove(row.id)}
                      disabled={rows.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Button variant="outline" onClick={onAdd}>
        <Plus className="h-4 w-4" /> Add row
      </Button>
    </div>
  );
}
