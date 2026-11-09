import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Safe diagnostics: never returns the key itself. */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  const result = {
    configured: Boolean(url && key),
    urlLooksValid: /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url),
    keyAccepted: false,
    schema: "unknown" as "installed" | "missing" | "unknown",
    detail: "",
  };

  if (!result.configured) {
    result.detail = "NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.";
    return NextResponse.json(result);
  }

  const base = url.replace(/\/$/, "");
  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  try {
    const auth = await fetch(`${base}/auth/v1/settings`, { headers, cache: "no-store" });
    result.keyAccepted = auth.ok;
    if (!auth.ok) result.detail = `Auth settings returned HTTP ${auth.status}. Check the key.`;

    const rest = await fetch(`${base}/rest/v1/profiles?select=id&limit=1`, {
      headers,
      cache: "no-store",
    });
    if (rest.ok) result.schema = "installed";
    else if (rest.status === 404) result.schema = "missing";
    else if (!result.detail) result.detail = `Profiles check returned HTTP ${rest.status}.`;
  } catch {
    result.detail = "Could not reach Supabase. Check the URL.";
  }

  return NextResponse.json(result);
}
