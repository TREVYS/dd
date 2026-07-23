import fs from "node:fs";
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
  return !!(process.env[p.clientIdEnv] && process.env[p.clientSecretEnv]);
}

// Publie un post sur un réseau. Renvoie {ok, error?}. Tant que le compte n'est
// pas connecté (pas de jeton), renvoie ok:false avec un motif — le post reste
// alors en brouillon/planifié côté cockpit.
export async function publishPost(
  provider: Provider,
  content: string,
): Promise<{ ok: boolean; error?: string }> {
  const store = readSocial();
  const conn = store[provider];
  if (!conn?.connected || !conn.accessToken) {
    return { ok: false, error: "Compte non connecté" };
  }
  try {
    if (provider === "linkedin") {
      // Nécessite le scope w_member_social et l'URN de l'auteur (sub OpenID).
      const author = conn.accountName?.startsWith("urn:")
        ? conn.accountName
        : `urn:li:person:${conn.accountName ?? ""}`;
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
              shareMediaCategory: "NONE",
            },
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        }),
      });
      if (!res.ok) return { ok: false, error: `LinkedIn ${res.status}` };
      return { ok: true };
    }
    // Instagram : publication via Graph API (à finaliser après connexion Meta).
    return { ok: false, error: "Publication Instagram à finaliser après connexion" };
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
