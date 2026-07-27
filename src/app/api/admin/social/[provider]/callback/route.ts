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

  // Refus ou erreur renvoyée par la plateforme (Meta/LinkedIn) : on la montre
  // telle quelle dans Réglages plutôt qu'un message générique.
  const platformError = url.searchParams.get("error_description") || url.searchParams.get("error_reason") || url.searchParams.get("error");
  if (platformError) {
    return NextResponse.redirect(`${SITE_URL}/admin/reglages?error=oauth&why=${encodeURIComponent(platformError.slice(0, 300))}`);
  }

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
      error?: { message?: string } | string;
      error_description?: string;
    };
    if (!data.access_token) {
      const why =
        (typeof data.error === "object" ? data.error?.message : data.error) ||
        data.error_description ||
        `échange de jeton refusé (HTTP ${tokenRes.status})`;
      throw new Error(why);
    }

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
        error?: { message?: string };
      };
      if (pages.error?.message) throw new Error(`Meta : ${pages.error.message}`);
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
  } catch (e) {
    const why = encodeURIComponent(String((e as Error).message ?? "").slice(0, 300));
    return NextResponse.redirect(`${SITE_URL}/admin/reglages?error=oauth&why=${why}`);
  }

  const res = NextResponse.redirect(`${SITE_URL}/admin/reglages?connected=${provider}`);
  res.cookies.delete(`oauth_state_${provider}`);
  return res;
}
