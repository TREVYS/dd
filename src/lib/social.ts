import fs from "node:fs";
import { getSetting, type SettingKey } from "@/lib/settings";
import path from "node:path";

// Connexions réseaux sociaux du cabinet. Stockées dans data/social.json
// (sur le disque de l'instance). Les jetons ne sont jamais exposés au client.
const FILE = path.join(process.cwd(), "data", "social.json");

export type Provider = "linkedin" | "instagram";

export type Connection = {
  connected: boolean;
  accountName?: string;
  connectedAt?: string;
  // jeton d'accès conservé côté serveur uniquement
  accessToken?: string;
  expiresAt?: number;
  // URN LinkedIn de l'auteur (urn:li:person:… ou urn:li:organization:…)
  authorUrn?: string;
};

export type SocialStore = Record<Provider, Connection>;

export const PROVIDERS: {
  id: Provider;
  label: string;
  authorizeUrl: string;
  tokenUrl: string;
  scope: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  docUrl: string;
}[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scope: "openid profile w_member_social",
    clientIdEnv: "LINKEDIN_CLIENT_ID",
    clientSecretEnv: "LINKEDIN_CLIENT_SECRET",
    docUrl: "https://www.linkedin.com/developers/apps",
  },
  {
    id: "instagram",
    label: "Instagram",
    authorizeUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    scope: "instagram_basic,instagram_content_publish,pages_show_list",
    clientIdEnv: "INSTAGRAM_CLIENT_ID",
    clientSecretEnv: "INSTAGRAM_CLIENT_SECRET",
    docUrl: "https://developers.facebook.com/apps",
  },
];

function empty(): SocialStore {
  return {
    linkedin: { connected: false },
    instagram: { connected: false },
  };
}

export function readSocial(): SocialStore {
  try {
    if (!fs.existsSync(FILE)) return empty();
    return { ...empty(), ...JSON.parse(fs.readFileSync(FILE, "utf8")) };
  } catch {
    return empty();
  }
}

export function writeSocial(store: SocialStore) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(store, null, 2), "utf8");
}

export function setConnection(provider: Provider, conn: Connection) {
  const store = readSocial();
  store[provider] = conn;
  writeSocial(store);
}

export function disconnect(provider: Provider) {
  setConnection(provider, { connected: false });
}

// Renvoie true si les identifiants développeur du fournisseur sont configurés.
export function isConfigured(provider: Provider): boolean {
  const p = PROVIDERS.find((x) => x.id === provider);
  if (!p) return false;
  const idKey = (provider + "ClientId") as SettingKey;
  const secretKey = (provider + "ClientSecret") as SettingKey;
  return !!(getSetting(idKey) && getSetting(secretKey));
}

