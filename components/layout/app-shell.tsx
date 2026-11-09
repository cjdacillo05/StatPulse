import type { ReactNode } from "react";

import { getCurrentUser } from "@/lib/auth/current-user";
import { UserProvider } from "@/components/layout/user-provider";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export async function AppShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <UserProvider user={user}>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </UserProvider>
  );
}
