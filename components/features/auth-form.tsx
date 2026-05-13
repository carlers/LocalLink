"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { routes } from "@/lib/constants/routes";
import { useLocale } from "@/lib/hooks/useLocale";
import { translations } from "@/lib/i18n/translations";
import { Spinner } from "@/components/ui/spinner";
import type { BusinessCategory } from "@/lib/types/business";
import { getCities, getBarangaysForCity } from "@/lib/constants/locations";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const copy = translations[locale].auth;
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [barangay, setBarangay] = useState("");
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
              location: `${barangay}, ${city}`,
              city,
              barangay,
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

        setStatusMessage(copy.signupSuccess);
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
      const message = authError instanceof Error ? authError.message : copy.authFailed;
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="rounded-panel border-border-subtle bg-surface border p-5 shadow-lg shadow-black/10 sm:p-6" onSubmit={handleSubmit}>
      {isSignup ? (
        <>
          <label className="text-sm font-semibold text-white" htmlFor="fullName">
            {copy.fullName}
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            className="rounded-2xl border-border-subtle bg-background/80 mt-1 w-full border px-4 py-3 text-white placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            placeholder={copy.fullNamePlaceholder}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
            required
          />

          <label className="mt-4 block text-sm font-semibold text-white" htmlFor="businessName">
            {copy.businessName}
          </label>
          <input
            id="businessName"
            name="businessName"
            type="text"
            className="rounded-2xl border-border-subtle bg-background/80 mt-1 w-full border px-4 py-3 text-white placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            placeholder={copy.businessNamePlaceholder}
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            autoComplete="organization"
            required
          />

          <label className="mt-4 block text-sm font-semibold text-white" htmlFor="city">
            {copy.city}
          </label>
          <select
            id="city"
            name="city"
            className="rounded-2xl border-border-subtle bg-background/80 mt-1 w-full border px-4 py-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            value={city}
            onChange={(event) => {
              setCity(event.target.value);
              setBarangay("");
            }}
            required
          >
            <option value="">{copy.selectCity}</option>
            {getCities().map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label className="mt-4 block text-sm font-semibold text-white" htmlFor="barangay">
            {copy.barangay}
          </label>
          <select
            id="barangay"
            name="barangay"
            className="rounded-2xl border-border-subtle bg-background/80 mt-1 w-full border px-4 py-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            value={barangay}
            onChange={(event) => setBarangay(event.target.value)}
            required
          >
            <option value="">{copy.selectBarangay}</option>
            {city
              ? getBarangaysForCity(city).map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))
              : null}
          </select>

          <label className="mt-4 block text-sm font-semibold text-white" htmlFor="category">
            {copy.businessCategory}
          </label>
          <select
            id="category"
            name="category"
            className="rounded-2xl border-border-subtle bg-background/80 mt-1 w-full border px-4 py-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            value={category}
            onChange={(event) => setCategory(event.target.value as BusinessCategory)}
            required
          >
            <option value="Retail">{copy.categoryLabels.Retail}</option>
            <option value="Food">{copy.categoryLabels.Food}</option>
            <option value="Services">{copy.categoryLabels.Services}</option>
            <option value="Manufacturing">{copy.categoryLabels.Manufacturing}</option>
            <option value="Other">{copy.categoryLabels.Other}</option>
          </select>

          <label className="mt-4 block text-sm font-semibold text-white" htmlFor="shortDescription">
            {copy.shortDescription}
          </label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            className="rounded-2xl border-border-subtle bg-background/80 mt-1 min-h-24 w-full border px-4 py-3 text-white placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            placeholder={copy.shortDescriptionPlaceholder}
            value={shortDescription}
            onChange={(event) => setShortDescription(event.target.value)}
            required
          />

          <div className="mt-5 space-y-3 rounded-panel border-border-subtle bg-surface-muted border p-4">
            <p className="text-sm font-semibold text-white">{copy.businessDetails}</p>

            <label className="flex items-center gap-3 text-sm text-text-muted" htmlFor="isDtiRegistered">
              <input
                id="isDtiRegistered"
                name="isDtiRegistered"
                type="checkbox"
                className="h-4 w-4 rounded border-border-subtle text-brand focus:ring-brand"
                checked={isDtiRegistered}
                onChange={(event) => setIsDtiRegistered(event.target.checked)}
              />
              {copy.dtiRegistered}
            </label>

            <label className="flex items-center gap-3 text-sm text-text-muted" htmlFor="isBarterFriendly">
              <input
                id="isBarterFriendly"
                name="isBarterFriendly"
                type="checkbox"
                className="h-4 w-4 rounded border-border-subtle text-brand focus:ring-brand"
                checked={isBarterFriendly}
                onChange={(event) => setIsBarterFriendly(event.target.checked)}
              />
              {copy.openToBarter}
            </label>

            <label className="flex items-center gap-3 text-sm text-text-muted" htmlFor="hasUrgentNeed">
              <input
                id="hasUrgentNeed"
                name="hasUrgentNeed"
                type="checkbox"
                className="h-4 w-4 rounded border-border-subtle text-brand focus:ring-brand"
                checked={hasUrgentNeed}
                onChange={(event) => setHasUrgentNeed(event.target.checked)}
              />
              {copy.hasUrgentNeed}
            </label>
          </div>
        </>
      ) : null}

      <label className={isSignup ? "mt-4 block text-sm font-semibold text-white" : "text-sm font-semibold text-white"} htmlFor="email">
        {copy.email}
      </label>
      <input
        id="email"
        name="email"
        type="email"
        className="rounded-2xl border-border-subtle bg-background/80 mt-1 w-full border px-4 py-3 text-white placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        placeholder={copy.emailPlaceholder}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
      />

      <label className="mt-4 block text-sm font-semibold text-white" htmlFor="password">
        {copy.password}
      </label>
      <input
        id="password"
        name="password"
        type="password"
        className="rounded-2xl border-border-subtle bg-background/80 mt-1 w-full border px-4 py-3 text-white placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        placeholder={isSignup ? copy.createPassword : copy.enterPassword}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete={isSignup ? "new-password" : "current-password"}
        required
      />

      {errorMessage ? <p className="mt-3 text-sm text-red-400">{errorMessage}</p> : null}
      {statusMessage ? <p className="mt-3 text-sm text-brand">{statusMessage}</p> : null}

      <button
        type="submit"
        className="btn-primary mt-5 w-full px-4 py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Spinner size="sm" color="white" ariaLabel={copy.submitAria} />
            <span>{copy.pleaseWait}</span>
          </>
        ) : isSignup ? (
          copy.signUpButton
        ) : (
          copy.logInButton
        )}
      </button>
    </form>
  );
}