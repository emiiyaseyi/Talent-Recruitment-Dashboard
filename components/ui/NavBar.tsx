"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { appConfig } from "@/config/app.config";
import { signOutAction } from "@/lib/actions";

type NavItem = { href: string; label: string };

export function NavBar({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <span className="shrink-0 text-sm font-semibold text-[var(--text-primary)]">
          <span className="sm:hidden">T.A.D</span>
          <span className="hidden sm:inline">{appConfig.appName}</span>
        </span>

        {/* Desktop nav — hidden below sm, collapses into the hamburger menu instead */}
        <nav className="hidden min-w-0 flex-1 sm:block">
          <div className="flex gap-1">
            {appConfig.nav.map((item) => (
              <NavLink key={item.href} item={item} active={pathname === item.href} />
            ))}
          </div>
        </nav>

        {userEmail && (
          <form action={signOutAction} className="hidden shrink-0 items-center gap-3 sm:flex">
            <span className="text-xs text-[var(--text-muted)]">{userEmail}</span>
            <button
              type="submit"
              className="text-xs text-[var(--text-secondary)] underline hover:text-[var(--text-primary)]"
            >
              Sign out
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-md p-1.5 text-[var(--text-secondary)] sm:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--border)] px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-1">
            {appConfig.nav.map((item) => (
              <NavLink key={item.href} item={item} active={pathname === item.href} full />
            ))}
          </nav>
          {userEmail && (
            <form
              action={signOutAction}
              className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3"
            >
              <span className="text-xs text-[var(--text-muted)]">{userEmail}</span>
              <button type="submit" className="text-xs text-[var(--text-secondary)] underline">
                Sign out
              </button>
            </form>
          )}
        </div>
      )}
    </header>
  );
}

function NavLink({ item, active, full }: { item: NavItem; active: boolean; full?: boolean }) {
  return (
    <Link
      href={item.href}
      className={`rounded-md px-3 py-1.5 text-sm transition-colors ${full ? "block" : "shrink-0 whitespace-nowrap"} ${
        active ? "bg-[var(--series-1)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--page)]"
      }`}
    >
      {item.label}
    </Link>
  );
}
