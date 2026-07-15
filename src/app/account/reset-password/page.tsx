import type { Metadata } from "next";
import { AuthShell } from "@/components/account/auth-shell";
import { ResetPasswordForm } from "@/components/account/auth-forms";

export const metadata: Metadata = { title: "Set New Password" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a New Password"
      subtitle="Choose a new password for your account"
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
