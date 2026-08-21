import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Auth is required from day one (dashboard exposes cost-per-hire data).
 * Restricted to the company's Google Workspace domain via ALLOWED_EMAIL_DOMAIN
 * rather than allowing any Google account — set it in env, see .env.local.example.
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
      const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;
      if (!allowedDomain) return true;
      const email = profile?.email ?? "";
      return email.toLowerCase().endsWith(`@${allowedDomain.toLowerCase()}`);
    },
  },
  pages: {
    signIn: "/login",
  },
});
