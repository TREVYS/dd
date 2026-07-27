import { parisToday } from "@/lib/dates";
import type Anthropic from "@anthropic-ai/sdk";
import { addItem, listItems } from "@/lib/editorial";
import { addPost } from "@/lib/social-posts";
import { alfredSystemBlock, readAlfred, GED_THEMES } from "@/lib/alfred-config";
import { siteKnowledgeBlock } from "@/lib/site-knowledge";
import { getPost } from "@/lib/blog";
import { getSetting } from "@/lib/settings";
import { addRoutine, listRoutines, describeSchedule, type RoutineFreq, type RoutineType } from "@/lib/alfred-routines";
import { addCampaign as addCampaignStore } from "@/lib/newsletter-campaigns";
import { addJob as addJobStore, listApplications, type JobApplication } from "@/lib/jobs";
import { readAnalytics, lastDays } from "@/lib/analytics";
import { listMessages } from "@/lib/contact-messages";
import { listSubscribers } from "@/lib/newsletter";
import { listCampaigns } from "@/lib/newsletter-campaigns";
import { setPeoplePhoto, removePeoplePhoto, listPeoplePhotos } from "@/lib/people-photos";
import { TEAM } from "@/lib/team";
import { CONSULTANTS } from "@/lib/consultants";
import { listUploads } from "@/lib/media";

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type AgentResult = { reply: string; actions: string[] };

// --- Choix de la couverture d'article par thème -----------------------------
// La médiathèque contient des visuels nommés par thème (ia.png,
// transformation.png, fiscalite.png…). On associe le sujet/thème de l'article
// au bon fichier ; « actualite » sert de repli générique.
const COVER_RULES: { file: string; words: string[] }[] = [
  { file: "ia", words: ["ia", "intelligence artificielle", "agent", "automatisation", "llm", "copilot"] },
  { file: "facturation-electronique", words: ["facturation", "rfe", "réforme", "reforme", "e-invoicing", "pdp", "facture électronique", "facture electronique", "2026", "2027"] },
  { file: "fiscalite", words: ["fiscal", "impôt", "impot", "tva", "taxe", "liasse", "déclaration", "declaration", "loi de finances"] },
  { file: "transformation", words: ["transformation", "process", "processus", "pilotage", "erp", "si finance", "digitalisation", "organisation"] },
  { file: "innovation", words: ["innovation", "technologie", "outil", "futur", "tendance"] },
  { file: "actualite", words: ["actualité", "actualite", "défaillance", "defaillance", "conjoncture", "économie", "economie", "marché", "marche"] },
];

// Renvoie l'URL de la couverture la plus pertinente pour un sujet donné,
// choisie parmi les fichiers réellement présents dans la médiathèque.
export function pickCoverFor(topic: string): string | undefined {
  const t = topic.toLowerCase();
  const media = listUploads().map((m) => m.url);
  const find = (base: string) =>
    media.find((u) => u.toLowerCase().includes(`/${base}.`) || u.toLowerCase().includes(`/${base}-`));
  for (const rule of COVER_RULES) {
    if (rule.words.some((w) => t.includes(w))) {
      const hit = find(rule.file);
      if (hit) return hit;
    }
  }
  // Aucun thème reconnu : visuel générique demandé par John.
  return find("5-1") ?? find("actualite") ?? undefined;
}

const OPERATING = `Tu es le super-assistant personnel de John Lévy — polyvalent, fiable, direct. Ta mission première : piloter la communication du cabinet (calendrier éditorial, articles, posts réseaux, newsletters). Mais tu es bien plus large que ça :

- RÉPONDS À TOUTES SES QUESTIONS professionnelles : fiscalité, comptabilité, facturation électronique, actualité économique, RH et recrutement, organisation, stratégie… RÈGLE ABSOLUE pour les questions techniques : tu réponds TOUJOURS (jamais de dérobade), et tu termines ta réponse par une ligne « Source : … » — soit un document précis de la GED (via chercher_documents, cite son titre), soit la connaissance du site, soit « connaissance générale (arrêtée à ma date d'entraînement, sans accès Internet en direct — à vérifier pour les chiffres/taux récents) ». Si tu n'es pas certain, ajoute ton niveau d'assurance en pourcentage, ex. « Assurance : 70 % — point à vérifier : le seuil exact 2026 ». Jamais d'invention présentée comme certaine.
- RÉDIGE TOUT CE QU'ON TE DEMANDE : posts RH et marque employeur, e-mails délicats, notes internes, argumentaires, synthèses de documents, trames d'entretien… Si un outil correspond (article, post, offre, newsletter), utilise-le ; sinon, livre le texte directement dans ta réponse, prêt à copier.
- CONSEILLE : quand John hésite, donne un avis tranché et argumenté, pas un catalogue d'options.

Français impeccable.

Le site www.trevys.fr est ta maison : tu en connais chaque page, chaque article, chaque vidéo et chaque média (voir la connaissance du site ci-dessous). Appuie-toi dessus pour faire des liens internes pertinents, éviter les doublons avec les articles existants, illustrer avec les médias disponibles et rester cohérent avec les pages du site.

Tes moyens d'action (outils) :
- rediger_article : quand on te demande un article, RÉDIGE-LE toi-même entièrement (titre, résumé, contenu Markdown structuré avec ## sous-titres) puis appelle cet outil. Le brouillon est enregistré pour relecture — il n'est PAS publié automatiquement.
- rediger_post : quand on te demande un post LinkedIn ou Instagram, RÉDIGE le texte final (accroche, corps aéré, hashtags) puis appelle cet outil. Le post part en brouillon dans la file de publications. TON des posts : humain, chaleureux, une pointe d'humour — jamais corporate ni « robot IA » — et termine toujours par une question ouverte qui invite l'audience à réagir en commentaires.
- rediger_newsletter : quand on te demande une newsletter / un mailing, RÉDIGE-LA entièrement (objet accrocheur et chaleureux + contenu e-mail court avec liens vers les articles du site) puis appelle cet outil. Elle part en brouillon dans le module Newsletter — jamais envoyée sans validation.
- rediger_offre : quand on te demande une offre d'emploi, RÉDIGE-LA entièrement (ton premium du cabinet : on recrute des consultants, pas des producteurs de comptes) puis appelle cet outil. L'offre part en brouillon dans Recrutement.
- planifier_publication : ajoute une échéance à la zone de brouillons/propositions (article, post LinkedIn, newsletter…).
- lister_calendrier : consulte le calendrier existant.
- lire_article : lis le contenu complet d'un article publié (via son slug) avant d'en parler, de le décliner en post ou de proposer une mise à jour.
- creer_routine / lister_routines : mets en place des automatismes récurrents (ex. « un article par semaine sur la RFE, le lundi »). Chaque exécution produit un BROUILLON à valider — jamais de publication directe.
- definir_photo / retirer_photo : change la photo d'un associé ou d'un consultant du site à partir d'une image de la médiathèque (à faire uniquement sur demande explicite).
- lister_candidatures / refuser_candidature / inviter_entretien : gère le recrutement. RÈGLE ABSOLUE : refuser ou inviter envoie un e-mail réel au candidat — uniquement sur instruction explicite et non ambiguë de John (sinon, liste et demande confirmation).
- chercher_documents : cherche dans la GED du cabinet (base documentaire fournie par John : PDF, notes, guides, rangés par thème). UTILISE-LE dès qu'une question de John porte sur un contenu documentaire précis, ou avant de rédiger sur un sujet couvert par un thème de la GED — tu réponds alors à partir des documents, en citant le document utilisé.
- lister_statistiques : consulte la fréquentation du site (pages vues, pages les plus consultées, interactions, tendance récente) pour répondre aux questions sur l'audience.
- lister_messages : consulte les messages reçus via le formulaire de contact.
- lister_newsletter : consulte l'état de la newsletter (nombre d'inscrits, campagnes envoyées/brouillons).
- composer_mailing_articles / lister_contacts / envoyer_mailing : tu peux piloter une campagne de mailing DE BOUT EN BOUT, en dialoguant avec John (cockpit ou Telegram) :
  1. propose des articles (via la connaissance du site), et compose le brouillon avec composer_mailing_articles ;
  2. demande la cible avec les chiffres de lister_contacts (« tous » les abonnés ou seulement les « actifs » — ont ouvert un e-mail dans les 90 derniers jours) ;
  3. ATTENDS LE GO EXPLICITE de John (« envoie », « c'est parti », « go ») — puis appelle envoyer_mailing. RÈGLE ABSOLUE : jamais d'envoi sans ce go clair et sans avoir annoncé la cible et le nombre de destinataires. L'envoi est cadencé (anti-spam) : il part en arrière-plan et John reçoit une confirmation Telegram à la fin.
- inviter_contacts : John te donne une liste d'e-mails (dans le chat ou sur Telegram) → tu envoies à chacun l'invitation opt-in du cabinet (boutons Oui / Non merci). Les déjà-abonnés, les refus passés et les déjà-invités sont écartés automatiquement. UNIQUEMENT sur instruction explicite — annonce le nombre d'invitations avant si la demande est ambiguë.
- supprimer_article / depublier_article : supprime définitivement un article publié du site, ou le dépublie (retour en brouillon). UNIQUEMENT sur instruction explicite de John — jamais de ta propre initiative. Pour plusieurs articles, appelle l'outil pour chacun.
- supprimer_brouillon_article / supprimer_post / supprimer_newsletter_brouillon : supprime un brouillon d'article, un post en attente, ou un mailing en brouillon (les mailings déjà envoyés restent : c'est l'historique).

Tu obéis aux consignes de John : quand il te demande clairement de supprimer, dépublier ou nettoyer (même plusieurs éléments d'un coup), fais-le sans demander de re-confirmation, puis rends compte précisément de ce qui a été fait. En cas d'ambiguïté sur QUEL élément (titre approchant, doublons), liste et demande UNE précision.

Tu as une vue d'ensemble de toute l'activité du cabinet (fréquentation, recrutement, messages, newsletter) — reprise dans la CONNAISSANCE DU SITE et interrogeable en détail via ces outils. Réponds aux questions de John sur les statistiques, les candidatures, les messages ou la newsletter en t'appuyant dessus.

Règles : respecte scrupuleusement le ton, la ligne éditoriale et les mots à éviter ci-dessus. Inspire-toi des exemples de publications passées pour retrouver le style « maison ». Après une action, confirme brièvement et propose la suite. Tu prépares, l'humain valide et publie.`;

