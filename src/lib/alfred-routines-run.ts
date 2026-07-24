import { listRoutines, updateRoutine, isDue, type Routine } from "@/lib/alfred-routines";
import { draftArticle, draftSocialPost, draftNewsletter } from "@/lib/comms-agent";
import { addItem } from "@/lib/editorial";
import { addPost } from "@/lib/social-posts";
import { addCampaign } from "@/lib/newsletter-campaigns";
import { sendTelegram } from "@/lib/notify";

// Exécution des routines d'Alfred. Tout part en BROUILLON : rien n'est publié
// sans validation humaine.

export async function runRoutine(r: Routine): Promise<string> {
  if (r.type === "article") {
    const a = await draftArticle(r.topic);
    addItem({
      date: new Date().toISOString().slice(0, 10),
      type: "article",
      title: a.title,
      status: "brouillon",
      category: a.category,
      excerpt: a.excerpt,
      body: a.body,
    });
    return `Brouillon d'article créé : « ${a.title} »`;
  }
  if (r.type === "newsletter") {
    const n = await draftNewsletter(r.topic);
    addCampaign(n.subject, n.body);
    return `Brouillon de newsletter créé : « ${n.subject} »`;
  }
  const { content } = await draftSocialPost(r.topic, r.type);
  addPost({ network: r.type, content, status: "brouillon" });
  return `Brouillon de post ${r.type === "linkedin" ? "LinkedIn" : "Instagram"} créé`;
}

// Lance toutes les routines dues. Conçu pour être appelé de manière
// opportuniste (visite du cockpit) — chaque routine ne tourne qu'une fois
// par jour au maximum, et les erreurs n'interrompent pas les autres.
export async function runDueRoutines(): Promise<void> {
  const due = listRoutines().filter((r) => isDue(r));
  for (const r of due) {
    // Marque immédiatement pour éviter une double exécution en parallèle.
    updateRoutine(r.id, { lastRun: new Date().toISOString(), lastResult: "En cours…" });
    try {
      const result = await runRoutine(r);
      updateRoutine(r.id, { lastResult: result });
      sendTelegram(`🤖 Routine « ${r.label} » : ${result}. À valider dans le cockpit.`).catch(() => {});
    } catch (e) {
      updateRoutine(r.id, { lastResult: `Échec : ${(e as Error).message.slice(0, 160)}` });
    }
  }
}
