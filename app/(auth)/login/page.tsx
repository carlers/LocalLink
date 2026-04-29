import Link from "next/link";
import { AuthForm } from "@/components/features/auth-form";
import { routes } from "@/lib/constants/routes";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Log In</h1>
      <p className="text-text-muted text-sm">Connect this form to your Supabase project to test real login sessions.</p>

      <AuthForm mode="login" />

      <p className="text-text-muted text-sm">
        Need an account?{" "}
        <Link href={routes.signup} className="text-brand font-medium">
          Sign up here
        </Link>
      </p>
    </div>
  );
}