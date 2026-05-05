import Image from "next/image";
import Link from "next/link";
import { AuthForm } from "@/components/features/auth-form";
import { routes } from "@/lib/constants/routes";

export default function SignupPage() {
  return (
    <div className="mx-auto w-full max-w-md space-y-4 px-4 pt-8 sm:pt-16">
      <div className="flex items-center gap-3">
        <Image src="/favicon_io/favicon-32x32.png" alt="LocalLink" width={32} height={32} className="h-8 w-8 shrink-0" priority />
        <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">Sign Up</h1>
      </div>
      <p className="text-text-muted text-sm">Create a Supabase auth user, then store the profile data in your app flow.</p>

      <AuthForm mode="signup" />

      <p className="text-text-muted text-sm">
        Already have an account?{" "}
        <Link href={routes.login} className="text-brand font-medium">
          Log in here
        </Link>
      </p>
    </div>
  );
}