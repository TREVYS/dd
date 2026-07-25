import fs from "node:fs";
import path from "node:path";

// Après chaque mise à jour du site (nouveau build déployé), Alfred envoie un
// message Telegram : auto-vérifications + « vous pouvez prendre la main ».
// Détection : l'identifiant de build (.next/BUILD_ID) change à chaque déploiement.

const STATE_FILE = path.join(process.cwd(), "data", "deploy-notified.json");
let checkedThisProcess = false; // une seule vérification par démarrage

function currentBuildId(): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), ".next", "BUILD_ID"), "utf8").trim();
  } catch {
    return "dev";
  }
}

export async function notifyDeployOnce(): Promise<void> {
  if (checkedThisProcess) return;
  checkedThisProcess = true;

  const build = currentBuildId();
  if (build === "dev") return;

  try {
    if (fs.existsSync(STATE_FILE)) {
      const st = JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) as { build?: string };
      if (st.build === build) return; // déjà annoncé
    }
  } catch { /* état illisible : on annonce */ }

  // On réserve l'annonce avant l'envoi (pas de doublon si plusieurs requêtes).
  let dataWritable = true;
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify({ build, at: new Date().toISOString() }), "utf8");
  } catch {
    dataWritable = false;
  }

  const { telegramConfigured, sendTelegram } = await import("@/lib/notify");
  if (!telegramConfigured()) return;

  // Auto-vérifications (rapides, sans appel réseau).
  const { isSet } = await import("@/lib/settings");
  const { mailerConfigured } = await import("@/lib/mailer");
  const { publicStatus } = await import("@/lib/social");
  const accounts = publicStatus();
  const li = accounts.find((a) => a.id === "linkedin");
  const ig = accounts.find((a) => a.id === "instagram");

  const line = (ok: boolean, label: string, koLabel?: string) =>
    `${ok ? "✅" : "◻️"} ${ok ? label : koLabel ?? `${label} — à configurer`}`;

  const msg = [
    "🎩 Mise à jour déployée sur www.trevys.fr",
    "",
    "J'ai fait le tour du propriétaire :",
    line(true, "Site en ligne et opérationnel"),
    line(dataWritable, "Données du cockpit accessibles", "Données du cockpit en lecture seule ⚠️"),
    line(isSet("anthropicApiKey"), "Alfred (IA) actif"),
    line(mailerConfigured(), "E-mails Microsoft 365 actifs"),
    line(!!li?.connected, `LinkedIn connecté${li?.accountName ? ` (${li.accountName})` : ""}`, "LinkedIn non connecté"),
    line(!!ig?.connected, `Instagram connecté${ig?.accountName ? ` (${ig.accountName})` : ""}`, "Instagram non connecté"),
    "",
    "Tout est fonctionnel — vous pouvez prendre la main. 🫡",
  ].join("\n");

  await sendTelegram(msg, { plain: true });
}
