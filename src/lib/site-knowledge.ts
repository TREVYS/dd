import { getAllPosts } from "@/lib/blog";
import { listVideos } from "@/lib/videos";
import { listUploads } from "@/lib/media";
import { TEAM } from "@/lib/team";
import { CONSULTANTS } from "@/lib/consultants";
import { listItems } from "@/lib/editorial";
import { listPosts } from "@/lib/social-posts";

// Connaissance vivante du site pour Alfred : plan des pages, articles, vidéos,
// médias, équipe, écosystème, et état de la communication. Recomposée à chaque
// appel — Alfred connaît donc toujours l'état réel de « sa maison ».

const PAGES = `- / — Accueil : « L'expertise du chiffre, la vitesse de la technologie », les 2 métiers, l'écosystème.
- /expertise-comptable — Métier 1 : approche partenaire, 4 pôles (comptabilité, audit, contrôle de gestion, juridique & fiscal), fonctionnement (équipe dédiée, interlocuteur unique), missions, bénéfices, outils (Tiime, Pennylane, Sage, Cegid, Oracle, Power BI).
- /consulting — Métier 2 : transformation, SI Finance, projets ERP, facturation électronique ; cartes consultants (prénoms seuls).
- /intelligence-artificielle — Expertise : intégrateur IA 360° (sécurité IT, architecture, RAG, données), pourquoi Trevys s'empare de ces sujets.
- /facturation-electronique — Expertise phare : chef d'orchestre de la réforme (RFE), calendrier 2026-2027, 4 flux, formats, méthode en 5 phases, FAQ. Guide RFE téléchargeable.
- /audit-organisationnel — Expertise : processus, contrôle interne, gouvernance, gros pavé Piste d'Audit Fiable (PAF, art. 289 VII CGI).
- /le-cabinet — Genèse (fondé en 2018 par John Lévy), mission, valeurs, les 4 associés.
- /le-cabinet/<slug> — Fiches associés (résumé, grands chantiers, apport).
- /notre-ecosysteme — Groupe TREVYS : KLARE STUDIO (pilotage prédictif), WELL&WIZ (conseil & freelances), URCA (commissariat aux comptes), SONAM IA (ESN consultants IA). Partenaires : PHOENIX (Dakar), DECA Paris (droit social), NewTech (automatisation & LLM).
- /references — Logos et références clients.
- /blog — Ressources : articles + vidéos (fenêtre de lecture).
- /rendez-vous — Prise de rendez-vous (Calendly).
- /espace-client — Accès espace client.
- /contact — Contact. Adresse : 1 rue Le Nôtre, 75116 Paris. E-mail : contact@trevys-advisory.fr.`;

function cap(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function siteKnowledgeBlock(): string {
  const parts: string[] = [];

  parts.push(`PLAN DU SITE (www.trevys.fr) :\n${PAGES}`);

  // Articles publiés.
  try {
    const posts = getAllPosts();
    const lines = posts
      .slice(0, 80)
      .map((p) => `- [${p.category}] « ${p.title} » (/blog/${p.slug}, ${p.date})${p.excerpt ? ` — ${cap(p.excerpt, 140)}` : ""}`);
    parts.push(`ARTICLES PUBLIÉS (${posts.length}) :\n${lines.join("\n")}`);
  } catch { /* ignore */ }

  // Vidéos.
  try {
    const videos = listVideos();
    if (videos.length) {
      parts.push(
        `VIDÉOS EN LIGNE (Ressources) :\n${videos
          .map((v) => `- « ${v.title} » (${v.focus}) — https://youtu.be/${v.youtubeId}${v.note ? ` — ${v.note}` : ""}`)
          .join("\n")}`,
      );
    }
  } catch { /* ignore */ }

  // Médiathèque.
  try {
    const media = listUploads();
    if (media.length) {
      parts.push(
        `MÉDIATHÈQUE (${media.length} fichiers, utilisables dans les articles via leur URL) :\n${media
          .slice(0, 60)
          .map((m) => `- ${m.url}`)
          .join("\n")}`,
      );
    }
  } catch { /* ignore */ }

  // Équipe & consultants.
  try {
    parts.push(
      `ASSOCIÉS (slug entre parenthèses) :\n${TEAM.map((m) => `- ${m.name} (${m.slug}) — ${m.role} — apport : ${m.apport}`).join("\n")}\n\nCONSULTANTS (prénom, slug) : ${CONSULTANTS.map((c) => `${c.firstName} (${c.slug})`).join(", ")}.`,
    );
  } catch { /* ignore */ }

  // État de la communication (calendrier + file réseaux).
  try {
    const cal = listItems();
    const social = listPosts();
    const drafts = cal.filter((i) => i.status === "brouillon").length;
    const planned = cal.filter((i) => i.status === "planifie").length;
    const queue = social.filter((p) => p.status !== "publie").length;
    parts.push(
      `ÉTAT DE LA COMMUNICATION : ${cal.length} éléments au calendrier éditorial (${drafts} brouillons, ${planned} planifiés), ${queue} posts réseaux en attente.`,
    );
  } catch { /* ignore */ }

  const block = parts.join("\n\n");
  // Garde-fou de taille (le savoir documentaire d'Alfred s'ajoute par ailleurs).
  return cap(block, 18_000);
}
