import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listUploads, saveUpload, deleteUpload } from "@/lib/media";

export const runtime = "nodejs";

async function guard() {
  const session = await auth();
  return !!session?.user;
}

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  return NextResponse.json({ items: listUploads() });
}

export async function POST(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const form = await req.formData();
    const files = form.getAll("file").filter((f): f is File => f instanceof File);
    if (files.length === 0) return NextResponse.json({ error: "Aucun fichier." }, { status: 400 });

    const saved = [];
    for (const file of files) {
      const buf = Buffer.from(await file.arrayBuffer());
      saved.push(await saveUpload(buf, file.name, file.type));
    }
    return NextResponse.json({ items: saved });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const name = new URL(req.url).searchParams.get("name");
  if (!name) return NextResponse.json({ error: "Nom manquant." }, { status: 400 });
  const ok = deleteUpload(name);
  return NextResponse.json({ ok });
}
