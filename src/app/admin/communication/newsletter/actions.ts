"use server";

import { revalidatePath } from "next/cache";
import { markAllRead } from "@/lib/newsletter";

export async function markNewsletterReadAction() {
  markAllRead();
  revalidatePath("/admin/communication/newsletter");
}
