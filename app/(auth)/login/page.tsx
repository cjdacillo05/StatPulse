import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { safeNextPath } from "@/lib/supabase/route-rules";

export const metadata: Metadata = { title: "Log in" };

type Param = string | string[] | undefined;
const first = (v: Param) => (Array.isArray(v) ? v[0] : v);

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: Param; error?: Param; reset?: Param };
}) {
  const next = safeNextPath(first(searchParams.next));
  const notice = first(searchParams.reset)
    ? "reset"
    : first(searchParams.error) === "link"
      ? "link"
      : null;
  return <LoginForm next={next} notice={notice} />;
}
