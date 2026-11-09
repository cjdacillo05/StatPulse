"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RoleButton({
  userId,
  role,
  isSelf,
}: {
  userId: string;
  role: "user" | "admin";
  isSelf: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isSelf) return <span className="text-xs text-muted-foreground">You</span>;

  const next = role === "admin" ? "user" : "admin";

  async function onClick() {
    const ok = window.confirm(
      next === "admin" ? "Make this person an administrator?" : "Remove administrator access?",
    );
    if (!ok) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await createClient().rpc("set_user_role", { target: userId, new_role: next });
      if (error) {
        setError("Could not change the role.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Could not change the role.");
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent disabled:opacity-60"
      >
        {loading ? "Saving…" : next === "admin" ? "Make admin" : "Remove admin"}
      </button>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
