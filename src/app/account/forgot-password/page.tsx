import type { Metadata } from "next";
import { AuthShell } from "@/components/account/auth-shell";
import { ForgotPasswordForm } from "@/components/account/auth-forms";

export const metadata: Metadata = { title: "Reset Password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter your email and we'll send you a secure reset link"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
