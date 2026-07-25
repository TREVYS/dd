import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ingestFile } from "@/lib/alfred-ingest";

export const runtime = "nodejs";

// Trombone du chat Alfred : réception d'un fichier (image, PDF, Word, texte)
// et rangement automatique (médiathèque ou base de connaissance).
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const fd = await req.formData();
  const f = fd.get("file");
  if (!(f instanceof File) || f.size === 0) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  const isZip = /\.zip$/i.test(f.name) || /zip/i.test(f.type);
  const cap = isZip ? 15 * 1024 * 1024 : 8 * 1024 * 1024;
  if (f.size > cap) {
    return NextResponse.json({ error: `Fichier trop volumineux (${isZip ? 15 : 8} Mo max).` }, { status: 400 });
  }

  const buf = Buffer.from(await f.arrayBuffer());
  const result = await ingestFile(buf, f.name, f.type, "Cockpit — chat Alfred");
  if (result.kind === "error") return NextResponse.json({ error: result.message }, { status: 422 });
  return NextResponse.json(result);
}
