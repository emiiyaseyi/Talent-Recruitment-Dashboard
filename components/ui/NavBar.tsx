"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appConfig } from "@/config/app.config";
import { signOutAction } from "@/lib/actions";

export function NavBar({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <span className="text-sm font-semibold text-[var(--text-primary)]">{appConfig.appName}</span>
        <nav className="flex flex-1 gap-1">
          {appConfig.nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-[var(--series-1)] text-white"
                    : "text-[var(--text-secondary)] hover:bg-[var(--page)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {userEmail && (
          <form action={signOutAction} className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-muted)]">{userEmail}</span>
            <button type="submit" className="text-xs text-[var(--text-secondary)] underline hover:text-[var(--text-primary)]">
              Sign out
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
