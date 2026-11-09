import type { AnalysisRecord } from "@/types";

const KEY = "advstat:history:v1";
const MAX_RECORDS = 200;

export const HISTORY_EVENT = "advstat-history-change";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isRecord(value: unknown): value is AnalysisRecord {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.createdAt === "string" &&
    typeof v.title === "string" &&
    (v.type === "regression" || v.type === "hypothesis") &&
    typeof v.result === "object" &&
    v.result !== null
  );
}

export function loadHistory(): AnalysisRecord[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecord);
  } catch {
    return [];
  }
}

function persist(records: AnalysisRecord[]): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(records));
    window.dispatchEvent(new Event(HISTORY_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function saveRecord(record: AnalysisRecord): boolean {
  const next = [record, ...loadHistory()].slice(0, MAX_RECORDS);
  return persist(next);
}

export function deleteRecord(id: string): boolean {
  return persist(loadHistory().filter((r) => r.id !== id));
}

export function clearHistory(): boolean {
  return persist([]);
}

export const readHistory = loadHistory;
export function saveHistory(items: AnalysisRecord[]) {
  return persist(items.slice(0, MAX_RECORDS));
}
export function appendHistory(item: AnalysisRecord) {
  return saveRecord(item);
}