function buildSystem(): string {
  return `${alfredSystemBlock()}\n\n---\n\nCONNAISSANCE DU SITE (état actuel, généré à l'instant) :\n\n${siteKnowledgeBlock()}\n\n---\n\n${OPERATING}`;
}

const TOOLS = [
  {
    name: "rediger_article",
    description:
      "Enregistre un brouillon d'article (rédigé par toi) pour le site, en attente de relecture et de publication.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string" },
        category: { type: "string", description: "Thème : Fiscalité, Comptabilité, Facturation électronique, Innovation…" },
        excerpt: { type: "string", description: "Résumé en 1-2 phrases" },
        image: { type: "string", description: "URL de l'image de couverture, choisie dans la médiathèque (/uploads/…) selon le THÈME via le nom du fichier : ia, facturation-electronique, fiscalite, transformation, innovation, actualite. En cas de doute : /uploads/5-1.png. Jamais une photo de personne." },
        body: { type: "string", description: "Contenu complet en Markdown (## sous-titres, listes, gras)" },
      },
      required: ["title", "excerpt", "body"],
    },
  },
  {
    name: "planifier_publication",
    description: "Ajoute une échéance au calendrier éditorial.",
    input_schema: {
      type: "object" as const,
      properties: {
        date: { type: "string", description: "Date AAAA-MM-JJ" },
        type: { type: "string", enum: ["article", "linkedin", "instagram", "newsletter", "idee"] },
        title: { type: "string" },
      },
      required: ["date", "type", "title"],
    },
  },
  {
    name: "rediger_post",
    description:
      "Enregistre un brouillon de post réseau social (rédigé par toi, prêt à publier). Le post part dans la file de publications pour relecture — il n'est PAS publié automatiquement.",
    input_schema: {
      type: "object" as const,
      properties: {
        network: { type: "string", enum: ["linkedin", "instagram"] },
        content: { type: "string", description: "Texte final du post (avec hashtags)" },
      },
      required: ["network", "content"],
    },
  },
  {
    name: "lister_calendrier",
    description: "Renvoie les éléments du calendrier éditorial.",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "lister_candidatures",
    description: "Liste les candidatures reçues (nom, poste, profil, statut). À utiliser avant de refuser ou d'inviter, pour identifier la bonne personne.",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "refuser_candidature",
    description: "Envoie un e-mail de refus courtois et personnalisé au candidat (rédigé par toi via le modèle du cabinet). Irréversible : à n'utiliser que sur instruction explicite de John.",
    input_schema: {
      type: "object" as const,
      properties: {
        candidat: { type: "string", description: "Nom (ou id) du candidat, tel que listé par lister_candidatures" },
      },
      required: ["candidat"],
    },
  },
  {
    name: "inviter_entretien",
    description: "Fait passer le candidat à la 2e étape : envoie l'invitation à l'entretien (avec le lien Calendly si configuré). À n'utiliser que sur instruction explicite de John.",
    input_schema: {
      type: "object" as const,
      properties: {
        candidat: { type: "string", description: "Nom (ou id) du candidat, tel que listé par lister_candidatures" },
      },
      required: ["candidat"],
    },
  },
  {
    name: "rediger_offre",
    description:
      "Enregistre un brouillon d'offre d'emploi (rédigée par toi) pour la page « Nous rejoindre ». Structure attendue : ## Vos missions, ## Le profil recherché, ## Ce que nous proposons, ## Pourquoi rejoindre TREVYS. L'offre part en BROUILLON — publiée par l'humain depuis le cockpit (Recrutement).",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Intitulé du poste, ex. « Consultant conseil (H/F) »" },
        category: { type: "string", enum: ["Expertise comptable", "Conseil", "Support & fonctions transverses"] },
        contract: { type: "string", description: "CDI, CDD, alternance, stage…" },
        location: { type: "string", description: "Lieu, ex. Paris 16e" },
        summary: { type: "string", description: "Accroche en 1-2 phrases" },
        body: { type: "string", description: "Contenu complet en Markdown" },
      },
      required: ["title", "summary", "body"],
    },
  },
  {
    name: "rediger_newsletter",
    description:
      "Enregistre un brouillon de newsletter (rédigée par toi) dans le module Newsletter, en attente de relecture et d'envoi par l'humain. Format e-mail : salutation, ## sous-titres, listes, liens vers les articles du site, signature « L'équipe Trevys ».",
    input_schema: {
      type: "object" as const,
      properties: {
        subject: { type: "string", description: "Objet de l'e-mail — court, accrocheur, chaleureux" },
        body: { type: "string", description: "Contenu complet en Markdown. Un lien seul sur sa ligne devient un bouton ; un lien YouTube seul sur sa ligne devient une carte vidéo (miniature + bouton Regarder) — utilise les vidéos du site listées dans la connaissance du site quand c'est pertinent." },
      },
      required: ["subject", "body"],
    },
  },
  {
    name: "creer_routine",
    description:
      "Crée une routine récurrente (ex. rédiger un article chaque semaine). Tout ce que produit une routine part en BROUILLON pour validation humaine. Les routines sont visibles et modifiables dans « Routines d'Alfred ».",
    input_schema: {
      type: "object" as const,
      properties: {
        label: { type: "string", description: "Nom court de la routine, ex. « Article hebdo RFE »" },
        type: { type: "string", enum: ["article", "linkedin", "instagram", "newsletter"] },
        freq: { type: "string", enum: ["quotidienne", "hebdomadaire", "mensuelle"] },
        weekday: { type: "number", description: "Jour de la semaine si hebdomadaire (0=dimanche … 6=samedi)" },
        monthday: { type: "number", description: "Jour du mois (1-28) si mensuelle" },
        topic: { type: "string", description: "La consigne : sujet, angle, thème à traiter" },
      },
      required: ["label", "type", "freq", "topic"],
    },
  },
  {
    name: "lister_routines",
    description: "Liste les routines récurrentes existantes.",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "definir_photo",
    description:
      "Change la photo d'une personne du site (associé ou consultant) en pointant vers une image de la médiathèque (/uploads/…). Utilise le slug de la personne (ex. john-levy, olivier-bonnin, walther-ottgen, jeremy-roch, ou un slug de consultant). L'image doit exister dans la médiathèque.",
    input_schema: {
      type: "object" as const,
      properties: {
        slug: { type: "string", description: "Slug de la personne" },
        url: { type: "string", description: "URL de l'image, ex. /uploads/jeremy.jpg" },
      },
      required: ["slug", "url"],
    },
  },
  {
    name: "retirer_photo",
    description: "Retire la photo personnalisée d'une personne (retour à la photo/avatar par défaut).",
    input_schema: {
      type: "object" as const,
      properties: { slug: { type: "string" } },
      required: ["slug"],
    },
  },
  {
    name: "chercher_documents",
    description:
      "Cherche dans la GED du cabinet (documents fournis par John : PDF, Word, notes, liens). Renvoie les documents les plus pertinents avec de larges extraits. À utiliser pour répondre aux questions documentaires et pour sourcer articles/posts.",
    input_schema: {
      type: "object" as const,
      properties: {
        requete: { type: "string", description: "Mots-clés de la recherche" },
        theme: { type: "string", description: "Optionnel — un des thèmes de la GED pour restreindre la recherche" },
      },
      required: ["requete"],
    },
  },
  {
    name: "lister_statistiques",
    description:
      "Renvoie la fréquentation du site : total de pages vues, tendance des 14 derniers jours, pages les plus consultées et interactions les plus fréquentes.",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "lister_messages",
    description: "Liste les messages reçus via le formulaire de contact (expéditeur, objet, date, lu/non lu).",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "lister_newsletter",
    description: "Renvoie l'état de la newsletter : nombre d'inscrits et campagnes (envoyées / brouillons).",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "composer_mailing_articles",
    description:
      "Compose un brouillon de mailing à partir d'articles publiés du site (titres, résumés, boutons « Lire l'article »). Renvoie l'id du brouillon. N'ENVOIE RIEN.",
    input_schema: {
      type: "object" as const,
      properties: {
        slugs: { type: "array", items: { type: "string" }, description: "Slugs des articles à inclure" },
        objet: { type: "string", description: "Objet de l'e-mail (optionnel — proposé automatiquement sinon)" },
      },
      required: ["slugs"],
    },
  },
  {
    name: "lister_contacts",
    description: "Renvoie les segments d'abonnés newsletter : total, actifs (ouverture < 90 jours), inactifs. À utiliser pour proposer la cible d'un mailing.",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "envoyer_mailing",
    description:
      "ENVOIE RÉELLEMENT un mailing en brouillon aux abonnés (cible « tous » ou « actifs »). Irréversible. UNIQUEMENT après un GO explicite de John, en ayant annoncé la cible et le nombre de destinataires. L'envoi part en arrière-plan (cadencé anti-spam) ; John est prévenu sur Telegram à la fin.",
    input_schema: {
      type: "object" as const,
      properties: {
        mailing: { type: "string", description: "Objet (ou id) du mailing en brouillon" },
        cible: { type: "string", enum: ["tous", "actifs"], description: "Segment destinataire" },
      },
      required: ["mailing", "cible"],
    },
  },
  {
    name: "inviter_contacts",
    description:
      "Envoie l'invitation opt-in newsletter (Oui / Non merci) à une liste d'e-mails fournie par John. Filtre automatiquement les déjà-abonnés, refus et déjà-invités. ENVOIE DE VRAIS E-MAILS : uniquement sur instruction explicite.",
    input_schema: {
      type: "object" as const,
      properties: {
        emails: { type: "array", items: { type: "string" }, description: "Les adresses e-mail à inviter" },
      },
      required: ["emails"],
    },
  },
  {
    name: "supprimer_article",
    description: "Supprime DÉFINITIVEMENT un article publié du site (irréversible). Uniquement sur instruction explicite de John.",
    input_schema: {
      type: "object" as const,
      properties: { slug: { type: "string", description: "Slug de l'article (fin de l'URL /blog/<slug>)" } },
      required: ["slug"],
    },
  },
  {
    name: "depublier_article",
    description: "Retire un article publié du site et le remet en brouillon (récupérable dans Brouillons). Uniquement sur instruction explicite de John.",
    input_schema: {
      type: "object" as const,
      properties: { slug: { type: "string", description: "Slug de l'article" } },
      required: ["slug"],
    },
  },
  {
    name: "supprimer_brouillon_article",
    description: "Supprime un brouillon d'article (liste via lister_calendrier). Uniquement sur instruction explicite.",
    input_schema: {
      type: "object" as const,
      properties: { titre: { type: "string", description: "Titre (ou id) du brouillon" } },
      required: ["titre"],
    },
  },
  {
    name: "supprimer_post",
    description: "Supprime un post réseaux en attente (brouillon ou planifié). Uniquement sur instruction explicite.",
    input_schema: {
      type: "object" as const,
      properties: { contenu: { type: "string", description: "Début du texte du post (ou son id) pour l'identifier" } },
      required: ["contenu"],
    },
  },
  {
    name: "supprimer_newsletter_brouillon",
    description: "Supprime un mailing en BROUILLON (les campagnes envoyées sont conservées : historique). Uniquement sur instruction explicite.",
    input_schema: {
      type: "object" as const,
      properties: { objet: { type: "string", description: "Objet (ou id) du mailing brouillon" } },
      required: ["objet"],
    },
  },
  {
    name: "lire_article",
    description:
      "Renvoie le contenu complet (Markdown) d'un article publié du site, à partir de son slug (ex. « calendrier-2026-2027 »).",
    input_schema: {
      type: "object" as const,
      properties: {
        slug: { type: "string", description: "Le slug de l'article (fin de l'URL /blog/<slug>)" },
      },
      required: ["slug"],
    },
  },
];

