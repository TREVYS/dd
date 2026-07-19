# Site public Trevys (`(marketing)`)

Site vitrine public servi à la racine `/`. L'ERP TREVYS OS vit sous `/app`.
Design « liquid glass » scopé sous `.mkt` (voir `marketing.css`) — n'impacte pas
l'ERP (Tailwind / `globals.css`).

## Pages

`/`, `/expertise-comptable`, `/consulting`, `/facturation-electronique`,
`/le-cabinet`, `/notre-ecosysteme`, `/references`, `/blog`, `/blog/[slug]`,
`/contact`, `/mentions-legales`.

## Back-office blog (MDX)

Un article = un fichier `content/blog/<slug>.mdx` :

```mdx
---
title: "Titre de l'article"
date: "2025-09-04"        # ISO — sert au tri et au sitemap
category: "Facturation électronique"
excerpt: "Résumé affiché dans la liste et les métadonnées."
author: "Trevys"
---

## Un sous-titre

Le corps en **Markdown / MDX** : titres, listes, > citations, [liens](https://…).
```

Le fichier apparaît automatiquement dans `/blog`, obtient sa page `/blog/<slug>`
(prégénérée), ses métadonnées et son entrée `sitemap.xml`.

## Pages légales (éditables)

Comme le blog, les pages légales sont en MDX : `content/legal/<slug>.mdx`
(frontmatter `title`, `updated`). `/mentions-legales` rend
`content/legal/mentions-legales.mdx`. Éditer = modifier le fichier.

## Logo Ordre des Experts-Comptables

Rendu vectoriel de substitution dans `_components/oec-logo.tsx`. Pour le logo
officiel exact, déposer `public/brand/oec.svg` (ou `.png`) et remplacer le
composant par une balise `<img>`.

## SEO

`generateMetadata` par page, `metadataBase`, Open Graph, JSON-LD
(`AccountingService` global + `BlogPosting` par article), `app/sitemap.ts`,
`app/robots.ts`.

## Formulaire de contact & anti-spam

`contact/actions.ts` (Server Action) : honeypot + contrôle de délai +
vérification **Turnstile** (si `TURNSTILE_SECRET_KEY`) + envoi **nodemailer**
(si `SMTP_*`). Variables à définir : voir `.env.example` à la racine.

## À compléter (éléments fournis par le cabinet)

- **Logos clients** : actuellement en toutes-lettres dans `references/page.tsx`.
  Pour afficher les vrais visuels, déposer les PNG dans
  `public/brand/clients/` et remplacer le rendu texte par des `<img>`.
- **Logo Trevys** : recréé en vectoriel dans `_components/brand.tsx`. Pour le
  logo exact, fournir le PNG/SVG et l'y intégrer.
