import { getSetting } from "@/lib/settings";

// Envoi d'e-mails via Microsoft 365 (Office 365) avec Microsoft Graph.
// Authentification « client credentials » (application Entra ID / Azure AD)
// avec la permission applicative Mail.Send. Les mails partent de l'adresse
// du cabinet (contact@trevys-advisory.fr) sans mot de passe SMTP.

export function mailerConfigured(): boolean {
  // L'adresse d'envoi a une valeur par défaut (senderAddress) : seuls le
  // tenant, le client et le secret sont indispensables.
  return (
    !!getSetting("msTenantId") &&
    !!getSetting("msClientId") &&
    !!getSetting("msClientSecret")
  );
}

export function senderAddress(): string {
  return getSetting("msSender") || "contact@trevys-advisory.fr";
}

let cachedToken: { value: string; exp: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now() + 60_000) return cachedToken.value;

  const tenant = getSetting("msTenantId");
  const clientId = getSetting("msClientId");
  const clientSecret = getSetting("msClientSecret");
  if (!tenant || !clientId || !clientSecret) {
    throw new Error("Microsoft 365 non configuré (tenant / client / secret manquants).");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
    scope: "https://graph.microsoft.com/.default",
  });

  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Échec de l'authentification Microsoft 365 (${res.status}). ${txt.slice(0, 300)}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, exp: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

export type MailAttachment = {
  name: string;
  contentType: string;
  contentBase64: string; // contenu encodé en base64
};

export type MailInput = {
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: MailAttachment[];
  // true (défaut) : destinataires en Cci (campagnes de masse — ils ne se
  // voient pas). false : destinataire nominal en « À » (e-mails
  // transactionnels : refus, invitation, confirmation — meilleur rendu et
  // meilleure délivrabilité).
  bcc?: boolean;
};

// Envoie un e-mail via Graph depuis l'adresse du cabinet.
// Les destinataires sont mis en Cci (bcc) pour un envoi de masse discret.
export async function sendMail({ to, subject, html, replyTo, attachments, bcc = true }: MailInput): Promise<void> {
  const token = await getToken();
  const sender = senderAddress();

  const recipients = to.map((address) => ({ emailAddress: { address } }));
  const message: Record<string, unknown> = bcc
    ? {
        subject,
        body: { contentType: "HTML", content: html },
        // Masse : cabinet en « À », destinataires en Cci.
        toRecipients: [{ emailAddress: { address: sender } }],
        bccRecipients: recipients,
      }
    : {
        subject,
        body: { contentType: "HTML", content: html },
        // Transactionnel : le destinataire est le vrai « À ».
        toRecipients: recipients,
      };
  if (replyTo) message.replyTo = [{ emailAddress: { address: replyTo } }];
  if (attachments?.length) {
    message.attachments = attachments.map((a) => ({
      "@odata.type": "#microsoft.graph.fileAttachment",
      name: a.name,
      contentType: a.contentType,
      contentBytes: a.contentBase64,
    }));
  }

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ message, saveToSentItems: true }),
    },
  );
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Échec de l'envoi Microsoft 365 (${res.status}). ${txt.slice(0, 300)}`);
  }
}

// Envoi d'une campagne à une liste, par lots (Graph limite le nombre de
// destinataires par message). Renvoie le nombre d'e-mails traités.
export async function sendCampaign(
  recipients: string[],
  subject: string,
  html: string,
  replyTo?: string,
  batchSize = 400,
): Promise<number> {
  let sent = 0;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    await sendMail({ to: batch, subject, html, replyTo });
    sent += batch.length;
  }
  return sent;
}

// Envoi personnalisé : un e-mail par destinataire, avec un HTML propre à
// chacun (lien de désinscription individuel). Les erreurs isolées ne stoppent
// pas la campagne. Renvoie le nombre d'envois réussis.
export async function sendPersonalized(
  recipients: string[],
  subject: string,
  htmlFor: (email: string) => string,
  replyTo?: string,
): Promise<number> {
  let sent = 0;
  for (const email of recipients) {
    try {
      await sendMail({ to: [email], subject, html: htmlFor(email), replyTo });
      sent += 1;
    } catch (e) {
      console.error(`[mailer] échec pour ${email}:`, (e as Error).message);
    }
  }
  return sent;
}
