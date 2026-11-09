import { createClient } from "@/lib/supabase/client";
import { recordActivity } from "@/lib/auth/activity";

/** Records the logout (while the session still exists), signs out, and goes to the login page. */
export async function signOutAndRedirect(): Promise<void> {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) await recordActivity(supabase, data.user.id, "logout");
    await supabase.auth.signOut();
  } finally {
    window.location.assign("/login");
  }
}
