import { createClient } from "@/lib/supabase/server";

export type Role = "user" | "admin";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

/** Returns the signed-in user, or null (also null when Supabase is not configured). */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();

    const meta = (user.user_metadata ?? {}) as { full_name?: string };
    const email = user.email ?? "";
    return {
      id: user.id,
      email,
      fullName: profile?.full_name || meta.full_name || email.split("@")[0] || "User",
      role: profile?.role === "admin" ? "admin" : "user",
    };
  } catch {
    return null;
  }
}
