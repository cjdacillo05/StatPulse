"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/auth/messages";
import { fieldErrors, signupSchema } from "@/lib/auth/schemas";
import {
  AuthCard,
  FormAlert,
  PasswordChecklist,
  PasswordField,
  SubmitButton,
  TextField,
} from "./auth-ui";

export function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const parsed = signupSchema.safeParse({ fullName, email, password, confirmPassword });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: { full_name: parsed.data.fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setFormError(friendlyAuthError(error));
        setLoading(false);
        return;
      }

      // Email confirmation turned off in Supabase: the user is already signed in.
      if (data.session) {
        window.location.assign("/dashboard");
        return;
      }

      // Same message whether or not the address already had an account,
      // so this form cannot be used to find out who is registered.
      setSentTo(parsed.data.email);
      setLoading(false);
    } catch (err) {
      setFormError(friendlyAuthError(err as Error));
      setLoading(false);
    }
  }

  if (sentTo) {
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
            We sent a confirmation link to <span className="font-semibold">{sentTo}</span>. Open it to
            activate your account, then log in.
          </p>
          <p className="text-xs text-muted-foreground">
            Nothing after a few minutes? Check your spam folder. The free email service has strict limits,
            so messages can be delayed.
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Save your work and pick up where you left off."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <TextField
          label="Full name"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <div className="space-y-2">
          <PasswordField
            label="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <PasswordChecklist password={password} />
        </div>
        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />

        {formError && <FormAlert kind="error">{formError}</FormAlert>}

        <SubmitButton loading={loading}>{loading ? "Creating account…" : "Create account"}</SubmitButton>
      </form>
    </AuthCard>
  );
}
