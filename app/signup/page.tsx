import Link from "next/link";
import { routes } from "@/lib/constants/routes";

export default function SignupPage() {
  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Sign Up</h1>
      <p className="text-text-muted text-sm">Create your business account. Supabase submission logic follows next sprint.</p>

      <form className="rounded-panel border-border-subtle bg-surface border p-4">
        <label className="text-sm font-medium" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2"
          placeholder="Juan Dela Cruz"
          disabled
        />

        <label className="mt-3 block text-sm font-medium" htmlFor="businessName">
          Business name
        </label>
        <input
          id="businessName"
          name="businessName"
          type="text"
          className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2"
          placeholder="Your business name"
          disabled
        />

        <label className="mt-3 block text-sm font-medium" htmlFor="location">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2"
          placeholder="City or barangay"
          disabled
        />

        <label className="mt-3 block text-sm font-medium" htmlFor="email">
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
          placeholder="Create password"
          disabled
        />

        <button
          type="button"
          className="rounded-chip bg-brand mt-4 w-full px-3 py-2 text-sm font-semibold text-white"
        >
          Sign Up (placeholder)
        </button>
      </form>

      <p className="text-text-muted text-sm">
        Already have an account?{" "}
        <Link href={routes.login} className="text-brand font-medium">
          Log in here
        </Link>
      </p>
    </div>
  );
}
