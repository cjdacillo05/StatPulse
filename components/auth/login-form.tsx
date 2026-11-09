"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { recordActivity } from "@/lib/auth/activity";
import { friendlyAuthError } from "@/lib/auth/messages";
import { fieldErrors, loginSchema } from "@/lib/auth/schemas";
import { AuthCard, FormAlert, PasswordField, SubmitButton, TextField } from "./auth-ui";

interface LoginFormProps {
  /** Where to go after login (already validated on the server). */
  next: string;
  notice: "reset" | "link" | null;
}

export function LoginForm({ next, notice }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (error || !data.user) {
        setFormError(friendlyAuthError(error));
        setLoading(false);
        return;
      }
      await recordActivity(supabase, data.user.id, "login");
      // Full page load so the server sees the new session cookie right away.
      window.location.assign(next);
    } catch (err) {
      setFormError(friendlyAuthError(err as Error));
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Log in"
      subtitle="Welcome back to StatPulse."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {notice === "reset" && (
          <FormAlert kind="success">Password updated. Log in with your new password.</FormAlert>
        )}
        {notice === "link" && (
          <FormAlert kind="error">
            That link is invalid or has expired. If you already confirmed your email, log in below.
            Otherwise request a new link, and open it in the same browser you used to sign up.
          </FormAlert>
        )}

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        {formError && <FormAlert kind="error">{formError}</FormAlert>}

        <SubmitButton loading={loading}>{loading ? "Logging in…" : "Log in"}</SubmitButton>
      </form>
    </AuthCard>
  );
}
