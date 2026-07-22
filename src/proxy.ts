import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Routes publiques (site vitrine) accessibles sans authentification.
// Tout le reste (ERP TREVYS OS sous /app, /clients, /devis, …) reste protégé.
const PUBLIC_PREFIXES = [
  "/login",
  "/expertise-comptable",
  "/consulting",
  "/intelligence-artificielle",
  "/facturation-electronique",
  "/le-cabinet",
  "/notre-ecosysteme",
  "/references",
  "/blog",
  "/p", // pages personnalisées créées depuis le back-office
  "/contact",
  "/rendez-vous",
  "/espace-client",
  "/mentions-legales",
  "/fec-partage", // partage de FEC par jeton
  "/uploads", // médias importés depuis le back-office
];

const PUBLIC_FILES = ["/sitemap.xml", "/robots.txt"];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true; // accueil du site vitrine
  if (PUBLIC_FILES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname.startsWith("/login");

  // Visiteur non connecté sur une route protégée → connexion.
  if (!isLoggedIn && !isPublicPath(pathname)) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  // Déjà connecté et sur la page de connexion → tableau de bord ERP.
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/app", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
