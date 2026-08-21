import { signIn } from "@/lib/auth";
import { appConfig } from "@/config/app.config";

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">{appConfig.appName}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Sign in to continue.</p>
        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/executive-summary" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-md bg-[var(--series-1)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
}
