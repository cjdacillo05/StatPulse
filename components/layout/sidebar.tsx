"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, X } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { useUser } from "@/components/layout/user-provider";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const user = useUser();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-border bg-card lg:block">
      <div className="flex h-full flex-col p-4">
        <div className="mb-6 px-2 py-2">
          <Brand />
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            );
          })}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/admin" || pathname.startsWith("/admin/")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        <div className="mt-auto rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium text-foreground">Workspace</span>
            <X className="h-4 w-4" />
          </div>
          <p>Ready for regression, hypothesis, and interpretation tasks.</p>
        </div>
      </div>
    </aside>
  );
}
