"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { mainNavItems, routes } from "@/lib/constants/routes";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function MainNav() {
  const [userPresent, setUserPresent] = useState(false);
  const [open, setOpen] = useState(false);
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
        setOpen(false);
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
    <header className="border-border-subtle bg-surface border-b">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <Link href={routes.home} className="text-foreground text-lg font-semibold">
          LocalLink
        </Link>

        <div className="flex items-center gap-3">
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
                onClick={() => setOpen((s) => !s)}
                className="rounded-full bg-surface-muted p-2"
              >
                <svg className="h-5 w-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.31 0-6 2.69-6 6h12c0-3.31-2.69-6-6-6z" />
                </svg>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-40 rounded-panel border-border-subtle bg-surface border p-2 shadow-lg">
                  <Link
                    href={routes.profile}
                    className="block px-3 py-2 text-sm text-text-muted hover:bg-surface-muted rounded"
                    onClick={() => setOpen(false)}
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
      </nav>
    </header>
  );
}
