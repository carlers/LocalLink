"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { mainNavItems, routes } from "@/lib/constants/routes";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useInboxBadgeCount } from "@/lib/hooks/useInboxBadgeCount";

type ThemeMode = "light" | "dark";

export function MainNav() {
  const [userPresent, setUserPresent] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const storedTheme = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    return storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : prefersDark
        ? "dark"
        : "light";
  });
  const inboxBadgeCount = useInboxBadgeCount(userId);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    window.localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
    document.documentElement.classList.toggle("theme-light", theme === "light");
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push(routes.login);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/20 bg-[#487b7a] shadow-sm shadow-black/5">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href={routes.home} className="inline-flex items-center gap-3 text-xl font-semibold tracking-tight text-white">
          <Image
            src="/favicon_io/android-chrome-192x192.png"
            alt="LocalLink"
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-2xl border border-white/30 bg-white/20"
            priority
          />
          <span>LocalLink</span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <ul className="flex items-center gap-2">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-white/80 hover:text-white rounded-full px-4 py-2 text-sm font-medium transition duration-150"
                >
                  <span className="inline-flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.href === routes.inbox && inboxBadgeCount > 0 ? (
                      <span className="bg-brand text-white inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none">
                        {inboxBadgeCount > 99 ? "99+" : inboxBadgeCount}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            aria-label="Toggle color scheme"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            )}
          </button>

          {userPresent && (
            <div className="relative" ref={menuRef}>
              <button
                aria-label="Account menu"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((s) => !s)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
              >
                {profileImageUrl ? (
                  <Image
                    src={profileImageUrl}
                    alt="Profile avatar"
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  </svg>
                )}
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-border-subtle bg-surface p-2 shadow-lg shadow-black/20">
                  <Link
                    href={routes.profile}
                    className="block px-3 py-2 text-sm text-foreground/75 hover:text-foreground hover:bg-surface-muted rounded transition"
                    onClick={() => setAccountOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-text-muted hover:bg-surface-muted rounded"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((s) => !s)}
          className="rounded-full border border-white/20 bg-white/10 inline-flex items-center justify-center p-2 text-white transition hover:bg-white/20 md:hidden"
        >
          <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {mobileOpen ? (
        <div id="mobile-menu" className="border-white/20 border-t bg-surface px-4 py-4 sm:px-6 md:hidden">
          <ul className="space-y-2">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-foreground/75 hover:text-foreground block rounded-2xl bg-surface-muted/80 px-3 py-3 text-sm font-medium transition"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span>{item.label}</span>
                    {item.href === routes.inbox && inboxBadgeCount > 0 ? (
                      <span className="bg-brand text-white inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none">
                        {inboxBadgeCount > 99 ? "99+" : inboxBadgeCount}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center gap-3 border-border-subtle border-t pt-4">
            <button
              type="button"
              aria-label="Toggle color scheme"
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface text-foreground transition hover:bg-surface-muted"
            >
              {theme === "dark" ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              )}
            </button>
          </div>

          {userPresent ? (
            <div className="mt-3 space-y-2 border-border-subtle border-t pt-3">
              <Link
                href={routes.profile}
                onClick={() => setMobileOpen(false)}
                className="text-foreground/75 hover:text-foreground block rounded-2xl bg-surface-muted/80 px-3 py-3 text-sm font-medium transition"
              >
                Profile
              </Link>
              <button
                onClick={async () => {
                  setMobileOpen(false);
                  await handleLogout();
                }}
                className="text-foreground/75 hover:text-foreground block w-full rounded-2xl bg-surface-muted/80 px-3 py-3 text-left text-sm font-medium transition"
              >
                Log out
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}