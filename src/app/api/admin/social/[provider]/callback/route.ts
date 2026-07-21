import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SITE_URL } from "@/lib/site";
import { PROVIDERS, setConnection, type Provider } from "@/lib/social";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const session = await auth();
  if (!session?.user) return NextResponse.redirect(`${SITE_URL}/login`);

  const { provider } = await params;
  const cfg = PROVIDERS.find((p) => p.id === provider);
  if (!cfg) return NextResponse.redirect(`${SITE_URL}/admin/reglages`);

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // Vérification CSRF via le cookie posé au démarrage.
  const cookie = req.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`oauth_state_${provider}=`))
    ?.split("=")[1];

  if (!code || !state || !cookie || state !== cookie) {
    return NextResponse.redirect(`${SITE_URL}/admin/reglages?error=oauth`);
  }

  try {
    const redirectUri = `${SITE_URL}/api/admin/social/${provider}/callback`;
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env[cfg.clientIdEnv] as string,
      client_secret: process.env[cfg.clientSecretEnv] as string,
    });
    const tokenRes = await fetch(cfg.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await tokenRes.json()) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!data.access_token) throw new Error("no token");

    setConnection(provider as Provider, {
      connected: true,
      accountName: cfg.label,
      connectedAt: new Date().toISOString(),
      accessToken: data.access_token,
      expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
    });
  } catch {
    return NextResponse.redirect(`${SITE_URL}/admin/reglages?error=oauth`);
  }

  const res = NextResponse.redirect(`${SITE_URL}/admin/reglages?connected=${provider}`);
  res.cookies.delete(`oauth_state_${provider}`);
  return res;
}
