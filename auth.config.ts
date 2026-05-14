import type { NextAuthConfig } from "next-auth";
import type { RoleSlug } from "@prisma/client";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/constants";

export default {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: 60 * 15,
  },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.roleSlug = (user as { roleSlug: RoleSlug }).roleSlug;
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.roleSlug = token.roleSlug as RoleSlug;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
