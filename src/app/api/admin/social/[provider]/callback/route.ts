import { getSetting, type SettingKey } from "@/lib/settings";
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
      client_id: getSetting(`${provider}ClientId` as SettingKey) as string,
      client_secret: getSetting(`${provider}ClientSecret` as SettingKey) as string,
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

    // LinkedIn : on récupère l'identité réelle (OpenID userinfo) pour
    // construire l'URN de l'auteur — indispensable pour publier ensuite.
    let accountName = cfg.label;
    let authorUrn: string | undefined;
    if (provider === "linkedin") {
      const infoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      if (infoRes.ok) {
        const info = (await infoRes.json()) as { sub?: string; name?: string };
        if (info.sub) authorUrn = `urn:li:person:${info.sub}`;
        if (info.name) accountName = info.name;
      }
    }

    setConnection(provider as Provider, {
      connected: true,
      accountName,
      authorUrn,
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
