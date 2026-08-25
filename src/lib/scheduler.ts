import { parisToday } from "@/lib/dates";
// Planificateur des publications programmées. Déclenché de manière
// opportuniste (trafic du site via /api/track, ouverture du cockpit) :
// - posts réseaux « planifiés » dont la date est arrivée → publication réelle ;
// - brouillons d'articles planifiés datés → publication sur le blog ;
// - mailings programmés → envoi (cadencé anti-spam).
// Chaque succès/échec est notifié sur Telegram.

let running = false;

function today(): string {
  return parisToday();
}

export async function runScheduledPublications(): Promise<void> {
  if (running) return;
  running = true;
  try {
    const d = today();
    const { parisTimeHM } = await import("@/lib/dates");
    const hm = parisTimeHM();
    const { sendTelegram } = await import("@/lib/notify");

    // 1) Posts réseaux planifiés — à l'heure de Paris près : un post du jour
    // n'est publié qu'une fois son heure passée (pas d'heure = dès le matin).
    try {
      const { listPosts, updatePost } = await import("@/lib/social-posts");
      const due = listPosts().filter(
        (p) =>
          p.status === "planifie" &&
          p.scheduledDate &&
          (p.scheduledDate < d || (p.scheduledDate === d && (!p.scheduledTime || p.scheduledTime <= hm))) &&
          p.lastTry !== d,
      );
      for (const p of due) {
        // On « réclame » la tentative du jour avant d'agir (pas de doublon).
        updatePost(p.id, { lastTry: d });
        const { publishPost, readSocial } = await import("@/lib/social");

        // Relais Instagram manuel : compte non connecté → le post part sur
        // Telegram (visuel + légende) pour une publication à la main.
        if (p.network === "instagram" && !readSocial().instagram.connected) {
          const { sendTelegramPhoto } = await import("@/lib/notify");
          const caption = `📸 À publier sur Instagram maintenant :\n\n${p.content}`;
          const sent = p.image
            ? await sendTelegramPhoto(p.image, caption.slice(0, 1000))
            : await sendTelegram(caption, { plain: true });
          if (sent) {
            updatePost(p.id, { status: "publie", publishedAt: new Date().toISOString(), deliveredVia: "telegram" });
            await sendTelegram(
              "☝️ Instagram n'est pas connecté : copiez la légende ci-dessus, enregistrez l'image et publiez depuis l'app Instagram. (Connectez Instagram dans Réglages pour l'automatiser.)",
              { plain: true },
            ).catch(() => {});
          } else {
            await sendTelegram(`⚠️ Post Instagram planifié non transmis (Telegram indisponible) — il reste planifié.`, { plain: true }).catch(() => {});
          }
          continue;
        }

        const res = await publishPost(p.network, p.content, p.image, { target: p.liTarget });
        if (res.ok) {
          updatePost(p.id, { status: "publie", publishedAt: new Date().toISOString() });
          await sendTelegram(
            `📣 Post ${p.network === "linkedin" ? (p.liTarget === "page" ? "LinkedIn (Page entreprise)" : "LinkedIn") : "Instagram"} planifié publié :\n« ${p.content.slice(0, 120)}… »`,
            { plain: true },
          ).catch(() => {});
        } else {
          await sendTelegram(
            `⚠️ Publication planifiée impossible (${p.network}) : ${res.error ?? "erreur inconnue"}\nLe post reste dans Brouillons → Réseaux sociaux — nouvelle tentative demain.`,
            { plain: true },
          ).catch(() => {});
        }
      }
    } catch (e) {
      console.error("[scheduler] posts:", e);
    }

    // 2) Brouillons d'articles planifiés (avec contenu) dont la date est passée.
    try {
      const { listItems, removeItem } = await import("@/lib/editorial");
      const { saveArticle } = await import("@/lib/content-admin");
      const due = listItems().filter(
        (i) => i.type === "article" && i.status === "planifie" && i.date && i.date <= d && i.body,
      );
      for (const it of due) {
        const slug = saveArticle({
          title: it.title,
          date: d,
          category: it.category || "Article",
          excerpt: it.excerpt || "",
          image: it.image || "",
          body: it.body!,
        });
        removeItem(it.id);
        await sendTelegram(
          `📰 Article planifié publié sur le site : « ${it.title} »\nhttps://www.trevys.fr/blog/${slug}`,
          { plain: true },
        ).catch(() => {});
      }
    } catch (e) {
      console.error("[scheduler] articles:", e);
    }

    // 3) Mailings programmés (envoi à tous les abonnés).
    try {
      const { listCampaigns, updateCampaign, markdownToEmailHtml, wrapEmail, unsubscribeUrl } = await import("@/lib/newsletter-campaigns");
      const { mailerConfigured, sendPersonalized } = await import("@/lib/mailer");
      const due = listCampaigns().filter((c) => c.status === "brouillon" && c.sendAt && c.sendAt <= d);
      for (const camp of due) {
        // Réclamation : on retire la programmation avant d'envoyer (pas de double envoi).
        updateCampaign(camp.id, { sendAt: undefined });

        // Garde-fou anti-sur-sollicitation : un mailing est déjà parti il y a
        // moins de 15 jours → on RETIENT l'envoi programmé (contrôle humain).
        const { lastSentInfo, SEND_COOLDOWN_DAYS } = await import("@/lib/newsletter-campaigns");
        const last = lastSentInfo(camp.id);
        if (last && last.days < SEND_COOLDOWN_DAYS) {
          await sendTelegram(
            `✋ Mailing programmé « ${camp.subject} » RETENU : vous avez déjà écrit à votre communauté il y a ${last.days} jour(s) (« ${last.subject} »).\n` +
            `Rien n'est parti — pour l'envoyer malgré tout, ouvrez le mailing dans le cockpit et cliquez « Envoyer » (une confirmation vous sera demandée), ou dites-moi « envoie-le quand même ».`,
            { plain: true },
          ).catch(() => {});
          continue;
        }
        if (!mailerConfigured()) {
          await sendTelegram(`⚠️ Mailing programmé « ${camp.subject} » non envoyé : Microsoft 365 non configuré.`, { plain: true }).catch(() => {});
          continue;
        }
        const { listSubscribers } = await import("@/lib/newsletter");
        const { resolveTargetRecipients } = await import("@/lib/newsletter-campaigns");
        // Ciblage mémorisé à la programmation (filtres, exclusions, ajouts) ;
        // sans ciblage : tous les abonnés.
        const recipients = resolveTargetRecipients(camp.target, listSubscribers());
        if (recipients.length === 0) {
          await sendTelegram(`⚠️ Mailing programmé « ${camp.subject} » non envoyé : aucun destinataire dans le ciblage.`, { plain: true }).catch(() => {});
          continue;
        }
        const { openPixelUrl, trackLinks } = await import("@/lib/newsletter-stats");
        const bodyHtml = markdownToEmailHtml(camp.body);
        try {
          const count = await sendPersonalized(recipients, camp.subject, (email) =>
            trackLinks(wrapEmail(bodyHtml, unsubscribeUrl(email)), camp.id, email) +
            `<img src="${openPixelUrl(camp.id, email)}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`,
          );
          updateCampaign(camp.id, { status: "envoye", sentAt: new Date().toISOString(), sentCount: count });
          await sendTelegram(`💌 Mailing programmé envoyé : « ${camp.subject} » → ${count} contact(s). Analyse dans le cockpit.`, { plain: true }).catch(() => {});
        } catch (e) {
          await sendTelegram(`⚠️ Échec de l'envoi du mailing programmé « ${camp.subject} » — il reste en brouillon (reprogrammez-le).`, { plain: true }).catch(() => {});
          console.error("[scheduler] mailing:", e);
        }
      }
    } catch (e) {
      console.error("[scheduler] mailings:", e);
    }
  } finally {
    running = false;
  }
}
