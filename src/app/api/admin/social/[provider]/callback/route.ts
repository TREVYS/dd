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
    let accessToken = data.access_token;
    let expiresAt = data.expires_in ? Date.now() + data.expires_in * 1000 : undefined;

    if (provider === "linkedin") {
      const infoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (infoRes.ok) {
        const info = (await infoRes.json()) as { sub?: string; name?: string };
        if (info.sub) authorUrn = `urn:li:person:${info.sub}`;
        if (info.name) accountName = info.name;
      }
    }

    if (provider === "instagram") {
      // 1) Jeton court → jeton longue durée (~60 jours).
      const clientId = getSetting("instagramClientId") as string;
      const clientSecret = getSetting("instagramClientSecret") as string;
      const llRes = await fetch(
        `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&fb_exchange_token=${encodeURIComponent(accessToken)}`,
      );
      const ll = (await llRes.json()) as { access_token?: string; expires_in?: number };
      if (ll.access_token) {
        accessToken = ll.access_token;
        expiresAt = Date.now() + (ll.expires_in ?? 60 * 24 * 3600) * 1000;
      }
      // 2) Retrouve le compte Instagram professionnel relié à une Page Facebook.
      const pagesRes = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?fields=name,instagram_business_account{id,username}&access_token=${encodeURIComponent(accessToken)}`,
      );
      const pages = (await pagesRes.json()) as {
        data?: { name?: string; instagram_business_account?: { id: string; username?: string } }[];
      };
      const withIg = pages.data?.find((p) => p.instagram_business_account?.id);
      if (!withIg?.instagram_business_account) {
        // Pas de compte IG pro relié : on n'enregistre pas une connexion inutilisable.
        return NextResponse.redirect(`${SITE_URL}/admin/reglages?error=noinsta`);
      }
      authorUrn = withIg.instagram_business_account.id;
      accountName = withIg.instagram_business_account.username
        ? `@${withIg.instagram_business_account.username}`
        : withIg.name ?? cfg.label;
    }

    setConnection(provider as Provider, {
      connected: true,
      accountName,
      authorUrn,
      connectedAt: new Date().toISOString(),
      accessToken,
      expiresAt,
    });
  } catch {
    return NextResponse.redirect(`${SITE_URL}/admin/reglages?error=oauth`);
  }

  const res = NextResponse.redirect(`${SITE_URL}/admin/reglages?connected=${provider}`);
  res.cookies.delete(`oauth_state_${provider}`);
  return res;
}
