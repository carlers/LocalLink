import Link from "next/link";
import { mainNavItems, routes } from "@/lib/constants/routes";

export function MainNav() {
  return (
    <header className="border-border-subtle bg-surface border-b">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <Link href={routes.home} className="text-foreground text-lg font-semibold">
          LocalLink
        </Link>

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
      </nav>
    </header>
  );
}