// Envois de mailing en cours (verrou anti double-lancement).
const SENDING = new Set<string>();

function findApplication(query: string): JobApplication | undefined {
  const q = query.trim().toLowerCase();
  const apps = listApplications();
  return apps.find((a) => a.id === q) ?? apps.find((a) => a.name.toLowerCase().includes(q));
}

async function runTool(name: string, input: Record<string, unknown>, actions: string[]): Promise<string> {
  if (name === "rediger_article") {
    // Couverture : celle choisie par Alfred si elle existe vraiment dans la
    // médiathèque, sinon choix automatique par thème (repli : 5-1.png).
    const proposed = input.image ? String(input.image) : "";
    const validImage = proposed && listUploads().some((m) => m.url === proposed) ? proposed : undefined;
    const image = validImage ?? pickCoverFor(`${input.title ?? ""} ${input.category ?? ""} ${input.excerpt ?? ""}`);
    const it = addItem({
      date: parisToday(),
      type: "article",
      title: String(input.title ?? "Sans titre"),
      status: "brouillon",
      category: input.category ? String(input.category) : "Article",
      excerpt: String(input.excerpt ?? ""),
      image,
      body: String(input.body ?? ""),
    });
    actions.push(`Brouillon d'article créé : « ${it.title} »`);
    return `Brouillon enregistré (id ${it.id}). À relire dans les Brouillons d'articles avant publication.`;
  }
  if (name === "planifier_publication") {
    // Une simple idée/échéance d'article va dans « Brouillons d'articles ».
    // (Les vrais posts et newsletters sont créés par rediger_post /
    // rediger_newsletter, dans leurs modules dédiés — on ne crée donc plus
    // d'éléments invisibles dans le calendrier.)
    const date = String(input.date ?? parisToday());
    const title = String(input.title ?? "");
    const type = String(input.type ?? "idee");
    if (type === "article" || type === "idee") {
      const it = addItem({ date, type: "article", title, status: "brouillon" });
      actions.push(`Idée d'article notée pour le ${it.date} : « ${it.title} »`);
      return `Ajouté aux Brouillons d'articles (${it.date}). Dites-moi « rédige-le » quand vous voulez que je le prépare.`;
    }
    return `Pour un ${type}, je le rédige directement en brouillon dans son module — dites-moi le sujet et je m'en charge (rien à “planifier” à vide).`;
  }
  if (name === "rediger_post") {
    const net = input.network === "instagram" ? "instagram" : "linkedin";
    const p = addPost({ network: net, content: String(input.content ?? ""), status: "brouillon" });
    actions.push(`Brouillon de post ${net === "linkedin" ? "LinkedIn" : "Instagram"} créé`);
    return `Post enregistré (id ${p.id}) dans la file de publications, en brouillon.`;
  }
  if (name === "lister_calendrier") {
    return JSON.stringify(
      listItems().map((i) => ({ date: i.date, type: i.type, title: i.title, status: i.status })),
    );
  }
  if (name === "lister_candidatures") {
    return JSON.stringify(
      listApplications().slice(0, 25).map((a) => ({
        id: a.id, nom: a.name, poste: a.jobTitle, date: a.date.slice(0, 10),
        experience: a.experience ?? null, competences: a.skills ?? [],
        langues: a.languages ?? [], disponibilite: a.availability ?? null,
        statut: a.refusedAt ? "refusée" : a.invitedAt ? "entretien proposé" : "à traiter",
      })),
    );
  }
  if (name === "refuser_candidature") {
    const app = findApplication(String(input.candidat ?? ""));
    if (!app) return "Candidat introuvable — utilise lister_candidatures pour vérifier le nom exact.";
    const { sendRejectionForApp } = await import("@/lib/recruiting");
    const r = await sendRejectionForApp(app);
    if (r.ok) actions.push(r.detail);
    return r.detail;
  }
  if (name === "inviter_entretien") {
    const app = findApplication(String(input.candidat ?? ""));
    if (!app) return "Candidat introuvable — utilise lister_candidatures pour vérifier le nom exact.";
    const { sendInterviewInviteForApp } = await import("@/lib/recruiting");
    const r = await sendInterviewInviteForApp(app);
    if (r.ok) actions.push(r.detail);
    return r.detail;
  }
  if (name === "rediger_offre") {
    const j = addJobStore({
      title: String(input.title ?? "Offre"),
      category: String(input.category ?? "Expertise comptable"),
      contract: String(input.contract ?? "CDI"),
      location: String(input.location ?? "Paris 16e"),
      summary: String(input.summary ?? ""),
      body: String(input.body ?? ""),
      status: "brouillon",
    });
    actions.push(`Brouillon d'offre créé : « ${j.title} »`);
    return `Offre enregistrée en brouillon (id ${j.id}) — à relire et publier dans le cockpit, rubrique Recrutement.`;
  }
  if (name === "rediger_newsletter") {
    const c = addCampaignStore(String(input.subject ?? "Sans objet"), String(input.body ?? ""));
    actions.push(`Brouillon de newsletter créé : « ${c.subject} »`);
    return `Newsletter enregistrée en brouillon (id ${c.id}) dans le module Newsletter — à relire, tester puis envoyer.`;
  }
  if (name === "creer_routine") {
    const r = addRoutine({
      label: String(input.label ?? "Routine"),
      type: (input.type as RoutineType) ?? "article",
      freq: (input.freq as RoutineFreq) ?? "hebdomadaire",
      weekday: typeof input.weekday === "number" ? input.weekday : undefined,
      monthday: typeof input.monthday === "number" ? input.monthday : undefined,
      topic: String(input.topic ?? ""),
      enabled: true,
    });
    actions.push(`Routine créée : « ${r.label} » (${describeSchedule(r)})`);
    return `Routine enregistrée (${describeSchedule(r)}). Elle produira des brouillons à valider. Modifiable dans « Routines d'Alfred ».`;
  }
  if (name === "lister_routines") {
    return JSON.stringify(
      listRoutines().map((r) => ({
        label: r.label, type: r.type, planification: describeSchedule(r),
        sujet: r.topic, active: r.enabled, derniereExecution: r.lastRun ?? null, dernierResultat: r.lastResult ?? null,
      })),
    );
  }
  if (name === "definir_photo") {
    const slug = String(input.slug ?? "").trim();
    const url = String(input.url ?? "").trim();
    const known = [...TEAM.map((m) => m.slug), ...CONSULTANTS.map((c) => c.slug)];
    if (!known.includes(slug)) {
      return `Personne inconnue « ${slug} ». Slugs valides : ${known.join(", ")}.`;
    }
    if (!url.startsWith("/uploads/")) {
      return "L'image doit venir de la médiathèque (URL commençant par /uploads/).";
    }
    const exists = listUploads().some((m) => m.url === url);
    if (!exists) {
      return `Fichier introuvable dans la médiathèque : ${url}. Fichiers disponibles : ${listUploads().slice(0, 30).map((m) => m.url).join(", ")}`;
    }
    setPeoplePhoto(slug, url);
    actions.push(`Photo de ${slug} remplacée par ${url}`);
    return `Photo de ${slug} mise à jour (${url}). Visible immédiatement sur le site.`;
  }
  if (name === "retirer_photo") {
    const slug = String(input.slug ?? "").trim();
    removePeoplePhoto(slug);
    actions.push(`Photo personnalisée de ${slug} retirée`);
    return `Photo personnalisée retirée pour ${slug} — retour au visuel par défaut. État actuel : ${JSON.stringify(listPeoplePhotos())}`;
  }
  if (name === "chercher_documents") {
    const requete = String(input.requete ?? "").toLowerCase().trim();
    const theme = String(input.theme ?? "").trim();
    const words = requete.split(/\s+/).filter((w) => w.length > 2);
    const docs = (readAlfred().knowledge ?? []).filter((d) => !theme || d.theme === theme);
    if (docs.length === 0) return "La GED est vide (ou ce thème ne contient aucun document).";
    // Pertinence simple : nombre de mots-clés présents (titre pondéré x3).
    const scored = docs
      .map((d) => {
        const t = d.title.toLowerCase();
        const x = d.text.toLowerCase();
        const score = words.reduce((s2, w) => s2 + (t.includes(w) ? 3 : 0) + (x.includes(w) ? 1 : 0), 0);
        return { d, score };
      })
      .filter((r) => r.score > 0 || words.length === 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    if (scored.length === 0) {
      return `Aucun document ne correspond à « ${requete} ». Documents disponibles : ${docs.slice(0, 20).map((d) => `« ${d.title} »${d.theme ? ` (${d.theme})` : ""}`).join(", ")}. Thèmes : ${GED_THEMES.join(", ")}.`;
    }
    return scored
      .map(({ d }) => {
        // Extrait centré sur la première occurrence d'un mot-clé.
        const x = d.text.toLowerCase();
        const pos = words.map((w) => x.indexOf(w)).filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? 0;
        const start = Math.max(0, pos - 500);
        return `### ${d.title}${d.theme ? ` [${d.theme}]` : ""} (source : ${d.source})\n${d.text.slice(start, start + 7000)}`;
      })
      .join("\n\n---\n\n");
  }
  if (name === "lister_statistiques") {
    const a = readAnalytics();
    const d14 = lastDays(a, 14);
    return JSON.stringify({
      totalPagesVues: a.totals.views,
      totalInteractions: a.totals.events,
      vues14Jours: d14.reduce((s, x) => s + x.views, 0),
      tendance14Jours: d14.map((x) => ({ jour: x.day, vues: x.views, interactions: x.events })),
      pagesLesPlusVues: Object.entries(a.paths).sort((x, y) => y[1] - x[1]).slice(0, 15).map(([p, n]) => ({ page: p, vues: n })),
      interactions: Object.entries(a.events).sort((x, y) => y[1] - x[1]).slice(0, 15).map(([e, n]) => ({ nom: e, nombre: n })),
    });
  }
  if (name === "lister_messages") {
    return JSON.stringify(
      listMessages().slice(0, 30).map((m) => ({
        id: m.id, nom: `${m.firstName} ${m.lastName}`, email: m.email,
        date: m.date.slice(0, 10), objet: m.subject ?? null,
        extrait: m.message.slice(0, 200), lu: m.read,
      })),
    );
  }
  if (name === "lister_newsletter") {
    const subs = listSubscribers();
    const camps = listCampaigns();
    return JSON.stringify({
      inscrits: subs.length,
      campagnes: camps.map((c) => ({
        objet: c.subject, statut: c.status,
        envoyeLe: c.sentAt?.slice(0, 10) ?? null, destinataires: c.sentCount ?? null,
      })),
    });
  }
  if (name === "composer_mailing_articles") {
    const slugs = Array.isArray(input.slugs) ? input.slugs.map(String) : [];
    const posts = slugs.map((sl) => getPost(sl)).filter((p): p is NonNullable<ReturnType<typeof getPost>> => !!p);
    if (posts.length === 0) return "Aucun article trouvé pour ces slugs — vérifie dans la liste des articles publiés.";
    const { SITE_URL } = await import("@/lib/site");
    const intro = posts.length === 1
      ? "Bonjour,\n\nNotre dernière analyse pourrait vous intéresser :"
      : "Bonjour,\n\nVoici nos dernières analyses, sélectionnées pour vous :";
    const body =
      `${intro}\n\n` +
      posts.map((p) => `## ${p.meta.title}\n\n${p.meta.excerpt ?? ""}\n\n[Lire l'article →](${SITE_URL}/blog/${p.meta.slug})`).join("\n\n---\n\n") +
      `\n\nBonne lecture,\n\nL'équipe Trevys\n[www.trevys.fr](${SITE_URL})`;
    let subject = String(input.objet ?? "").trim();
    if (!subject) subject = await suggestSubject(body);
    const camp = addCampaignStore(subject, body);
    actions.push(`Brouillon de mailing composé : « ${camp.subject} » (${posts.length} article${posts.length > 1 ? "s" : ""})`);
    return `Mailing composé en brouillon (id ${camp.id}) : « ${camp.subject} », avec ${posts.length} article(s) : ${posts.map((p) => `« ${p.meta.title} »`).join(", ")}. Demande maintenant la cible (tous / actifs) puis attends le GO avant d'envoyer.`;
  }
  if (name === "lister_contacts") {
    const { contactActivity } = await import("@/lib/newsletter-stats");
    const subs = listSubscribers();
    const activity = contactActivity();
    const ninety = Date.now() - 90 * 24 * 3600 * 1000;
    const actifs = subs.filter((x) => {
      const a = activity[x.email.toLowerCase()];
      return a?.lastOpen && new Date(a.lastOpen).getTime() > ninety;
    }).length;
    return JSON.stringify({ total: subs.length, actifs, inactifsOuInconnus: subs.length - actifs });
  }
  if (name === "envoyer_mailing") {
    const q = String(input.mailing ?? "").trim().toLowerCase();
    const cible = input.cible === "actifs" ? "actifs" : "tous";
    const { mailerConfigured, sendPersonalized } = await import("@/lib/mailer");
    if (!mailerConfigured()) return "Envoi impossible : Microsoft 365 n'est pas configuré (Réglages).";
    const { getCampaign, updateCampaign, markdownToEmailHtml, wrapEmail, unsubscribeUrl, listCampaigns: lc2 } = await import("@/lib/newsletter-campaigns");
    const drafts = lc2().filter((x) => x.status === "brouillon");
    const camp = (getCampaign(q)?.status === "brouillon" ? getCampaign(q) : undefined) ?? drafts.find((x) => x.subject.toLowerCase().includes(q));
    if (!camp) return `Mailing en brouillon introuvable pour « ${q} ». Brouillons : ${drafts.map((x) => `« ${x.subject} »`).join(", ") || "aucun"}.`;
    if (SENDING.has(camp.id)) return "Cet envoi est déjà en cours — patience, la confirmation Telegram arrive.";

    const { contactActivity, openPixelUrl, trackLinks } = await import("@/lib/newsletter-stats");
    let recipients = listSubscribers().map((x) => x.email.toLowerCase());
    if (cible === "actifs") {
      const activity = contactActivity();
      const ninety = Date.now() - 90 * 24 * 3600 * 1000;
      recipients = recipients.filter((e) => {
        const a = activity[e];
        return a?.lastOpen && new Date(a.lastOpen).getTime() > ninety;
      });
    }
    recipients = [...new Set(recipients)];
    if (recipients.length === 0) return `Aucun destinataire dans le segment « ${cible} » — envoi annulé.`;

    // Envoi en arrière-plan (cadencé anti-spam) ; confirmation Telegram à la fin.
    SENDING.add(camp.id);
    const bodyHtml = markdownToEmailHtml(camp.body);
    (async () => {
      try {
        const count = await sendPersonalized(recipients, camp.subject, (email) =>
          trackLinks(wrapEmail(bodyHtml, unsubscribeUrl(email)), camp.id, email) +
          `<img src="${openPixelUrl(camp.id, email)}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`,
        );
        updateCampaign(camp.id, { status: "envoye", sentAt: new Date().toISOString(), sentCount: count });
        const { sendTelegram } = await import("@/lib/notify");
        await sendTelegram(`✅ Mailing « ${camp.subject} » envoyé à ${count}/${recipients.length} contact(s) (cible : ${cible}). Analyse disponible dans le cockpit.`, { plain: true });
      } catch (e) {
        console.error("[envoyer_mailing] échec:", e);
        const { sendTelegram } = await import("@/lib/notify");
        await sendTelegram(`⚠️ L'envoi du mailing « ${camp.subject} » a rencontré un problème — vérifiez le cockpit.`, { plain: true }).catch(() => {});
      } finally {
        SENDING.delete(camp.id);
      }
    })();
    actions.push(`Envoi du mailing « ${camp.subject} » lancé (${recipients.length} destinataires, cible ${cible})`);
    return `Envoi lancé : « ${camp.subject} » vers ${recipients.length} contact(s) (cible : ${cible}). L'envoi est cadencé contre le spam — confirmation Telegram dès que c'est terminé.`;
  }
  if (name === "inviter_contacts") {
    const raw = Array.isArray(input.emails) ? input.emails.map(String) : [];
    const valid = [...new Set(raw.map((e) => e.trim().toLowerCase()).filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)))];
    if (valid.length === 0) return "Aucune adresse e-mail valide dans la liste.";
    const { mailerConfigured, sendPersonalized } = await import("@/lib/mailer");
    if (!mailerConfigured()) return "Envoi impossible : Microsoft 365 n'est pas configuré (Réglages).";
    const { isDeclined, isInvited, markInvited, buildOptinEmail, OPTIN_SUBJECT } = await import("@/lib/newsletter-optin");
    const existing = new Set(listSubscribers().map((x) => x.email.toLowerCase()));
    const targets = valid.filter((e) => !existing.has(e) && !isDeclined(e) && !isInvited(e));
    const skipped = valid.length - targets.length;
    if (targets.length === 0) {
      return `Aucun nouvel envoi : ces ${valid.length} contact(s) sont déjà abonnés, déjà invités ou ont refusé.`;
    }
    // Envoi en arrière-plan (cadencé) ; confirmation Telegram à la fin.
    targets.forEach((e) => markInvited(e));
    (async () => {
      try {
        const sent = await sendPersonalized(targets, OPTIN_SUBJECT, (email) => buildOptinEmail(email));
        const { sendTelegram } = await import("@/lib/notify");
        await sendTelegram(`✅ ${sent} invitation(s) opt-in envoyée(s)${skipped ? ` (${skipped} contact(s) écarté(s) : déjà abonnés/invités/refus)` : ""}. Les « Oui » rejoindront automatiquement vos abonnés.`, { plain: true });
      } catch (e) {
        console.error("[inviter_contacts] échec:", e);
      }
    })();
    actions.push(`${targets.length} invitation(s) opt-in lancée(s)`);
    return `C'est parti : ${targets.length} invitation(s) en cours d'envoi${skipped ? ` (${skipped} écarté(s) : déjà abonnés, déjà invités ou refus)` : ""}. Confirmation Telegram à la fin. Les « Oui » s'ajouteront automatiquement à la base.`;
  }
  if (name === "supprimer_article") {
    const slug = String(input.slug ?? "").trim();
    const post = getPost(slug);
    if (!post) return `Article introuvable pour le slug « ${slug} » — vérifie dans la liste des articles publiés.`;
    const { deleteArticle } = await import("@/lib/content-admin");
    deleteArticle(slug);
    actions.push(`Article supprimé : « ${post.meta.title} »`);
    return `Article « ${post.meta.title} » supprimé définitivement du site.`;
  }
  if (name === "depublier_article") {
    const slug = String(input.slug ?? "").trim();
    const { getRawArticle, deleteArticle } = await import("@/lib/content-admin");
    const a = getRawArticle(slug);
    if (!a) return `Article introuvable pour le slug « ${slug} ».`;
    addItem({
      date: parisToday(),
      type: "article",
      title: a.title,
      status: "brouillon",
      category: a.category || "Article",
      excerpt: a.excerpt || "",
      image: a.image || undefined,
      body: a.body || "",
    });
    deleteArticle(slug);
    actions.push(`Article dépublié : « ${a.title} » (retour en brouillon)`);
    return `Article « ${a.title} » retiré du site et rangé dans les Brouillons — récupérable à tout moment.`;
  }
  if (name === "supprimer_brouillon_article") {
    const q = String(input.titre ?? "").trim().toLowerCase();
    const items = listItems().filter((i) => i.status !== "publie");
    const it = items.find((i) => i.id === q) ?? items.find((i) => i.title.toLowerCase().includes(q));
    if (!it) return `Brouillon introuvable pour « ${q} ». Brouillons existants : ${items.slice(0, 15).map((i) => `« ${i.title} »`).join(", ") || "aucun"}.`;
    const { removeItem } = await import("@/lib/editorial");
    removeItem(it.id);
    actions.push(`Brouillon supprimé : « ${it.title} »`);
    return `Brouillon « ${it.title} » supprimé.`;
  }
  if (name === "supprimer_post") {
    const q = String(input.contenu ?? "").trim().toLowerCase();
    const { listPosts, deletePost } = await import("@/lib/social-posts");
    const pending = listPosts().filter((x) => x.status !== "publie");
    const p = pending.find((x) => x.id === q) ?? pending.find((x) => x.content.toLowerCase().includes(q));
    if (!p) return `Post introuvable pour « ${q} ». Posts en attente : ${pending.slice(0, 10).map((x) => `« ${x.content.slice(0, 50)}… »`).join(" ; ") || "aucun"}.`;
    deletePost(p.id);
    actions.push(`Post ${p.network} supprimé`);
    return `Post supprimé (${p.network}) : « ${p.content.slice(0, 80)}… »`;
  }
  if (name === "supprimer_newsletter_brouillon") {
    const q = String(input.objet ?? "").trim().toLowerCase();
    const { listCampaigns: lc, removeCampaign } = await import("@/lib/newsletter-campaigns");
    const drafts = lc().filter((x) => x.status === "brouillon");
    const c = drafts.find((x) => x.id === q) ?? drafts.find((x) => x.subject.toLowerCase().includes(q));
    if (!c) return `Mailing en brouillon introuvable pour « ${q} ». Brouillons : ${drafts.slice(0, 10).map((x) => `« ${x.subject} »`).join(", ") || "aucun"}. (Les campagnes envoyées ne sont pas supprimables — historique.)`;
    removeCampaign(c.id);
    actions.push(`Mailing brouillon supprimé : « ${c.subject} »`);
    return `Mailing « ${c.subject} » supprimé.`;
  }
  if (name === "lire_article") {
    const post = getPost(String(input.slug ?? ""));
    if (!post) return "Article introuvable — vérifie le slug dans la liste des articles publiés.";
    return `TITRE : ${post.meta.title}\nTHÈME : ${post.meta.category}\nDATE : ${post.meta.date}\nRÉSUMÉ : ${post.meta.excerpt ?? ""}\n\n${post.content.slice(0, 24_000)}`;
  }
  return "Outil inconnu.";
}

