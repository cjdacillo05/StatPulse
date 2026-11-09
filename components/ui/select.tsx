import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
