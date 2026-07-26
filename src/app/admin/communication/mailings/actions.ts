"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { removeCampaign } from "@/lib/newsletter-campaigns";

export async function deleteDraftCampaignAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  const id = String(formData.get("id") ?? "");
  if (id) removeCampaign(id);
  revalidatePath("/admin/communication/mailings");
  revalidatePath("/admin/communication/newsletter");
}
