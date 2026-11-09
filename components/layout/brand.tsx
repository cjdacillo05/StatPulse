import { Activity } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="sp-gradient flex h-9 w-9 items-center justify-center rounded-lg shadow-sm">
        <Activity className="h-5 w-5" aria-hidden />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-base font-extrabold tracking-tight text-foreground">StatPulse</span>
          <span className="block text-[11px] text-muted-foreground">Statistics, explained clearly</span>
        </span>
      )}
    </div>
  );
}
