import type { SupabaseClient } from "@supabase/supabase-js";

export type ActivityEvent = "login" | "logout";

/* If your login_activity table uses different names, change them here. */
const TABLE = "login_activity";
const USER_COLUMN = "user_id";
const EVENT_COLUMN = "event";

/**
 * Records a login or logout. Best-effort: it never throws and never blocks
 * the user, so a problem here cannot stop someone from signing in.
 * Works with the browser client and the server client.
 */
export async function recordActivity(
  supabase: SupabaseClient,
  userId: string,
  event: ActivityEvent,
): Promise<void> {
  try {
    const { error } = await supabase.from(TABLE).insert({ [USER_COLUMN]: userId, [EVENT_COLUMN]: event });
    if (error && process.env.NODE_ENV !== "production") {
      console.warn("[StatPulse] Could not record login activity:", error.message);
    }
  } catch {
    // Ignore: activity logging is optional.
  }
}
