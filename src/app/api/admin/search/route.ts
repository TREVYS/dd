import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllPosts } from "@/lib/blog";
import { listItems } from "@/lib/editorial";
import { listPosts } from "@/lib/social-posts";
import { listCampaigns } from "@/lib/newsletter-campaigns";
import { listSubscribers } from "@/lib/newsletter";
import { listApplications } from "@/lib/jobs";
import { listJobs } from "@/lib/jobs";
import { listMessages } from "@/lib/contact-messages";

export const runtime = "nodejs";

type Hit = { group: string; label: string; sub?: string; href: string };

// Recherche globale du cockpit : articles, brouillons, posts, newsletters,
// candidatures, offres, messages, inscrits — tout au même endroit.
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ hits: [] }, { status: 401 });

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ hits: [] });

  const has = (...fields: (string | undefined)[]) =>
    fields.some((f) => f && f.toLowerCase().includes(q));
  const hits: Hit[] = [];
  const push = (h: Hit) => hits.length < 24 && hits.push(h);

  try {
    for (const p of getAllPosts()) {
      if (has(p.title, p.excerpt, p.category)) {
        push({ group: "Articles", label: p.title, sub: p.category, href: `/admin/articles/${p.slug}` });
      }
    }
  } catch { /* source indisponible */ }

  try {
    for (const i of listItems().filter((x) => x.status === "brouillon")) {
      if (has(i.title, i.excerpt)) {
        push({ group: "Brouillons d'articles", label: i.title, sub: i.date, href: `/admin/communication/calendrier/${i.id}` });
      }
    }
  } catch { /* source indisponible */ }

  try {
    for (const p of listPosts()) {
      if (has(p.content)) {
        push({
          group: "Posts réseaux",
          label: `${p.network === "linkedin" ? "LinkedIn" : "Instagram"} · ${p.content.slice(0, 60)}…`,
          sub: p.status,
          href: "/admin/communication/reseaux",
        });
      }
    }
  } catch { /* source indisponible */ }

  try {
    for (const c of listCampaigns()) {
      if (has(c.subject, c.body)) {
        push({ group: "Newsletters", label: c.subject, sub: c.status === "envoye" ? "envoyée" : "brouillon", href: `/admin/communication/newsletter/${c.id}` });
      }
    }
  } catch { /* source indisponible */ }

  try {
    for (const a of listApplications()) {
      if (has(a.name, a.email, a.jobTitle, a.skills?.join(" "))) {
        push({ group: "Candidatures", label: a.name, sub: a.jobTitle, href: "/admin/recrutement" });
      }
    }
    for (const j of listJobs()) {
      if (has(j.title, j.summary)) {
        push({ group: "Offres d'emploi", label: j.title, sub: j.status === "publie" ? "publiée" : "brouillon", href: "/admin/recrutement" });
      }
    }
  } catch { /* source indisponible */ }

  try {
    for (const m of listMessages()) {
      if (has(m.firstName, m.lastName, m.email, m.subject, m.message)) {
        push({ group: "Messages reçus", label: `${m.firstName} ${m.lastName}`, sub: m.subject || m.email, href: "/admin/messages" });
      }
    }
  } catch { /* source indisponible */ }

  try {
    for (const s of listSubscribers()) {
      if (has(s.email)) {
        push({ group: "Inscrits newsletter", label: s.email, sub: s.source, href: "/admin/communication/newsletter" });
      }
    }
  } catch { /* source indisponible */ }

  return NextResponse.json({ hits });
}
