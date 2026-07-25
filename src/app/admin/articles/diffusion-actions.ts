"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { addPost } from "@/lib/social-posts";
import { draftSocialPost } from "@/lib/comms-agent";

// Depuis un article, prépare des brouillons de posts (LinkedIn/Instagram) avec
// une image de « front » propre à chaque réseau. Alfred rédige le texte si la
// clé API est configurée, sinon un gabarit est créé.
export async function diffuseArticleAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");

  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const topic = excerpt ? `${title} — ${excerpt}` : title;

  const scheduledDate = String(formData.get("scheduledDate") ?? "").trim();
  const status = scheduledDate ? "planifie" : "brouillon";

  const nets: Array<{ id: "linkedin" | "instagram"; image: string }> = [];
  if (formData.get("net_linkedin")) nets.push({ id: "linkedin", image: String(formData.get("img_linkedin") ?? "") });
  if (formData.get("net_instagram")) nets.push({ id: "instagram", image: String(formData.get("img_instagram") ?? "") });

  for (const n of nets) {
    // Si la rédaction par Alfred échoue (API indisponible, quota…), on crée
    // quand même un brouillon-gabarit : l'utilisateur n'est jamais bloqué.
    let content: string;
    try {
      content = (await draftSocialPost(topic, n.id)).content;
    } catch (e) {
      console.error(`[diffusion] échec de rédaction Alfred (${n.id}):`, e);
      content =
        `✍️ [Brouillon à compléter — Alfred n'a pas pu rédiger]\n\n${topic}\n\n` +
        `👉 Lire l'article : https://www.trevys.fr/blog\n\n#Trevys #ExpertiseComptable`;
    }
    addPost({
      network: n.id,
      content,
      image: n.image || undefined,
      status,
      scheduledDate: scheduledDate || undefined,
    });
  }

  redirect("/admin/communication/reseaux");
}
