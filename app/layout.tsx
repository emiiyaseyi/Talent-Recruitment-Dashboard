import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/ui/NavBar";
import { appConfig } from "@/config/app.config";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: appConfig.appName,
  description: "Talent acquisition analytics dashboard",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="bg-[var(--page)] text-[var(--text-primary)]">
        <NavBar userEmail={session?.user?.email ?? null} />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
