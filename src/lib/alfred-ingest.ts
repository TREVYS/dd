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
const ZIP_MIME = /zip/i;
const ZIP_EXT = /\.zip$/i;
const MAX_ZIP_ENTRIES = 25;

// ZIP : on déballe et on range chaque fichier utile (récursif, borné).
async function ingestZip(buffer: Buffer, zipName: string, source: string): Promise<IngestResult> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);
  const entries = Object.values(zip.files)
    .filter((f) => !f.dir && !f.name.startsWith("__MACOSX") && !f.name.split("/").pop()!.startsWith("."))
    .slice(0, MAX_ZIP_ENTRIES);
  if (entries.length === 0) return { kind: "error", message: `L'archive « ${zipName} » est vide.` };

  let docs = 0, images = 0, skipped = 0;
  for (const entry of entries) {
    const name = entry.name.split("/").pop()!;
    try {
      const buf = Buffer.from(await entry.async("uint8array"));
      const r = await ingestFile(buf, name, "", `${source} (archive ${zipName})`);
      if (r.kind === "doc") docs += 1;
      else if (r.kind === "image") images += 1;
      else skipped += 1;
    } catch {
      skipped += 1;
    }
  }
  const parts = [
    docs ? `${docs} document${docs > 1 ? "s" : ""} ajouté${docs > 1 ? "s" : ""} à ma base de connaissance` : "",
    images ? `${images} image${images > 1 ? "s" : ""} rangée${images > 1 ? "s" : ""} dans la médiathèque` : "",
    skipped ? `${skipped} fichier${skipped > 1 ? "s" : ""} ignoré${skipped > 1 ? "s" : ""} (format non lisible)` : "",
  ].filter(Boolean);
  if (!docs && !images) {
    return { kind: "error", message: `Archive « ${zipName} » : aucun fichier lisible (PDF, Word, texte, images).` };
  }
  return { kind: "doc", title: zipName, chars: 0, message: `Archive « ${zipName} » traitée : ${parts.join(", ")}.` };
}

export async function ingestFile(
  buffer: Buffer,
  filename: string,
  mime: string,
  source: string,
): Promise<IngestResult> {
  const name = filename || "document";
  try {
    if (ZIP_MIME.test(mime) || ZIP_EXT.test(name)) {
      return await ingestZip(buffer, name, source);
    }
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
        message: `Je n'ai pas réussi à lire « ${name} » (formats acceptés : PDF, Word .docx, PowerPoint .pptx, texte, ou une image).`,
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