// Rédige un post réseau social (appel modèle unique, sans boucle d'outils).
// Renvoie le texte du post prêt à relire. Sans clé API, renvoie un gabarit.
export async function draftSocialPost(
  topic: string,
  network: "linkedin" | "instagram",
): Promise<{ content: string; generated: boolean }> {
  const apiKey = getSetting("anthropicApiKey");
  const netLabel = network === "linkedin" ? "LinkedIn" : "Instagram";

  if (!apiKey) {
    // Gabarit de secours pour travailler en brouillon sans IA.
    return {
      generated: false,
      content:
        `✍️ [Brouillon à compléter — ${netLabel}]\n\n${topic}\n\n` +
        `• Point clé 1\n• Point clé 2\n• Point clé 3\n\n` +
        `👉 Votre appel à l'action.\n\n#Trevys #ExpertiseComptable` +
        (network === "linkedin" ? " #Conseil" : ""),
    };
  }

  const { default: AnthropicSDK } = await import("@anthropic-ai/sdk");
  const client = new AnthropicSDK({ apiKey });

  const jour = new Date().toLocaleDateString("fr-FR", { weekday: "long" });
  const consignes =
    network === "linkedin"
      ? `FORMAT COURT OBLIGATOIRE (6-9 lignes en tout) : une accroche du type « C'est ${jour}, je vous partage un nouvel article sur … » (varie la formule d'une fois sur l'autre), ` +
        "puis un résumé de 3-4 lignes qui donne envie (le problème, ce qu'on y apprend), puis le lien vers l'article sur www.trevys.fr seul sur sa ligne, et 3-4 hashtags. Pas de titre Markdown, pas de pavé. " +
        "TON : humain et chaleureux — une vraie personne qui parle, pas un robot ni un communiqué. Une pointe d'humour bienvenue quand le sujet s'y prête. " +
        "Bannis le style corporate creux (« Nous sommes ravis de… », « À l'ère du digital… », « n'hésitez pas à ») et les tournures d'IA (« Dans un monde où… »). " +
        "Une courte question finale à l'audience est bienvenue si elle reste naturelle."
      : `FORMAT COURT OBLIGATOIRE (5-7 lignes) : accroche du type « C'est ${jour}, nouvel article sur … » (varie la formule), résumé de 3-4 lignes, ` +
        "invitation à lire l'article (lien www.trevys.fr en bio ou sur sa ligne), quelques emojis pertinents, ton chaleureux et complice, 5-8 hashtags en fin.";

  const res = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: `${alfredSystemBlock()}\n\nCONNAISSANCE DU SITE :\n${siteKnowledgeBlock()}\n\nTu rédiges UNIQUEMENT le texte final d'un post ${netLabel}, prêt à publier, sans commentaire ni balise. ${consignes}`,
    messages: [{ role: "user", content: `Rédige un post ${netLabel} sur : ${topic}` }],
  });

  const content = res.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("")
    .trim();

  return { content: content || topic, generated: true };
}

