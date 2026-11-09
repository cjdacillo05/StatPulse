/**
 * Which pages need a signed-in user. Pure TypeScript (no Next.js, no Supabase)
 * so it can be tested on its own and reused by the login page.
 */

/** Pages anyone can open, signed in or not. */
export const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth", // email confirmation callback: /auth/callback
  "/api/supabase-status", // connection check (removed or protected in the final cleanup part)
];

/** Pages only for visitors who are NOT signed in; signed-in users are sent to the dashboard. */
export const GUEST_ONLY_PATHS = ["/login", "/signup", "/forgot-password"];

export type AccessDecision = "allow" | "redirect-to-login" | "redirect-to-dashboard";

/** True when pathname is `base` itself or something under it ("/auth" matches "/auth/callback", not "/authors"). */
export function matchesPath(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(base + "/");
}

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => matchesPath(pathname, p));
}

export function decideAccess(pathname: string, signedIn: boolean): AccessDecision {
  if (GUEST_ONLY_PATHS.some((p) => matchesPath(pathname, p))) {
    return signedIn ? "redirect-to-dashboard" : "allow";
  }
  if (isPublicPath(pathname)) return "allow";
  return signedIn ? "allow" : "redirect-to-login";
}

/**
 * Validates the ?next= value used after login. Only same-site paths are
 * accepted, which prevents an "open redirect" to another website.
 */
export function safeNextPath(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback; // must be a path, not a full URL
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback; // protocol-relative URL
  if (/[\u0000-\u001f]/.test(raw)) return fallback; // control characters
  if (GUEST_ONLY_PATHS.some((p) => matchesPath(raw.split(/[?#]/)[0], p))) return fallback;
  return raw;
}
