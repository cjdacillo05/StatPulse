"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAndRedirect } from "@/lib/auth/sign-out";
import { useUser } from "@/components/layout/user-provider";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function AccountMenu() {
  const user = useUser();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90"
      >
        Log in
      </Link>
    );
  }

  async function onLogout() {
    setLoggingOut(true);
    await signOutAndRedirect();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md border border-border bg-card py-1 pl-1 pr-2 text-sm hover:bg-accent"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {initials(user.fullName)}
        </span>
        <span className="hidden max-w-[10rem] truncate font-semibold text-foreground sm:block">
          {user.fullName}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-border bg-card p-2 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-bold text-card-foreground">{user.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            {user.role === "admin" && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                <ShieldCheck className="h-3 w-3" aria-hidden /> Administrator
              </span>
            )}
          </div>
          <div className="my-1 border-t border-border" />
          {user.role === "admin" && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden /> Admin dashboard
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-accent disabled:opacity-60"
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <LogOut className="h-4 w-4" aria-hidden />
            )}
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
