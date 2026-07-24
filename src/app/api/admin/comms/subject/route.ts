import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { suggestSubject } from "@/lib/comms-agent";

export const runtime = "nodejs";

// Propose un objet d'e-mail accrocheur pour le contenu fourni.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const { body } = (await req.json()) as { body?: string };
    const subject = await suggestSubject(body ?? "");
    return NextResponse.json({ subject });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
