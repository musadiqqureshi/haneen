"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  signInAction,
  signUpAction,
  requestPasswordResetAction,
  updatePasswordAction,
  type AuthState,
} from "@/lib/auth/actions";
import { AuthField, SubmitButton, FormMessage } from "./auth-ui";
import { GoogleButton } from "./google-button";

const initial: AuthState = {};

function Divider() {
  return (
    <div className="my-6 flex items-center gap-4">
      <span className="h-px flex-1 bg-line" />
      <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ink-muted">
        or
      </span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function LoginForm({ redirectTo = "/account" }: { redirectTo?: string }) {
  const [state, action] = useActionState(signInAction, initial);
  return (
    <div>
      <GoogleButton next={redirectTo} />
      <Divider />
      <form action={action} className="space-y-4">
        <input type="hidden" name="redirect" value={redirectTo} />
        <FormMessage error={state.error} message={state.message} />
        <AuthField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={state.fieldErrors?.email}
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={state.fieldErrors?.password}
        />
        <div className="flex justify-end">
          <Link
            href="/account/forgot-password"
            className="text-xs text-gold-600 hover:text-gold-700"
          >
            Forgot password?
          </Link>
        </div>
        <SubmitButton>Sign In</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-ink-soft">
        New to Haneen Grace?{" "}
        <Link href="/account/register" className="text-gold-600 hover:text-gold-700">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(signUpAction, initial);
  return (
    <div>
      <GoogleButton />
      <Divider />
      <form action={action} className="space-y-4">
        <FormMessage error={state.error} message={state.message} />
        <AuthField
          label="Full Name"
          name="fullName"
          autoComplete="name"
          placeholder="Ayesha Khan"
          error={state.fieldErrors?.fullName}
        />
        <AuthField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={state.fieldErrors?.email}
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          error={state.fieldErrors?.password}
        />
        <SubmitButton>Create Account</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/account/login" className="text-gold-600 hover:text-gold-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordResetAction, initial);
  return (
    <form action={action} className="space-y-4">
      <FormMessage error={state.error} message={state.message} />
      <AuthField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={state.fieldErrors?.email}
      />
      <SubmitButton>Send Reset Link</SubmitButton>
      <p className="text-center text-sm text-ink-soft">
        <Link href="/account/login" className="text-gold-600 hover:text-gold-700">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(updatePasswordAction, initial);
  return (
    <form action={action} className="space-y-4">
      <FormMessage error={state.error} message={state.message} />
      <AuthField
        label="New Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={state.fieldErrors?.password}
      />
      <SubmitButton>Update Password</SubmitButton>
    </form>
  );
}
