import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";
import { RoleSlug } from "@prisma/client";
import { canAccessRoute } from "@/lib/rbac";

const { auth: edgeAuth } = NextAuth(authConfig);

const PUBLIC_PREFIXES = ["/login", "/api"];

export default edgeAuth((req) => {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.next();
  }

  if (!req.auth?.user?.id) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  const role = req.auth.user.roleSlug as RoleSlug | undefined;
  if (!role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!canAccessRoute(role, pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
