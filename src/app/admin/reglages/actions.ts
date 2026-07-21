"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { disconnect, type Provider } from "@/lib/social";

export async function disconnectSocialAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  const provider = formData.get("provider") as Provider;
  disconnect(provider);
  revalidatePath("/admin/reglages");
}
