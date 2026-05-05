"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { mainNavItems, routes } from "@/lib/constants/routes";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function MainNav() {
  const [userPresent, setUserPresent] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserPresent(Boolean(data.user));
    });

    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("click", onDoc);
    return () => {
      mounted = false;
      document.removeEventListener("click", onDoc);
    };
  }, []);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push(routes.login);
  }

  return (
    <header className="border-border-subtle bg-surface/95 border-b backdrop-blur">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href={routes.home} className="text-foreground text-lg font-semibold">
          LocalLink
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <ul className="flex items-center gap-2">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-text-muted hover:bg-surface-muted hover:text-foreground rounded-chip px-3 py-2 text-sm font-medium"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {userPresent && (
            <div className="relative" ref={menuRef}>
              <button
                aria-label="Account menu"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((s) => !s)}
                className="rounded-full bg-surface-muted p-2"
              >
                <svg className="h-5 w-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.31 0-6 2.69-6 6h12c0-3.31-2.69-6-6-6z" />
                </svg>
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-panel border-border-subtle bg-surface border p-2 shadow-lg">
                  <Link
                    href={routes.profile}
                    className="block px-3 py-2 text-sm text-text-muted hover:bg-surface-muted rounded"
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
          className="rounded-chip border-border-subtle bg-surface-muted inline-flex items-center justify-center border p-2 md:hidden"
        >
          <svg className="h-5 w-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {mobileOpen ? (
        <div id="mobile-menu" className="border-border-subtle border-t px-4 py-3 sm:px-6 md:hidden">
          <ul className="space-y-2">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-text-muted hover:bg-surface-muted hover:text-foreground block rounded-chip px-3 py-3 text-sm font-medium"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {userPresent ? (
            <div className="mt-3 space-y-2 border-border-subtle border-t pt-3">
              <Link
                href={routes.profile}
                onClick={() => setMobileOpen(false)}
                className="text-text-muted hover:bg-surface-muted hover:text-foreground block rounded-chip px-3 py-3 text-sm font-medium"
              >
                Profile
              </Link>
              <button
                onClick={async () => {
                  setMobileOpen(false);
                  await handleLogout();
                }}
                className="text-text-muted hover:bg-surface-muted hover:text-foreground block w-full rounded-chip px-3 py-3 text-left text-sm font-medium"
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
