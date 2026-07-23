import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { reviseText } from "@/lib/comms-agent";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { content, instruction } = (await req.json()) as {
      content?: string;
      instruction?: string;
    };
    if (!instruction || !instruction.trim()) {
      return NextResponse.json({ error: "Instruction manquante." }, { status: 400 });
    }
    const revised = await reviseText(content ?? "", instruction);
    return NextResponse.json({ content: revised });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
