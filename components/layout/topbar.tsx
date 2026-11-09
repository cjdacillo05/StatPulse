"use client";

import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card/60 px-6 py-4 backdrop-blur-sm">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Analysis workspace</p>
      </div>
      <ThemeToggle />
    </header>
  );
}
