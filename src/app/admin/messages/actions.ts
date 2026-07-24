"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { markMessageRead, removeMessage } from "@/lib/contact-messages";

async function guard() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

export async function markMessageReadAction(formData: FormData) {
  await guard();
  markMessageRead(formData.get("id") as string);
  revalidatePath("/admin/messages");
}

export async function deleteMessageAction(formData: FormData) {
  await guard();
  removeMessage(formData.get("id") as string);
  revalidatePath("/admin/messages");
}
