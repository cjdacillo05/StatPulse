"use client";

import { useCallback, useEffect, useState } from "react";
import type { AnalysisRecord } from "@/types";
import { HISTORY_EVENT, clearHistory, deleteRecord, loadHistory, saveRecord } from "@/lib/storage";

export function useHistory() {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    setRecords(loadHistory());
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(HISTORY_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(HISTORY_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return {
    records,
    loaded,
    save: (record: AnalysisRecord) => saveRecord(record),
    remove: (id: string) => deleteRecord(id),
    clear: () => clearHistory(),
  };
}
