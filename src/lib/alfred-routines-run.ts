import { listRoutines, updateRoutine, isDue, inferRoutineType, type Routine } from "@/lib/alfred-routines";
import { draftArticle, draftSocialPost, draftNewsletter } from "@/lib/comms-agent";
import { addItem } from "@/lib/editorial";
import { addPost } from "@/lib/social-posts";
import { addCampaign } from "@/lib/newsletter-campaigns";
import { sendTelegram } from "@/lib/notify";

// Exécution des routines d'Alfred. Tout part en BROUILLON : rien n'est publié
// sans validation humaine.

export async function runRoutine(r: Routine): Promise<string> {
  // Filet de sécurité : une routine « LinkedIn » créée par erreur avec le type
  // « article » produit bien des posts LinkedIn — et on répare son type.
  const effective = inferRoutineType(r.label, r.topic, r.type);
  if (effective !== r.type) {
    updateRoutine(r.id, { type: effective });
    r = { ...r, type: effective };
  }
  if (r.type === "article") {
    const a = await draftArticle(r.topic);
    addItem({
      date: new Date().toISOString().slice(0, 10),
      type: "article",
      title: a.title,
      status: "brouillon",
      category: a.category,
      excerpt: a.excerpt,
      image: a.image,
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

// Verrou en mémoire : empêche deux passes concurrentes dans le même process
// (clic + prefetch Next, deux onglets…) de lancer les mêmes routines.
let running = false;

// Lance toutes les routines dues. Conçu pour être appelé de manière
// opportuniste (visite du cockpit) — chaque routine ne tourne qu'une fois
// par jour au maximum, et les erreurs n'interrompent pas les autres.
export async function runDueRoutines(): Promise<void> {
  if (running) return;
  running = true;
  try {
    // On « réclame » d'abord chaque routine due en écrivant lastRun AVANT
    // de l'exécuter : une seconde passe ne la verra plus comme due (isDue
    // rejette une routine déjà lancée aujourd'hui).
    const claimed = listRoutines()
      .filter((r) => isDue(r))
      .map((r) => {
        updateRoutine(r.id, { lastRun: new Date().toISOString(), lastResult: "En cours…" });
        return r;
      });

    for (const r of claimed) {
      try {
        const result = await runRoutine(r);
        updateRoutine(r.id, { lastResult: result });
        sendTelegram(`🤖 Routine « ${r.label} » : ${result}. À valider dans le cockpit.`).catch(() => {});
      } catch (e) {
        updateRoutine(r.id, { lastResult: `Échec : ${(e as Error).message.slice(0, 160)}` });
      }
    }
  } finally {
    running = false;
  }
}
