import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordActivity } from "@/lib/auth/activity";
import { safeNextPath } from "@/lib/supabase/route-rules";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        // A confirmed sign-up counts as a login; a password reset does not.
        if (next !== "/reset-password") {
          const { data } = await supabase.auth.getUser();
          if (data.user) await recordActivity(supabase, data.user.id, "login");
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // fall through to the error redirect
    }
  }

  // Missing code, expired link, or opened in a different browser than the one used to sign up.
  return NextResponse.redirect(`${origin}/login?error=link`);
}
