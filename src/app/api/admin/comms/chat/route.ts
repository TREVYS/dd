import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runCommsAgent, type ChatTurn } from "@/lib/comms-agent";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { history } = (await req.json()) as { history: ChatTurn[] };
    const clean = (history ?? [])
      .filter((h) => (h.role === "user" || h.role === "assistant") && typeof h.content === "string")
      .slice(-20);
    const result = await runCommsAgent(clean);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
