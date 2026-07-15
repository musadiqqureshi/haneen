import type { Metadata } from "next";
import { AuthShell } from "@/components/account/auth-shell";
import { RegisterForm } from "@/components/account/auth-forms";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Join Haneen Grace"
      subtitle="Create an account for faster checkout, order tracking and your wishlist"
    >
      <RegisterForm />
    </AuthShell>
  );
}
