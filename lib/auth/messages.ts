/**
 * Turns Supabase / network errors into messages a person can act on.
 * Never reveals whether an email address has an account.
 */

export interface AuthErrorLike {
  message?: string;
  code?: string;
  status?: number;
}

export function friendlyAuthError(error: AuthErrorLike | null | undefined): string {
  const code = error?.code ?? "";
  const msg = (error?.message ?? "").toLowerCase();

  if (msg.includes("supabase is not configured") || msg.includes("must start with https")) {
    return "Accounts are not set up yet: the Supabase settings are missing or wrong. Check the environment variables.";
  }
  if (code === "invalid_credentials" || msg.includes("invalid login credentials")) {
    return "The email or password is incorrect.";
  }
  if (code === "email_not_confirmed" || msg.includes("email not confirmed")) {
    return "Your email is not confirmed yet. Open the confirmation email we sent you, then log in.";
  }
  if (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    error?.status === 429 ||
    msg.includes("rate limit") ||
    msg.includes("too many requests")
  ) {
    return "Too many attempts. Wait a few minutes and try again.";
  }
  if (code === "same_password" || msg.includes("different from the old password")) {
    return "Choose a password you have not used before.";
  }
  if (code === "weak_password" || msg.includes("password should")) {
    return "That password is too weak. Use at least 8 characters with a letter and a number.";
  }
  if (code === "signup_disabled" || msg.includes("signups not allowed")) {
    return "Sign-ups are turned off for this site right now.";
  }
  if (code === "otp_expired" || msg.includes("expired")) {
    return "That link has expired. Request a new one.";
  }
  if (msg.includes("failed to fetch") || msg.includes("network") || msg.includes("fetch failed")) {
    return "Cannot reach the server. Check your internet connection and try again.";
  }
  return "Something went wrong. Please try again.";
}
