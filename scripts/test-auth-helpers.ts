import { CHECKLIST_RULES, isValidPassword, unmetRules } from "@/lib/auth/password";
import { friendlyAuthError } from "@/lib/auth/messages";

let passed = 0;
let failed = 0;
function check(name: string, ok: boolean) {
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}`);
  }
}

console.log("\nPassword rules");
check("Abcdefg1 is valid", isValidPassword("Abcdefg1"));
check("short password invalid", !isValidPassword("Ab1"));
check("7 characters invalid", !isValidPassword("Abcdef1"));
check("8 characters valid", isValidPassword("abcdefg1"));
check("no number invalid", !isValidPassword("abcdefgh"));
check("no letter invalid", !isValidPassword("12345678"));
check("empty reports 3+ unmet rules", unmetRules("").length >= 3);
check("73 ASCII characters invalid", !isValidPassword("a1" + "x".repeat(71)));
check("72 ASCII characters valid", isValidPassword("a1" + "x".repeat(70)));
check("multi-byte characters count as bytes", !isValidPassword("a1" + "é".repeat(36)));
check("checklist hides the length-cap rule", CHECKLIST_RULES.length === 3);

console.log("\nError messages");
check(
  "invalid_credentials code",
  friendlyAuthError({ code: "invalid_credentials" }) === "The email or password is incorrect.",
);
check(
  "invalid credentials text",
  friendlyAuthError({ message: "Invalid login credentials" }) === "The email or password is incorrect.",
);
check("email not confirmed", friendlyAuthError({ message: "Email not confirmed" }).includes("not confirmed"));
check("429 rate limit", friendlyAuthError({ status: 429 }).startsWith("Too many attempts"));
check(
  "email rate limit code",
  friendlyAuthError({ code: "over_email_send_rate_limit" }).startsWith("Too many attempts"),
);
check("same password", friendlyAuthError({ code: "same_password" }).includes("not used before"));
check("weak password", friendlyAuthError({ code: "weak_password" }).includes("too weak"));
check("network error", friendlyAuthError({ message: "Failed to fetch" }).includes("Cannot reach"));
check("missing env", friendlyAuthError(new Error("Supabase is not configured. Set ...")).includes("Supabase settings"));
check("unknown error is generic", friendlyAuthError({ message: "boom" }) === "Something went wrong. Please try again.");
check("null error is generic", friendlyAuthError(null) === "Something went wrong. Please try again.");
check(
  "never mentions 'already registered'",
  !friendlyAuthError({ message: "User already registered" }).toLowerCase().includes("registered"),
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
