"use client";

import { useCallback, useEffect, useState } from "react";
import { defaultLocale, localeStorageKey, resolveLocale, type Locale } from "@/lib/i18n/translations";

const localeChangeEventName = "locallink:locale-change";

function applyLocale(nextLocale: Locale) {
  window.localStorage.setItem(localeStorageKey, nextLocale);
  document.documentElement.lang = nextLocale;
  document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(new CustomEvent<Locale>(localeChangeEventName, { detail: nextLocale }));
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return defaultLocale;
    }

    return resolveLocale(window.localStorage.getItem(localeStorageKey));
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onStorageChange = (event: StorageEvent) => {
      if (event.key !== localeStorageKey) {
        return;
      }

      setLocaleState(resolveLocale(event.newValue));
    };

    const onLocaleChange = (event: Event) => {
      const customEvent = event as CustomEvent<Locale>;
      setLocaleState(resolveLocale(customEvent.detail));
    };

    window.addEventListener("storage", onStorageChange);
    window.addEventListener(localeChangeEventName, onLocaleChange);

    return () => {
      window.removeEventListener("storage", onStorageChange);
      window.removeEventListener(localeChangeEventName, onLocaleChange);
    };
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);

    if (typeof window !== "undefined") {
      applyLocale(nextLocale);
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "tl" : "en");
  }, [locale, setLocale]);

  return {
    locale,
    setLocale,
    toggleLocale,
  };
}
