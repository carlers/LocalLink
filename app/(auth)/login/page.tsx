import Image from "next/image";
import Link from "next/link";
import { AuthForm } from "@/components/features/auth-form";
import { routes } from "@/lib/constants/routes";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md space-y-4 px-4 pt-8 sm:pt-16">
      <div className="flex items-center gap-3">
        <Image src="/favicon_io/favicon-32x32.png" alt="LocalLink" width={32} height={32} className="h-8 w-8 shrink-0" priority />
        <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">Log In</h1>
      </div>
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