// Publie un post sur un réseau. Renvoie {ok, error?}. Tant que le compte n'est
// pas connecté (pas de jeton), renvoie ok:false avec un motif — le post reste
// alors en brouillon/planifié côté cockpit. `image` (URL /uploads/… ou http)
// est obligatoire pour Instagram, optionnelle ailleurs.
export async function publishPost(
  provider: Provider,
  content: string,
  image?: string,
): Promise<{ ok: boolean; error?: string }> {
  const store = readSocial();
  const conn = store[provider];
  if (!conn?.connected || !conn.accessToken) {
    return { ok: false, error: "Compte non connecté" };
  }
  if (conn.expiresAt && Date.now() > conn.expiresAt) {
    return { ok: false, error: "Jeton expiré — cliquez « Reconnecter » dans Réglages → Réseaux sociaux" };
  }
  try {
    if (provider === "linkedin") {
      // Nécessite le scope w_member_social et l'URN de l'auteur (sub OpenID),
      // enregistré à la connexion du compte.
      const author = conn.authorUrn;
      if (!author) {
        return { ok: false, error: "Compte à reconnecter (identifiant d'auteur manquant) — Réglages → Réseaux sociaux" };
      }

      // Image jointe (optionnelle) : LinkedIn impose un enregistrement
      // d'upload, l'envoi du binaire, puis la publication avec l'asset.
      let assetUrn: string | undefined;
      if (image) {
        try {
          let bytes: Buffer | undefined;
          if (image.startsWith("/uploads/")) {
            const local = path.join(process.cwd(), "public", "uploads", path.basename(image));
            if (fs.existsSync(local)) bytes = fs.readFileSync(local);
          }
          if (!bytes && /^https?:\/\//.test(image)) {
            const r = await fetch(image);
            if (r.ok) bytes = Buffer.from(await r.arrayBuffer());
          }
          if (bytes) {
            const regRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${conn.accessToken}`,
                "Content-Type": "application/json",
                "X-Restli-Protocol-Version": "2.0.0",
              },
              body: JSON.stringify({
                registerUploadRequest: {
                  recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
                  owner: author,
                  serviceRelationships: [
                    { relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" },
                  ],
                },
              }),
            });
            const reg = (await regRes.json()) as {
              value?: {
                asset?: string;
                uploadMechanism?: Record<string, { uploadUrl?: string }>;
              };
            };
            const uploadUrl = reg.value?.uploadMechanism?.[
              "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
            ]?.uploadUrl;
            if (uploadUrl && reg.value?.asset) {
              const up = await fetch(uploadUrl, {
                method: "POST",
                headers: { Authorization: `Bearer ${conn.accessToken}` },
                body: new Uint8Array(bytes),
              });
              if (up.ok) assetUrn = reg.value.asset;
            }
          }
        } catch (e) {
          // Image impossible à joindre : on publie le texte seul plutôt que d'échouer.
          console.error("[social] image LinkedIn non jointe:", e);
        }
      }

      const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${conn.accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: content },
              shareMediaCategory: assetUrn ? "IMAGE" : "NONE",
              ...(assetUrn ? { media: [{ status: "READY", media: assetUrn }] } : {}),
            },
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        }),
      });
      if (!res.ok) {
        const detail = (await res.text().catch(() => "")).slice(0, 200);
        return { ok: false, error: `LinkedIn ${res.status}${detail ? ` — ${detail}` : ""}` };
      }
      return { ok: true };
    }
    // Instagram : publication d'une image + légende via la Graph API, en deux
    // temps (création d'un conteneur média, puis publication).
    const igId = conn.authorUrn;
    if (!igId) {
      return { ok: false, error: "Compte Instagram à reconnecter (identifiant manquant) — Réglages → Réseaux sociaux" };
    }
    if (!image) {
      return { ok: false, error: "Instagram exige une image : ajoutez une image au post (médiathèque) puis republiez." };
    }
    const { SITE_URL } = await import("@/lib/site");
    const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;

    const createRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        image_url: imageUrl,
        caption: content.slice(0, 2200),
        access_token: conn.accessToken,
      }),
    });
    const created = (await createRes.json()) as { id?: string; error?: { message?: string } };
    if (!created.id) {
      return { ok: false, error: `Instagram (préparation) — ${created.error?.message ?? `HTTP ${createRes.status}`}` };
    }

    const pubRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ creation_id: created.id, access_token: conn.accessToken }),
    });
    const pub = (await pubRes.json()) as { id?: string; error?: { message?: string } };
    if (!pub.id) {
      return { ok: false, error: `Instagram (publication) — ${pub.error?.message ?? `HTTP ${pubRes.status}`}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// Statut public (sans jeton) pour l'affichage.
export function publicStatus() {
  const store = readSocial();
  return PROVIDERS.map((p) => ({
    id: p.id,
    label: p.label,
    docUrl: p.docUrl,
    configured: isConfigured(p.id),
    connected: store[p.id]?.connected ?? false,
    accountName: store[p.id]?.accountName ?? "",
    connectedAt: store[p.id]?.connectedAt ?? "",
  }));
}
