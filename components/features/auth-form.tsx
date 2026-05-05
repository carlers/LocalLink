"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { routes } from "@/lib/constants/routes";
import type { BusinessCategory } from "@/lib/types/business";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<BusinessCategory>("Retail");
  const [shortDescription, setShortDescription] = useState("");
  const [isDtiRegistered, setIsDtiRegistered] = useState(false);
  const [isBarterFriendly, setIsBarterFriendly] = useState(false);
  const [hasUrgentNeed, setHasUrgentNeed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();

      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              business_name: businessName,
              location,
              business_category: category,
              short_description: shortDescription,
              business_is_dti_registered: String(isDtiRegistered),
              business_is_barter_friendly: String(isBarterFriendly),
              business_has_urgent_need: String(hasUrgentNeed),
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          router.push(routes.home);
          router.refresh();
          return;
        }

        setStatusMessage("Account created. Check your email to confirm the signup, then log in.");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push(routes.home);
      router.refresh();
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : "Authentication failed.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="rounded-panel border-border-subtle bg-surface border p-4 sm:p-6" onSubmit={handleSubmit}>
      {isSignup ? (
        <>
          <label className="text-sm font-medium" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            placeholder="Juan Dela Cruz"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
            required
          />

          <label className="mt-3 block text-sm font-medium" htmlFor="businessName">
            Business name
          </label>
          <input
            id="businessName"
            name="businessName"
            type="text"
            className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            placeholder="Your business name"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            autoComplete="organization"
            required
          />

          <label className="mt-3 block text-sm font-medium" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            placeholder="City or barangay"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            autoComplete="address-level2"
            required
          />

          <label className="mt-3 block text-sm font-medium" htmlFor="category">
            Business category
          </label>
          <select
            id="category"
            name="category"
            className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            value={category}
            onChange={(event) => setCategory(event.target.value as BusinessCategory)}
            required
          >
            <option value="Retail">Retail</option>
            <option value="Food">Food</option>
            <option value="Services">Services</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Other">Other</option>
          </select>

          <label className="mt-3 block text-sm font-medium" htmlFor="shortDescription">
            Short description
          </label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            className="rounded-chip border-border-subtle mt-1 min-h-24 w-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            placeholder="Tell others what your business offers or needs."
            value={shortDescription}
            onChange={(event) => setShortDescription(event.target.value)}
            required
          />

          <div className="mt-4 space-y-3 rounded-panel border-border-subtle bg-surface-muted border p-4">
            <p className="text-sm font-medium">Business details</p>

            <label className="flex items-center gap-3 text-sm" htmlFor="isDtiRegistered">
              <input
                id="isDtiRegistered"
                name="isDtiRegistered"
                type="checkbox"
                className="h-4 w-4 rounded border-border-subtle text-brand focus:ring-brand"
                checked={isDtiRegistered}
                onChange={(event) => setIsDtiRegistered(event.target.checked)}
              />
              DTI registered
            </label>

            <label className="flex items-center gap-3 text-sm" htmlFor="isBarterFriendly">
              <input
                id="isBarterFriendly"
                name="isBarterFriendly"
                type="checkbox"
                className="h-4 w-4 rounded border-border-subtle text-brand focus:ring-brand"
                checked={isBarterFriendly}
                onChange={(event) => setIsBarterFriendly(event.target.checked)}
              />
              Open to barter or trade
            </label>

            <label className="flex items-center gap-3 text-sm" htmlFor="hasUrgentNeed">
              <input
                id="hasUrgentNeed"
                name="hasUrgentNeed"
                type="checkbox"
                className="h-4 w-4 rounded border-border-subtle text-brand focus:ring-brand"
                checked={hasUrgentNeed}
                onChange={(event) => setHasUrgentNeed(event.target.checked)}
              />
              Has an urgent need right now
            </label>
          </div>
        </>
      ) : null}

      <label className={isSignup ? "mt-3 block text-sm font-medium" : "text-sm font-medium"} htmlFor="email">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        placeholder="you@business.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
      />

      <label className="mt-3 block text-sm font-medium" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        placeholder={isSignup ? "Create password" : "Enter password"}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete={isSignup ? "new-password" : "current-password"}
        required
      />

      {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}
      {statusMessage ? <p className="mt-3 text-sm text-brand">{statusMessage}</p> : null}

      <button
        type="submit"
        className="rounded-chip bg-brand mt-4 w-full px-3 py-3 text-sm font-semibold text-white disabled:opacity-60 sm:py-2.5"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Please wait..." : isSignup ? "Sign Up" : "Log In"}
      </button>
    </form>
  );
}