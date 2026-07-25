import { saveUpload } from "@/lib/media";
import { extractFromBuffer } from "@/lib/extract";
import { addKnowledge } from "@/lib/alfred-config";

// Guichet unique de la GED d'Alfred : un fichier arrive (trombone du chat,
// pièce jointe Telegram), on le range au bon endroit.
// - Image → médiathèque (/uploads) : utilisable en couverture/illustration.
// - PDF / Word / texte → texte extrait puis ajouté à la base de connaissance.
export type IngestResult =
  | { kind: "image"; url: string; message: string }
  | { kind: "doc"; title: string; chars: number; message: string }
  | { kind: "error"; message: string };

const IMG_MIME = /^image\//i;
const IMG_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

export async function ingestFile(
  buffer: Buffer,
  filename: string,
  mime: string,
  source: string,
): Promise<IngestResult> {
  const name = filename || "document";
  try {
    if (IMG_MIME.test(mime) || IMG_EXT.test(name)) {
      const item = await saveUpload(buffer, name, mime || "image/jpeg");
      return {
        kind: "image",
        url: item.url,
        message: `Image « ${name} » rangée dans la médiathèque (${item.url}). Je peux l'utiliser pour illustrer articles et posts.`,
      };
    }

    const text = await extractFromBuffer(buffer, name, mime);
    if (!text || text.trim().length < 40) {
      return {
        kind: "error",
        message: `Je n'ai pas réussi à lire « ${name} » (formats acceptés : PDF, Word .docx, texte, ou une image).`,
      };
    }
    addKnowledge(name, source, text);
    return {
      kind: "doc",
      title: name,
      chars: text.length,
      message: `Document « ${name} » ajouté à ma base de connaissance (${Math.round(text.length / 1000)} k caractères lus). J'en tiendrai compte dans mes prochains articles et posts.`,
    };
  } catch (e) {
    return { kind: "error", message: `Échec du traitement de « ${name} » : ${(e as Error).message}` };
  }
}
