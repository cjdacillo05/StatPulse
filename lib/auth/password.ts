/**
 * Password rules shared by the sign-up and reset forms. Pure TypeScript.
 * Supabase accepts passwords up to 72 bytes, so that is the upper limit.
 */

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX_BYTES = 72;

export interface PasswordRule {
  id: "length" | "letter" | "number" | "max";
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", label: `At least ${PASSWORD_MIN} characters`, test: (p) => p.length >= PASSWORD_MIN },
  { id: "letter", label: "At least one letter", test: (p) => /[A-Za-z]/.test(p) },
  { id: "number", label: "At least one number", test: (p) => /\d/.test(p) },
  {
    id: "max",
    label: "72 characters or fewer",
    test: (p) => new TextEncoder().encode(p).length <= PASSWORD_MAX_BYTES,
  },
];

/** Rules shown in the live checklist (the length cap only matters as an error). */
export const CHECKLIST_RULES = PASSWORD_RULES.filter((r) => r.id !== "max");

export function unmetRules(password: string): PasswordRule[] {
  return PASSWORD_RULES.filter((r) => !r.test(password));
}

export function isValidPassword(password: string): boolean {
  return unmetRules(password).length === 0;
}
