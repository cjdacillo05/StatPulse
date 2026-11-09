import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { RoleButton } from "@/components/admin/role-button";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin",
};

export const dynamic = "force-dynamic";

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "user" | "admin";
  created_at: string;
}

interface ActivityRow {
  id: number;
  user_id: string;
  event: "login" | "logout";
  created_at: string;
}

const dateFmt = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Manila",
});

const formatDate = (iso: string | null | undefined) => (iso ? dateFmt.format(new Date(iso)) : "Never");

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-card-foreground">{value}</p>
    </div>
  );
}

export default async function AdminPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/admin");
  if (me.role !== "admin") redirect("/dashboard");

  const supabase = createClient();
  const now = Date.now();
  const since24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [profilesRes, activityRes, dayRes, weekRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("login_activity")
      .select("id, user_id, event, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("login_activity")
      .select("id", { count: "exact", head: true })
      .eq("event", "login")
      .gte("created_at", since24h),
    supabase
      .from("login_activity")
      .select("id", { count: "exact", head: true })
      .eq("event", "login")
      .gte("created_at", since7d),
  ]);

  const profiles = (profilesRes.data ?? []) as ProfileRow[];
  const activity = (activityRes.data ?? []) as ActivityRow[];
  const hasError = Boolean(profilesRes.error || activityRes.error || dayRes.error || weekRes.error);

  const byId = new Map(profiles.map((person) => [person.id, person]));
  const lastLogin = new Map<string, string>();
  for (const event of activity) {
    if (event.event === "login" && !lastLogin.has(event.user_id)) {
      lastLogin.set(event.user_id, event.created_at);
    }
  }

  const totalUsers = profilesRes.count ?? profiles.length;
  const admins = profiles.filter((person) => person.role === "admin").length;

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Administration</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Admin dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">Accounts and sign-in activity for the StatPulse workspace.</p>
        </div>

        {hasError && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            Could not load some admin data. Check that the Supabase schema and role RPC are applied.
          </div>
        )}

        <section aria-label="Summary" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total users" value={totalUsers} />
          <StatCard label="Administrators" value={admins} />
          <StatCard label="Logins (24h)" value={dayRes.count ?? 0} />
          <StatCard label="Logins (7d)" value={weekRes.count ?? 0} />
        </section>

        <section aria-label="Users" className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">Users</h2>
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead className="bg-accent text-accent-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold">Last login</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {profiles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                )}
                {profiles.map((person) => (
                  <tr key={person.id} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold text-foreground">{person.full_name || "(no name)"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{person.email || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          person.role === "admin"
                            ? "rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground"
                            : "rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground"
                        }
                      >
                        {person.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(person.created_at)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(lastLogin.get(person.id))}</td>
                    <td className="px-4 py-3">
                      <RoleButton userId={person.id} role={person.role} isSelf={person.id === me.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-label="Recent activity" className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">Recent activity</h2>
          <ul className="overflow-hidden rounded-lg border border-border bg-card">
            {activity.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">No activity yet.</li>
            )}
            {activity.slice(0, 20).map((event) => {
              const person = byId.get(event.user_id);
              return (
                <li key={event.id} className="flex items-center justify-between gap-2 border-t border-border px-4 py-3 text-sm first:border-t-0">
                  <span className="text-foreground">
                    <span className="font-semibold">{person?.full_name || person?.email || "Unknown user"}</span>{" "}
                    {event.event === "login" ? "logged in" : "logged out"}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(event.created_at)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
