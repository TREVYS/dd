import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { appSecret } from "@/lib/app-secret";
import { SITE_URL } from "@/lib/site";
import { wrapEmail } from "@/lib/newsletter-campaigns";

// Campagne d'opt-in : on invite une base de contacts (rencontrés par les
// équipes) à choisir OUI/NON pour recevoir les analyses du cabinet.
// Les OUI rejoignent la base d'envoi ; les NON sont mémorisés et jamais
// réinvités. Liens signés : personne ne peut inscrire quelqu'un d'autre.

const FILE = path.join(process.cwd(), "data", "newsletter-optin.json");

type Store = { invited: Record<string, string>; declined: Record<string, string> };

function read(): Store {
  try {
    if (!fs.existsSync(FILE)) return { invited: {}, declined: {} };
    return { invited: {}, declined: {}, ...JSON.parse(fs.readFileSync(FILE, "utf8")) };
  } catch {
    return { invited: {}, declined: {} };
  }
}

function write(s: Store) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(s, null, 2), "utf8");
}

export function optinToken(email: string): string {
  return crypto.createHmac("sha256", appSecret()).update(`optin:${email.toLowerCase()}`).digest("hex").slice(0, 16);
}

export function optinUrl(email: string, answer: "oui" | "non"): string {
  const e = Buffer.from(email.toLowerCase()).toString("base64url");
  return `${SITE_URL}/api/nl/optin?e=${e}&t=${optinToken(email)}&a=${answer}`;
}

export function markInvited(email: string) {
  const s = read();
  s.invited[email.toLowerCase()] = new Date().toISOString();
  write(s);
}

export function markDeclined(email: string) {
  const s = read();
  s.declined[email.toLowerCase()] = new Date().toISOString();
  write(s);
}

export function isDeclined(email: string): boolean {
  return !!read().declined[email.toLowerCase()];
}

export function isInvited(email: string): boolean {
  return !!read().invited[email.toLowerCase()];
}

export function optinStats(): { invited: number; declined: number } {
  const s = read();
  return { invited: Object.keys(s.invited).length, declined: Object.keys(s.declined).length };
}

// L'e-mail d'invitation — chaleureux, avec une pointe d'humour.
export const OPTIN_SUBJECT = "On garde le lien ? (promis, pas de spam)";

export function buildOptinEmail(email: string): string {
  const font = "font-family:Arial,Helvetica,sans-serif;";
  const body = `
    <p style="margin:0 0 14px;">Bonjour,</p>
    <p style="margin:0 0 14px;">
      Si vous recevez ce message, c'est que nos chemins se sont croisés — une mission,
      un échange, une conférence, ou un excellent café. Et chez Trevys, on n'aime pas
      perdre le contact avec les gens qu'on apprécie.
    </p>
    <p style="margin:0 0 14px;">
      Une à deux fois par mois, nous partageons nos <b>analyses</b> : fiscalité,
      facturation électronique, IA appliquée à la finance… Du concret, du court,
      du décrypté — et <b>zéro spam</b> (votre boîte mail est déjà bien assez
      remplie, on le sait).
    </p>
    <p style="margin:0 0 22px;">
      La décision vous appartient, en un clic :
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 10px;">
      <tr>
        <td align="center" bgcolor="#F5811F" style="border-radius:100px;">
          <a href="${optinUrl(email, "oui")}" style="display:inline-block;padding:13px 30px;${font}font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:100px;">
            Oui, je veux recevoir vos analyses
          </a>
        </td>
        <td style="width:14px;font-size:0;">&nbsp;</td>
        <td align="center" bgcolor="#eee6d8" style="border-radius:100px;">
          <a href="${optinUrl(email, "non")}" style="display:inline-block;padding:13px 26px;${font}font-size:15px;font-weight:bold;color:#6b5f4c;text-decoration:none;border-radius:100px;">
            Non merci
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:16px 0 0;font-size:13px;color:#9d907c;text-align:center;">
      Sans réponse de votre part, nous ne vous écrirons plus — c'est notre façon
      de rester élégants. 🤝
    </p>`;
  return wrapEmail(body);
}
