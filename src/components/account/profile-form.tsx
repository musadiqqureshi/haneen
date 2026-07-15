"use client";

import { useActionState } from "react";
import { updateProfileAction, type AuthState } from "@/lib/auth/actions";
import { AuthField, SubmitButton, FormMessage } from "./auth-ui";

export function ProfileForm({
  fullName,
  phone,
  email,
}: {
  fullName: string;
  phone: string;
  email: string;
}) {
  const [state, action] = useActionState(updateProfileAction, {} as AuthState);
  return (
    <form action={action} className="space-y-4">
      <FormMessage error={state.error} message={state.message} />
      <AuthField
        label="Full Name"
        name="fullName"
        defaultValue={fullName}
        error={state.fieldErrors?.fullName}
      />
      <AuthField
        label="Phone"
        name="phone"
        type="tel"
        required={false}
        defaultValue={phone}
        placeholder="+92 3XX XXXXXXX"
      />
      <div>
        <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink">
          Email
        </span>
        <p className="flex h-12 items-center border border-line bg-beige px-4 text-sm text-ink-muted">
          {email}
        </p>
      </div>
      <SubmitButton className="sm:w-auto sm:px-10">Save Changes</SubmitButton>
    </form>
  );
}