// Rédige un article complet (appel modèle unique). Sans clé API, renvoie un
// gabarit à compléter — le brouillon existe quand même pour ne rien perdre.
export async function draftArticle(
  topic: string,
): Promise<{ title: string; category: string; excerpt: string; body: string; image?: string; generated: boolean }> {
  const apiKey = getSetting("anthropicApiKey");

  // Images disponibles dans la médiathèque (pour la couverture).
  const mediaUrls = listUploads()
    .filter((m) => /\.(jpg|jpeg|png|webp)$/i.test(m.name))
    .map((m) => m.url)
    .slice(0, 40);
  const fallbackImage = pickCoverFor(topic) ?? mediaUrls[0];

  if (!apiKey) {
    return {
      generated: false,
      title: `[À rédiger] ${topic.slice(0, 80)}`,
      category: "Article",
      excerpt: "Brouillon créé par une routine — Alfred attend sa clé API pour rédiger.",
      body: `## ${topic}\n\n_(Alfred n'a pas pu rédiger : clé API non configurée — voir Réglages.)_\n\n- Point clé 1\n- Point clé 2\n- Point clé 3`,
      image: fallbackImage,
    };
  }

  const { default: AnthropicSDK } = await import("@anthropic-ai/sdk");
  const client = new AnthropicSDK({ apiKey });

  const res = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system:
      `${alfredSystemBlock()}\n\nCONNAISSANCE DU SITE :\n${siteKnowledgeBlock()}\n\n` +
      `Tu rédiges un article complet pour le blog du cabinet. Réponds EXACTEMENT dans ce format, sans rien d'autre :\n` +
      `TITRE: <titre>\nTHEME: <thème court, ex. Facturation électronique>\nRESUME: <1-2 phrases>\nIMAGE: <l'URL de la médiathèque la plus pertinente pour illustrer l'article, choisie dans la liste ci-dessous, ou "aucune">\nCORPS:\n<contenu Markdown structuré avec ## sous-titres, listes, gras — 600 à 900 mots>\n\n` +
      (mediaUrls.length
        ? `IMAGES DISPONIBLES DANS LA MÉDIATHÈQUE :\n${mediaUrls.join("\n")}\n\n` +
          `RÈGLE DE CHOIX DE LA COUVERTURE : les visuels sont nommés par thème — choisis celui dont le NOM correspond au sujet de l'article : ` +
          `ia.png (intelligence artificielle, automatisation), facturation-electronique.png (réforme, RFE, e-invoicing), fiscalite.png (impôts, TVA, lois de finances), ` +
          `transformation.png (processus, pilotage, ERP, SI finance), innovation.png (technologies, tendances), actualite.png (actualité économique, conjoncture). ` +
          `Si aucun thème ne correspond clairement, choisis 5-1.png (visuel générique par défaut). ` +
          `Ne choisis JAMAIS une photo de personne ni un fichier sans rapport (ex. img-XXXX).`
        : "MÉDIATHÈQUE VIDE : réponds IMAGE: aucune"),
    messages: [{ role: "user", content: `Rédige un article sur : ${topic}` }],
  });

  const raw = res.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("")
    .trim();

  const title = raw.match(/^TITRE:\s*(.+)$/m)?.[1]?.trim() || topic.slice(0, 80);
  const category = raw.match(/^THEME:\s*(.+)$/m)?.[1]?.trim() || "Article";
  const excerpt = raw.match(/^RESUME:\s*(.+)$/m)?.[1]?.trim() || "";
  const imgRaw = raw.match(/^IMAGE:\s*(.+)$/m)?.[1]?.trim() || "";
  const image = mediaUrls.includes(imgRaw) ? imgRaw : fallbackImage;
  const body = (raw.split(/^CORPS:\s*$/m)[1] ?? raw).trim();

  return { title, category, excerpt, body, image, generated: true };
}

