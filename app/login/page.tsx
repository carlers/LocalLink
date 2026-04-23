import Link from "next/link";
import { routes } from "@/lib/constants/routes";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Log In</h1>
      <p className="text-text-muted text-sm">Supabase authentication wiring will be added in Sprint 2.</p>

      <form className="rounded-panel border-border-subtle bg-surface border p-4">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2"
          placeholder="you@business.com"
          disabled
        />

        <label className="mt-3 block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2"
          placeholder="Enter password"
          disabled
        />

        <button
          type="button"
          className="rounded-chip bg-brand mt-4 w-full px-3 py-2 text-sm font-semibold text-white"
        >
          Log In (placeholder)
        </button>
      </form>

      <p className="text-text-muted text-sm">
        Need an account?{" "}
        <Link href={routes.signup} className="text-brand font-medium">
          Sign up here
        </Link>
      </p>
    </div>
  );
}
