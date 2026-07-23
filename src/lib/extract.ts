// Extraction de texte depuis des documents (PDF, Word .docx, texte) et des
// pages web, pour nourrir la base de connaissance d'Alfred.

const MAX_CHARS = 40_000; // borne de sécurité par document

function clean(s: string): string {
  return s.replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_CHARS);
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

// PDF via pdf-parse.
async function fromPdf(buf: Buffer): Promise<string> {
  // pdf-parse v2 : classe PDFParse({ data }) puis getText().
  const mod = (await import("pdf-parse")) as unknown as {
    PDFParse: new (opts: { data: Uint8Array }) => {
      getText: () => Promise<{ text: string }>;
      destroy?: () => Promise<void> | void;
    };
  };
  const parser = new mod.PDFParse({ data: new Uint8Array(buf) });
  try {
    const result = await parser.getText();
    return clean(result.text || "");
  } finally {
    await parser.destroy?.();
  }
}

// Word .docx : c'est un ZIP ; on lit word/document.xml et on retire les balises.
async function fromDocx(buf: Buffer): Promise<string> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buf);
  const doc = zip.file("word/document.xml");
  if (!doc) return "";
  const xml = await doc.async("string");
  const text = xml
    .replace(/<\/w:p>/g, "\n")
    .replace(/<w:tab[^>]*\/>/g, "\t")
    .replace(/<[^>]+>/g, "");
  return clean(decodeEntities(text));
}

export async function extractFromBuffer(
  buf: Buffer,
  filename: string,
  mime: string,
): Promise<string> {
  const ext = filename.toLowerCase().split(".").pop() || "";
  if (mime.includes("pdf") || ext === "pdf") return fromPdf(buf);
  if (ext === "docx" || mime.includes("officedocument.wordprocessing")) return fromDocx(buf);
  if (ext === "txt" || ext === "md" || mime.startsWith("text/")) return clean(buf.toString("utf8"));
  throw new Error("Format non pris en charge (PDF, Word .docx, .txt ou .md).");
}

// Page web : on récupère le HTML et on extrait le texte principal.
export async function extractFromUrl(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "TrevysBot/1.0" } });
  if (!res.ok) throw new Error(`Impossible de charger la page (${res.status}).`);
  const html = await res.text();
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]{2,}/g, " ");
  return clean(decodeEntities(body));
}
