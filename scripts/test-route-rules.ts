import { decideAccess, safeNextPath, matchesPath } from "@/lib/supabase/route-rules";

let passed = 0;
let failed = 0;
function check(name: string, ok: boolean) {
  if (ok) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.error(`  ✗ ${name}`); }
}

console.log("\nSigned-out visitors");
check("/dashboard → login", decideAccess("/dashboard", false) === "redirect-to-login");
check("/regression → login", decideAccess("/regression", false) === "redirect-to-login");
check("/admin → login", decideAccess("/admin", false) === "redirect-to-login");
check("/admin/users → login", decideAccess("/admin/users", false) === "redirect-to-login");
check("/ → login", decideAccess("/", false) === "redirect-to-login");
check("/login allowed", decideAccess("/login", false) === "allow");
check("/signup allowed", decideAccess("/signup", false) === "allow");
check("/forgot-password allowed", decideAccess("/forgot-password", false) === "allow");
check("/reset-password allowed", decideAccess("/reset-password", false) === "allow");
check("/auth/callback allowed", decideAccess("/auth/callback", false) === "allow");
check("/api/supabase-status allowed", decideAccess("/api/supabase-status", false) === "allow");

console.log("\nLook-alike paths are not treated as public");
check("/authors → login", decideAccess("/authors", false) === "redirect-to-login");
check("/login-help → login", decideAccess("/login-help", false) === "redirect-to-login");
check("/signup2 → login", decideAccess("/signup2", false) === "redirect-to-login");
check("matchesPath exact", matchesPath("/auth", "/auth"));
check("matchesPath child", matchesPath("/auth/callback", "/auth"));
check("matchesPath sibling rejected", !matchesPath("/authors", "/auth"));

console.log("\nSigned-in users");
check("/dashboard allowed", decideAccess("/dashboard", true) === "allow");
check("/admin allowed here (admin check happens in the page)", decideAccess("/admin", true) === "allow");
check("/login → dashboard", decideAccess("/login", true) === "redirect-to-dashboard");
check("/signup → dashboard", decideAccess("/signup", true) === "redirect-to-dashboard");
check("/forgot-password → dashboard", decideAccess("/forgot-password", true) === "redirect-to-dashboard");
check("/reset-password stays open (recovery session)", decideAccess("/reset-password", true) === "allow");
check("/auth/callback stays open", decideAccess("/auth/callback", true) === "allow");

console.log("\nsafeNextPath");
check("null → dashboard", safeNextPath(null) === "/dashboard");
check("normal path kept", safeNextPath("/regression") === "/regression");
check("path with query kept", safeNextPath("/history?type=regression") === "/history?type=regression");
check("full URL rejected", safeNextPath("https://evil.example") === "/dashboard");
check("protocol-relative rejected", safeNextPath("//evil.example") === "/dashboard");
check("backslash trick rejected", safeNextPath("/\\evil.example") === "/dashboard");
check("javascript: rejected", safeNextPath("javascript:alert(1)") === "/dashboard");
check("/login rejected (no loop)", safeNextPath("/login") === "/dashboard");
check("/signup?x=1 rejected", safeNextPath("/signup?x=1") === "/dashboard");
check("control char rejected", safeNextPath("/a\nb") === "/dashboard");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