// Rédige une newsletter complète (appel modèle unique). Sans clé API, renvoie
// un gabarit à compléter — le brouillon existe quand même.
export async function draftNewsletter(
  topic: string,
): Promise<{ subject: string; body: string; generated: boolean }> {
  const apiKey = getSetting("anthropicApiKey");
  if (!apiKey) {
    return {
      generated: false,
      subject: `[À rédiger] ${topic.slice(0, 70)}`,
      body: `Bonjour,\n\n## ${topic}\n\n_(Alfred n'a pas pu rédiger : clé API non configurée — voir Réglages.)_\n\n- Point clé 1\n- Point clé 2\n\nBonne lecture,\n\nL'équipe Trevys`,
    };
  }

  const { default: AnthropicSDK } = await import("@anthropic-ai/sdk");
  const client = new AnthropicSDK({ apiKey });

  const res = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    system:
      `${alfredSystemBlock()}\n\nCONNAISSANCE DU SITE :\n${siteKnowledgeBlock()}\n\n` +
      `Tu rédiges une newsletter e-mail pour les clients du cabinet (dirigeants, DAF). Ton chaleureux et utile, format court (300-500 mots), avec des liens vers les articles du site quand c'est pertinent. Réponds EXACTEMENT dans ce format, sans rien d'autre :\n` +
      `SUJET: <objet de l'e-mail>\nCORPS:\n<contenu Markdown : salutation, ## sous-titres, listes, [liens](https://www.trevys.fr/...), signature « L'équipe Trevys »>`,
    messages: [{ role: "user", content: `Rédige une newsletter sur : ${topic}` }],
  });

  const raw = res.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("")
    .trim();

  const subject = raw.match(/^SUJET:\s*(.+)$/m)?.[1]?.trim() || topic.slice(0, 70);
  const body = (raw.split(/^CORPS:\s*$/m)[1] ?? raw).trim();
  return { subject, body, generated: true };
}

