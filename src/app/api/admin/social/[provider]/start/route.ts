import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { auth } from "@/lib/auth";
import { SITE_URL } from "@/lib/site";
import { PROVIDERS, isConfigured, type Provider } from "@/lib/social";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const session = await auth();
  if (!session?.user) return NextResponse.redirect(`${SITE_URL}/login`);

  const { provider } = await params;
  const cfg = PROVIDERS.find((p) => p.id === provider);
  if (!cfg) return NextResponse.redirect(`${SITE_URL}/admin/reglages`);

  // Identifiants développeur absents → on renvoie vers le guide de configuration.
  if (!isConfigured(provider as Provider)) {
    return NextResponse.redirect(`${SITE_URL}/admin/reglages?setup=${provider}`);
  }

  // Protection CSRF : state aléatoire stocké en cookie httpOnly.
  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${SITE_URL}/api/admin/social/${provider}/callback`;
  const url = new URL(cfg.authorizeUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", process.env[cfg.clientIdEnv] as string);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", cfg.scope);
  url.searchParams.set("state", state);

  const res = NextResponse.redirect(url.toString());
  res.cookies.set(`oauth_state_${provider}`, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
