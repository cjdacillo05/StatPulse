import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "info" | "success" | "error" | "warning";

const styles: Record<Variant, { box: string; icon: ReactNode }> = {
  info: { box: "border-primary/30 bg-accent text-accent-foreground", icon: <Info className="h-4 w-4" /> },
  success: { box: "border-success/30 bg-success/10 text-success", icon: <CheckCircle2 className="h-4 w-4" /> },
  error: { box: "border-danger/30 bg-danger/10 text-danger", icon: <AlertCircle className="h-4 w-4" /> },
  warning: { box: "border-warning/30 bg-warning/10 text-warning", icon: <TriangleAlert className="h-4 w-4" /> },
};

export function Alert({
  variant = "info",
  className,
  children,
}: {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  const s = styles[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2 rounded-md border px-3 py-2.5 text-sm", s.box, className)}
    >
      <span className="mt-0.5 shrink-0">{s.icon}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
