"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/auth/messages";
import { fieldErrors, forgotPasswordSchema } from "@/lib/auth/schemas";
import { AuthCard, FormAlert, SubmitButton, TextField } from "./auth-ui";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) {
        setFormError(friendlyAuthError(error));
        setLoading(false);
        return;
      }
      setSent(true);
      setLoading(false);
    } catch (err) {
      setFormError(friendlyAuthError(err as Error));
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        footer={
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Back to log in
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <MailCheck className="h-6 w-6" aria-hidden />
          </span>
          <p className="text-sm text-foreground">
            If an account exists for <span className="font-semibold">{email.trim()}</span>, we sent a link to
            reset the password.
          </p>
          <p className="text-xs text-muted-foreground">
            Open the link in the same browser you are using now. It expires after a while, so use it soon.
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we will send you a reset link."
      footer={
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Back to log in
        </Link>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        {formError && <FormAlert kind="error">{formError}</FormAlert>}
        <SubmitButton loading={loading}>{loading ? "Sending…" : "Send reset link"}</SubmitButton>
      </form>
    </AuthCard>
  );
}
