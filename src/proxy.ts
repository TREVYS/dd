import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Seul le back-office est protégé. Tout le reste est public — les URL
// inexistantes tombent ainsi sur la vraie page 404 (et non sur la connexion).
const PROTECTED_PREFIXES = ["/admin"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname.startsWith("/login");

  // Visiteur non connecté sur le back-office → connexion.
  if (!isLoggedIn && isProtected(pathname)) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  // Déjà connecté et sur la page de connexion → cockpit Trevys.
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
