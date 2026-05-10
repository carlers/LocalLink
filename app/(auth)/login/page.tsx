import Image from "next/image";
import Link from "next/link";
import { AuthForm } from "@/components/features/auth-form";
import { routes } from "@/lib/constants/routes";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-4 pt-8 pb-12 sm:px-6 sm:pt-16">
      <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-lg shadow-black/20 sm:p-8">
        <div className="flex items-center gap-3">
          <Image src="/favicon_io/android-chrome-192x192.png" alt="LocalLink" width={44} height={44} className="h-11 w-11 shrink-0" priority />
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Log In</h1>
        </div>
        <p className="mt-4 text-text-muted text-base">
          Connect with local businesses and manage your community network.
        </p>
      </div>

      <AuthForm mode="login" />

      <p className="text-text-muted text-sm">
        Need an account?{" "}
        <Link href={routes.signup} className="text-brand font-semibold hover:text-white">
          Sign up here
        </Link>
      </p>
    </div>
  );
}