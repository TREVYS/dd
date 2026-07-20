"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  saveArticle,
  deleteArticle,
  savePage,
  deletePage,
} from "@/lib/content-admin";

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

export async function savePageAction(formData: FormData) {
  await requireUser();
  const originalSlug = (formData.get("originalSlug") as string) || undefined;
  const slug = savePage(
    {
      slug: (formData.get("slug") as string) || undefined,
      title: (formData.get("title") as string) ?? "",
      description: (formData.get("description") as string) ?? "",
      body: (formData.get("body") as string) ?? "",
    },
    originalSlug,
  );
  revalidatePath(`/p/${slug}`);
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function deletePageAction(formData: FormData) {
  await requireUser();
  deletePage(formData.get("slug") as string);
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}
