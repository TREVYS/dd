import fs from "node:fs";
import path from "node:path";

// Réglages configurables depuis le cockpit (clés API, connexions).
// Stockés sur le disque de l'instance : data/settings.json (jamais versionné).
// Les valeurs saisies dans le cockpit priment sur les variables d'environnement.
const FILE = path.join(process.cwd(), "data", "settings.json");

export type SettingKey =
  | "anthropicApiKey"
  | "telegramBotToken"
  | "telegramChatId"
  | "brevoApiKey"
  | "brevoListId"
  | "calendlyUrl"
  | "linkedinClientId"
  | "linkedinClientSecret"
  | "instagramClientId"
  | "instagramClientSecret"
  | "msTenantId"
  | "msClientId"
  | "msClientSecret"
  | "msSender"
  | "recruitEmail";

// Correspondance avec les variables d'environnement (repli).
const ENV: Record<SettingKey, string> = {
  anthropicApiKey: "ANTHROPIC_API_KEY",
  telegramBotToken: "TELEGRAM_BOT_TOKEN",
  telegramChatId: "TELEGRAM_CHAT_ID",
  brevoApiKey: "BREVO_API_KEY",
  brevoListId: "BREVO_LIST_ID",
  calendlyUrl: "NEXT_PUBLIC_CALENDLY_URL",
  linkedinClientId: "LINKEDIN_CLIENT_ID",
  linkedinClientSecret: "LINKEDIN_CLIENT_SECRET",
  instagramClientId: "INSTAGRAM_CLIENT_ID",
  instagramClientSecret: "INSTAGRAM_CLIENT_SECRET",
  msTenantId: "MS_TENANT_ID",
  msClientId: "MS_CLIENT_ID",
  msClientSecret: "MS_CLIENT_SECRET",
  msSender: "MS_SENDER",
  recruitEmail: "RECRUIT_EMAIL",
};

// Champs sensibles (masqués à l'affichage).
export const SECRET_KEYS: SettingKey[] = [
  "anthropicApiKey",
  "telegramBotToken",
  "brevoApiKey",
  "linkedinClientSecret",
  "instagramClientSecret",
  "msClientSecret",
];

type Store = Partial<Record<SettingKey, string>>;

export function readSettings(): Store {
  try {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return {};
  }
}

export function writeSettings(patch: Store) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const next = { ...readSettings(), ...patch };
  // Retire les valeurs vides.
  for (const k of Object.keys(next) as SettingKey[]) {
    if (!next[k]) delete next[k];
  }
  fs.writeFileSync(FILE, JSON.stringify(next, null, 2), "utf8");
}

// Valeur effective : réglage saisi, sinon variable d'environnement.
export function getSetting(key: SettingKey): string | undefined {
  const stored = readSettings()[key];
  if (stored && stored.trim()) return stored.trim();
  const env = process.env[ENV[key]];
  return env && env.trim() ? env.trim() : undefined;
}

export function isSet(key: SettingKey): boolean {
  return !!getSetting(key);
}

// Statut public pour l'affichage (jamais la valeur des secrets).
export function settingsStatus() {
  return (Object.keys(ENV) as SettingKey[]).map((k) => {
    const val = getSetting(k);
    const secret = SECRET_KEYS.includes(k);
    return {
      key: k,
      set: !!val,
      // valeur affichée : masquée si secret, sinon la vraie valeur
      display: !val ? "" : secret ? "•••••• (défini)" : val,
    };
  });
}