// Rédige un e-mail de refus de candidature, courtois et personnalisé
// (appel modèle unique). Renvoie null sans clé API — l'appelant applique
// alors son modèle standard.
export async function draftRejectionEmail(input: {
  name: string;
  jobTitle: string;
  message?: string;
  experience?: string;
  skills?: string[];
}): Promise<string | null> {
  const apiKey = getSetting("anthropicApiKey");
  if (!apiKey) return null;

  try {
    const { default: AnthropicSDK } = await import("@anthropic-ai/sdk");
    const client = new AnthropicSDK({ apiKey });
    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system:
        `${alfredSystemBlock()}\n\nTu rédiges un e-mail de refus de candidature au nom du cabinet Trevys. ` +
        `Exigences : courtois, chaleureux, personnalisé (mentionne un élément positif du profil si les informations le permettent), sans fausse promesse ni motif détaillé du refus, sans jugement. ` +
        `Structure : salutation avec le prénom, remerciement, décision claire mais bienveillante, mot d'encouragement, proposition de conserver la candidature, signature « L'équipe Trevys ». ` +
        `Réponds UNIQUEMENT avec le corps de l'e-mail en texte simple (pas de Markdown, pas d'objet, pas de commentaire), 120 mots maximum.`,
      messages: [
        {
          role: "user",
          content:
            `Candidat : ${input.name}\nPoste : ${input.jobTitle}\nExpérience : ${input.experience ?? "non précisée"}\n` +
            `Compétences : ${input.skills?.join(", ") ?? "non précisées"}\nExtrait du message du candidat : ${(input.message ?? "").slice(0, 600)}`,
        },
      ],
    });
    const text = res.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("")
      .trim();
    return text || null;
  } catch {
    return null;
  }
}

