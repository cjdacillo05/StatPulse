"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/auth/messages";
import { fieldErrors, resetPasswordSchema } from "@/lib/auth/schemas";
import { AuthCard, FormAlert, PasswordChecklist, PasswordField, SubmitButton } from "./auth-ui";

type Status = "checking" | "ready" | "invalid";

export function ResetPasswordForm() {
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // The email link signs the user in temporarily (see /auth/callback).
  // No session means the link was missing, expired, or already used.
  useEffect(() => {
    let active = true;
    try {
      createClient()
        .auth.getUser()
        .then(({ data }) => {
          if (active) setStatus(data.user ? "ready" : "invalid");
        })
        .catch(() => {
          if (active) setStatus("invalid");
        });
    } catch {
      setStatus("invalid");
    }
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (error) {
        setFormError(friendlyAuthError(error));
        setLoading(false);
        return;
      }
      // Sign out so the person logs in once with the new password.
      await supabase.auth.signOut();
      window.location.assign("/login?reset=1");
    } catch (err) {
      setFormError(friendlyAuthError(err as Error));
      setLoading(false);
    }
  }

  if (status === "checking") {
    return (
      <AuthCard title="Set a new password">
        <p className="text-sm text-muted-foreground">Checking your reset link…</p>
      </AuthCard>
    );
  }

  if (status === "invalid") {
    return (
      <AuthCard
        title="This link does not work"
        footer={
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Back to log in
          </Link>
        }
      >
        <div className="space-y-4">
          <FormAlert kind="error">
            The reset link is missing, expired, or was already used. Request a new one and open it in the
            same browser.
          </FormAlert>
          <Link
            href="/forgot-password"
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90"
          >
            Request a new link
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" subtitle="Choose a password you have not used before.">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="space-y-2">
          <PasswordField
            label="New password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <PasswordChecklist password={password} />
        </div>
        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />
        {formError && <FormAlert kind="error">{formError}</FormAlert>}
        <SubmitButton loading={loading}>{loading ? "Saving…" : "Update password"}</SubmitButton>
      </form>
    </AuthCard>
  );
}
