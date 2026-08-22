import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Auth is required from day one (dashboard exposes cost-per-hire data).
 *
 * Access is restricted via two mechanisms, either of which can grant entry:
 *  - ALLOWED_EMAILS: a comma-separated allowlist of exact addresses. This is
 *    the one that matters when the sheet owner uses a personal Gmail account
 *    rather than a company domain — restricting by "@gmail.com" would let in
 *    anyone with a Gmail account, since that domain isn't actually yours.
 *  - ALLOWED_EMAIL_DOMAIN: a company Workspace domain, for when this moves to
 *    a team with a real shared domain.
 * If neither is set, sign-in is unrestricted — fine for local dev, never for
 * production.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const allowedEmails = process.env.ALLOWED_EMAILS;
      const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;
      if (!allowedEmails && !allowedDomain) return true;

      const email = (profile?.email ?? "").toLowerCase();

      if (allowedEmails) {
        const list = allowedEmails.split(",").map((e) => e.trim().toLowerCase());
        if (list.includes(email)) return true;
      }
      if (allowedDomain && email.endsWith(`@${allowedDomain.toLowerCase()}`)) {
        return true;
      }
      return false;
    },
  },
  pages: {
    signIn: "/login",
  },
});
