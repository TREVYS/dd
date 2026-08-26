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
      metier: (formData.get("metier") as string) ?? "",
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
  if (slugs.length === 0 || !["delete", "unpublish", "category", "image"].includes(op)) {
    redirect("/admin/articles");
  }

  // Modifications groupées : thème ou image de couverture, sans toucher au reste.
  if (op === "category" || op === "image") {
    const value = String(formData.get(op === "category" ? "newCategory" : "newImage") ?? "").trim();
    if (!value) redirect("/admin/articles");
    if (op === "image") {
      const { listUploads } = await import("@/lib/media");
      if (!listUploads().some((m) => m.url === value)) redirect("/admin/articles");
    }
    const { getRawArticle, saveArticle } = await import("@/lib/content-admin");
    for (const slug of slugs) {
      const a = getRawArticle(slug);
      if (!a) continue;
      if (op === "category") a.category = value;
      else a.image = value;
      saveArticle({ ...a, slug }, slug);
    }
  } else if (op === "unpublish") {
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

// Pouce haut / pouce bas sur une création d'Alfred : mémorisé et réinjecté
// dans ses consignes pour qu'il apprenne les goûts de John.
export async function alfredFeedbackAction(formData: FormData) {
  await requireUser();
  const { addFeedback } = await import("@/lib/alfred-feedback");
  const kind = String(formData.get("kind") ?? "post");
  addFeedback({
    id: String(formData.get("refId") ?? ""),
    kind: (["post", "article", "newsletter", "visuel"].includes(kind) ? kind : "post") as
      import("@/lib/alfred-feedback").FeedbackKind,
    verdict: formData.get("verdict") === "down" ? "down" : "up",
    excerpt: String(formData.get("excerpt") ?? ""),
  });
  const back = String(formData.get("back") ?? "");
  if (back.startsWith("/admin")) {
    revalidatePath(back.split("?")[0]);
    redirect(back);
  }
}
