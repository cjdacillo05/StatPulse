import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/env";
import { decideAccess } from "@/lib/supabase/route-rules";

/**
 * Runs on every page request:
 *  1. refreshes the Supabase session cookie when it is close to expiring,
 *  2. sends signed-out visitors to /login (remembering where they wanted to go),
 *  3. sends signed-in users away from /login and /signup.
 *
 * It uses auth.getUser(), which asks Supabase to verify the session. It does
 * NOT use getSession(), because cookies can be forged and getSession() does
 * not verify them.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  // Without Supabase variables there is nothing to check, so the statistics
  // pages keep working (useful before auth is set up on Vercel).
  if (!isSupabaseConfigured()) return NextResponse.next({ request });

  let env: { url: string; key: string };
  try {
    env = getSupabaseEnv();
  } catch (error) {
    console.error("[StatPulse middleware]", error);
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        // Update the request first so server components see the fresh session,
        // then write the same cookies onto the response for the browser.
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
        );
      },
    },
  });

  let signedIn = false;
  try {
    const { data } = await supabase.auth.getUser();
    signedIn = Boolean(data.user);
  } catch {
    // Supabase unreachable: treat the visitor as signed out.
    signedIn = false;
  }

  const { pathname, search } = request.nextUrl;
  const decision = decideAccess(pathname, signedIn);

  if (decision === "allow") return response;

  const url = request.nextUrl.clone();
  url.search = "";

  if (decision === "redirect-to-dashboard") {
    url.pathname = "/dashboard";
  } else {
    url.pathname = "/login";
    // Remember the page they wanted so login can send them back to it.
    if (pathname !== "/") url.searchParams.set("next", pathname + search);
  }

  const redirect = NextResponse.redirect(url);
  // Keep any refreshed session cookies on the redirect response.
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
