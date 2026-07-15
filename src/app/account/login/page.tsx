import type { Metadata } from "next";
import { AuthShell } from "@/components/account/auth-shell";
import { LoginForm } from "@/components/account/auth-forms";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  return (
    <AuthShell title="Welcome Back" subtitle="Sign in to your Haneen Grace account">
      <LoginForm redirectTo={redirect && redirect.startsWith("/") ? redirect : "/account"} />
    </AuthShell>
  );
}
