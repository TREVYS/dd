"use server";

import { parisToday } from "@/lib/dates";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { saveArticle, deleteArticle } from "@/lib/content-admin";
import { saveLegalDoc } from "@/lib/legal";

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

export async function saveArticleAction(formData: FormData) {
  await requireUser();
  const originalSlug = (formData.get("originalSlug") as string) || undefined;
  const slug = saveArticle(
    {
      slug: (formData.get("slug") as string) || undefined,
      title: (formData.get("title") as string) ?? "",
      date: (formData.get("date") as string) ?? "",
      category: (formData.get("category") as string) ?? "",
      excerpt: (formData.get("excerpt") as string) ?? "",
      author: (formData.get("author") as string) ?? "",
      image: (formData.get("image") as string) ?? "",
      body: (formData.get("body") as string) ?? "",
    },
    originalSlug,
  );
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function deleteArticleAction(formData: FormData) {
  await requireUser();
  deleteArticle(formData.get("slug") as string);
  revalidatePath("/blog");
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

// Action groupée sur une sélection d'articles : suppression, ou dépublication
// (l'article quitte le blog et redevient un brouillon à retravailler).
export async function bulkArticlesAction(formData: FormData) {
  await requireUser();
  const slugs = formData.getAll("slugs").map(String).filter(Boolean);
  const op = String(formData.get("op") ?? "");
  if (slugs.length === 0 || !["delete", "unpublish"].includes(op)) {
    redirect("/admin/articles");
  }

  if (op === "unpublish") {
    const { getRawArticle } = await import("@/lib/content-admin");
    const { addItem } = await import("@/lib/editorial");
    for (const slug of slugs) {
      const a = getRawArticle(slug);
      if (!a) continue;
      addItem({
        date: parisToday(),
        type: "article",
        title: a.title,
        status: "brouillon",
        category: a.category || "Article",
        excerpt: a.excerpt || "",
        image: a.image || undefined,
        body: a.body || "",
      });
      deleteArticle(slug);
    }
  } else {
    for (const slug of slugs) deleteArticle(slug);
  }

  revalidatePath("/blog");
  revalidatePath("/admin/articles");
  revalidatePath("/admin/communication/calendrier");
  redirect(`/admin/articles?bulk=${op}&n=${slugs.length}`);
}

export async function saveLegalAction(formData: FormData) {
  await requireUser();
  const slug = formData.get("slug") as string;
  saveLegalDoc(slug, (formData.get("title") as string) ?? "", (formData.get("body") as string) ?? "");
  revalidatePath(`/${slug}`);
  revalidatePath("/admin/legal");
  redirect("/admin/legal");
}