// Objets d'e-mail de secours, chaleureux et pas trop sérieux.
const FUN_SUBJECTS = [
  "☕ 3 minutes de lecture pour prendre une longueur d'avance",
  "Votre pause chiffres & idées — signée Trevys",
  "Ce que votre expert-comptable a repéré pour vous cette semaine",
  "Des chiffres, des idées, zéro jargon",
  "Un petit récap qui vaut le détour",
];

// Propose un objet d'e-mail accrocheur pour une newsletter.
export async function suggestSubject(body: string): Promise<string> {
  const apiKey = getSetting("anthropicApiKey");
  const fallback = FUN_SUBJECTS[Math.floor(Math.random() * FUN_SUBJECTS.length)];
  if (!apiKey) return fallback;

  try {
    const { default: AnthropicSDK } = await import("@anthropic-ai/sdk");
    const client = new AnthropicSDK({ apiKey });
    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 100,
      system:
        `${alfredSystemBlock()}\n\nTu proposes UNIQUEMENT un objet d'e-mail pour la newsletter du cabinet : court (max 60 caractères), accrocheur, chaleureux, pas trop sérieux (un emoji discret autorisé), sans guillemets ni commentaire. Réponds avec l'objet seul.`,
      messages: [{ role: "user", content: `Contenu de la newsletter :\n${body.slice(0, 4000)}` }],
    });
    const subject = res.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("")
      .trim()
      .replace(/^["«\s]+|["»\s]+$/g, "");
    return subject || fallback;
  } catch {
    return fallback;
  }
}

// Modifie un contenu Markdown selon une instruction (appel modèle unique).
// Renvoie le texte révisé, prêt à relire. Sans clé API, lève une erreur claire.
export async function reviseText(content: string, instruction: string): Promise<string> {
  const apiKey = getSetting("anthropicApiKey");
  if (!apiKey) {
    throw new Error("Alfred n'est pas configuré (clé API manquante — voir Réglages).");
  }

  const { default: AnthropicSDK } = await import("@anthropic-ai/sdk");
  const client = new AnthropicSDK({ apiKey });

  const res = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system:
      `${alfredSystemBlock()}\n\n---\n\nCONNAISSANCE DU SITE :\n${siteKnowledgeBlock()}\n\n---\n\nTu es l'assistant de rédaction du cabinet. On te donne un contenu d'article en Markdown et une instruction de modification. ` +
      `Renvoie UNIQUEMENT le contenu Markdown complet révisé (aucun commentaire, aucune balise de code, aucune explication). ` +
      `Conserve la mise en forme Markdown (## sous-titres, listes, gras, liens, images) et le ton « maison ». Si l'instruction ne concerne qu'une partie, ne réécris pas le reste inutilement.`,
    messages: [
      {
        role: "user",
        content: `Instruction : ${instruction}\n\n--- CONTENU ACTUEL ---\n${content || "(vide)"}`,
      },
    ],
  });

  const revised = res.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("")
    .trim();

  return revised || content;
}

export async function runCommsAgent(history: ChatTurn[]): Promise<AgentResult> {
  const apiKey = getSetting("anthropicApiKey");
  if (!apiKey) {
    return {
      reply:
        "L'assistant IA n'est pas encore configuré (clé ANTHROPIC_API_KEY manquante côté serveur).",
      actions: [],
    };
  }

  const { default: AnthropicSDK } = await import("@anthropic-ai/sdk");
  const client = new AnthropicSDK({ apiKey });

  // messages: on démarre à partir de l'historique texte.
  const messages: Anthropic.MessageParam[] = history.map((h) => ({
    role: h.role,
    content: h.content,
  }));

  const actions: string[] = [];
  let text = "";

  for (let step = 0; step < 6; step++) {
    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: buildSystem(),
      tools: TOOLS,
      messages,
    });

    for (const block of res.content) {
      if (block.type === "text") text += block.text;
    }

    if (res.stop_reason !== "tool_use") break;

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of res.content) {
      if (block.type === "tool_use") {
        const out = await runTool(block.name, block.input as Record<string, unknown>, actions);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: out });
      }
    }
    messages.push({ role: "assistant", content: res.content });
    messages.push({ role: "user", content: toolResults });
  }

  return { reply: text.trim() || "C'est fait.", actions };
}
