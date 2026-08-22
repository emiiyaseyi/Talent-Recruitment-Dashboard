"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appConfig } from "@/config/app.config";
import { signOutAction } from "@/lib/actions";

export function NavBar({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:gap-6 sm:px-6 sm:py-4">
        <span className="shrink-0 text-sm font-semibold text-[var(--text-primary)]">{appConfig.appName}</span>
        <nav className="min-w-0 flex-1 overflow-x-auto">
          <div className="flex gap-1">
            {appConfig.nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-[var(--series-1)] text-white"
                      : "text-[var(--text-secondary)] hover:bg-[var(--page)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
        {userEmail && (
          <form action={signOutAction} className="flex shrink-0 items-center gap-3">
            <span className="hidden text-xs text-[var(--text-muted)] sm:inline">{userEmail}</span>
            <button
              type="submit"
              className="text-xs whitespace-nowrap text-[var(--text-secondary)] underline hover:text-[var(--text-primary)]"
            >
              Sign out
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
