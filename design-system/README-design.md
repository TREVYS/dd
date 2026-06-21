# TREVYS OS — Design System (extraction fidèle)

Ce dossier est une extraction **exhaustive et fidèle** du design existant de
l'ERP TREVYS OS (Next.js 16 + Tailwind CSS v4). Aucune valeur n'a été
inventée : chaque token, chaque pattern de composant et chaque asset listé
ici provient directement du code source de l'application
(`src/app/globals.css`, `src/components/*`, pages `src/app/**`).

L'objectif est de permettre la reproduction fidèle du même look & feel dans
un autre projet, même non-Next.js / non-Tailwind.

---

## 1. Ce que l'ERP utilise réellement (résumé technique)

- **Framework** : Next.js 16 (App Router), React, TypeScript.
- **CSS** : Tailwind CSS v4 (`@import "tailwindcss"` + `@theme inline`, pas de
  `tailwind.config.js` — la config se fait en CSS natif).
- **Pas de bibliothèque de composants UI** (pas de shadcn/ui, MUI, etc.).
  Chaque page recompose des utilitaires Tailwind directement dans le JSX.
  → C'est pourquoi `components.css` "remonte" ces patterns répétés en
  classes nommées, pour qu'un autre projet n'ait pas à les redécouvrir.
- **Icônes** : [lucide-react](https://lucide.dev) exclusivement, importées à
  l'unité (`import { Bell } from "lucide-react"`). Pas de sprite SVG, pas
  d'icon-font.
- **Polices** : [Geist Sans / Geist Mono](https://vercel.com/font), chargées
  via `next/font/google`, exposées comme variables CSS `--font-geist-sans` /
  `--font-geist-mono`.
- **Graphiques** : [Recharts](https://recharts.org) pour les charts (barres).
- **Effet visuel signature** : glassmorphism (fonds semi-transparents +
  `backdrop-filter: blur()`) sur fond avec halos radiaux violet/bleu/rose.

---

## 2. Fichiers de ce dossier

| Fichier | Contenu |
|---|---|
| `tokens.css` | Toutes les variables CSS : couleurs, radius, ombres, espacements, typographie, transitions, z-index. **Source de vérité unique.** |
| `global.css` | Styles globaux : fond de page (gradients), les 3 niveaux de glassmorphism (`.glass-panel`, `.glass-panel-strong`, `.glass-nav`), dark mode. |
| `components.css` | Tous les patterns de composants UI extraits du code (boutons, formulaires, cards, tableaux, modales, sidebar, topbar, badges, alertes, loaders), avec la classe d'origine et le fichier source cité en commentaire. |
| `layout.css` | Structure de page : shell applicatif (sidebar + contenu), grilles responsives, page d'auth. |
| `responsive.css` | Breakpoints Tailwind utilisés et patterns responsive relevés dans le code. |
| `assets/brand/` | Logos (SVG + PNG), favicon, icônes d'app, toutes tailles, copiés tels quels depuis `public/brand/`. |
| `assets/icons/` | Icônes PWA (`icon-192.png`, `icon-512.png`) depuis `public/icons/`. |

**Ordre d'import recommandé (CSS pur, sans Tailwind) :**
```css
@import "tokens.css";
@import "global.css";
@import "layout.css";
@import "components.css";
@import "responsive.css";
```

Si le nouveau projet utilise Tailwind v4, `global.css` peut être utilisé tel
quel (il contient déjà le `@import "tailwindcss"` et le `@theme inline`) —
il suffit d'ajouter `components.css`, `layout.css` et `responsive.css` à la
suite dans le même fichier d'entrée.

---

## 3. Palette de couleurs

| Token | Valeur | Usage |
|---|---|---|
| `--background` | `#f4f5fb` | Fond de page (light) |
| `--foreground` | `#171221` | Texte principal (light) |
| `--brand` | `#7c3aed` | Violet de marque — boutons actifs, liens, focus ring, avatar |
| `--brand-dark` | `#3d0a9b` | Variante foncée de la marque |

Halos de fond (radial-gradient sur `<body>`) : `#ece9ff`, `#e3f1ff`, `#ffe9f5`.

Couleurs sémantiques (badges/alertes), valeurs Tailwind standard utilisées
telles quelles dans le code — `green-50/600`, `emerald-50/600/700/200`,
`amber-50/600/700/200`, `red-50/500/600/700/200`, `blue-50/600/700/200`,
`gray-50` à `gray-900`. Le détail complet est dans `tokens.css`.

**Dark mode** : pas de palette dark "repensée" — le code réécrit les mêmes
utilitaires gray/white avec des valeurs adaptées (cf. section dark mode de
`global.css`). Le fond passe sur une base `#0f0c1c` avec les mêmes halos
radiaux assombris.

---

## 4. Typographie

- Police : **Geist Sans** (texte), **Geist Mono** (code, le cas échéant).
  Ce ne sont pas des fichiers de police locaux : ils sont chargés via
  `next/font/google` dans `src/app/layout.tsx` :
  ```ts
  import { Geist, Geist_Mono } from "next/font/google";
  const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
  const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
  ```
  → **Élément à recréer** dans un projet non-Next.js : utiliser Google Fonts
  (`Geist` est disponible sur Google Fonts) ou auto-héberger les fichiers
  `.woff2` officiels de Vercel (https://vercel.com/font).

- Échelle de tailles réellement utilisée dans le code (classes Tailwind) :
  `text-xs` (12px), `text-sm` (14px, taille de base de toute l'app),
  `text-lg` (18px, titres de carte), `text-2xl` (24px, titres de page h1).
  Il n'y a pas de `text-3xl`/`text-4xl` dans l'app : les titres restent sobres.

- Poids : `font-medium` (500) et `font-semibold` (600) essentiellement.
  Pas de `font-bold` (700) relevé.

---

## 5. Espacements, bordures, radius, ombres

Voir `tokens.css` pour les valeurs exactes. Points clés :

- **Radius** : 4 paliers seulement — `rounded-lg` (8px, inputs/petits
  éléments), `rounded-xl` (12px, boutons/inputs standards), `rounded-2xl`
  (16px, **quasi tous les panels/cards**), `rounded-3xl` (24px, carte de
  login uniquement), `rounded-full` (avatars, pills, badges).
- **Espacement vertical entre sections d'une page** : `space-y-6` (quasi
  systématique sur toutes les pages applicatives).
- **Padding des cards** : `p-5` (panels standards), `p-6` (modales), `p-8`
  (carte de login, contenu principal `<main>`).
- **Ombres** : pas d'ombres "Material" classiques — uniquement les ombres
  de glassmorphism (`box-shadow: 0 8px 32px rgba(31,38,135,0.08–0.1)`) et un
  glow violet ponctuel au hover (logo sidebar) / sur l'item de nav actif.

---

## 6. Effets, transitions, responsive, dark mode

- **Transitions** : toujours courtes et discrètes — `transition` générique
  Tailwind (~150ms) sur les hovers, `duration-200` explicite sur le
  redimensionnement de la sidebar, `transition-all` sur les changements
  d'état glass.
- **Hover** : assombrissement léger des fonds clairs (`hover:bg-gray-50`,
  `hover:bg-white/60`), `hover:opacity-90` sur les boutons pleins,
  `hover:text-*` sur les liens texte.
- **Responsive** : breakpoints Tailwind par défaut (`sm`/`md`/`lg`), utilisés
  uniquement pour : passer les grilles de 2 à 4 colonnes (KPI), afficher
  deux graphiques côte à côte au lieu d'empilés, masquer le logo de la
  topbar sur mobile. **Il n'y a pas de adaptation mobile de la sidebar**
  (pas de drawer burger) — voir section 8.
- **Dark mode** : activé par une classe `.dark` sur `<html>`, pilotée par
  `localStorage.theme` (`"light" | "dark"`), togglée via un bouton
  Soleil/Lune dans la topbar (`theme-toggle.tsx` + `theme-provider.tsx`). Un
  script inline dans `<head>` applique la classe avant l'hydratation pour
  éviter le flash blanc.

---

## 7. Structure de layout de l'application

```
<html class={geistSans + geistMono}>
  <head><script>/* anti-flash dark mode */</script></head>
  <body>
    <Providers>              ← Session + ThemeProvider
      <div class="app-shell">
        <Sidebar />           ← position sticky, largeur variable (80px / 256px)
        <div class="app-content">
          <Topbar />           ← recherche globale, thème, notifications, avatar
          <main class="app-main">{page}</main>
        </div>
      </div>
    </Providers>
  </body>
</html>
```

La **sidebar** (`src/components/sidebar.tsx`) :
- Repliée par défaut (80px, icônes seules), s'élargit à 256px au survol OU
  reste élargie si "épinglée" (bouton chevron, état persisté en
  `localStorage.sidebar-pinned`).
- Quand non-épinglée, l'état élargi est en `position: absolute` par-dessus
  le contenu (ne décale pas le layout) — comportement à reproduire si on
  veut le même confort d'usage.
- Groupes de navigation avec libellé de section (HUB, CRM, Production, GED,
  Knowledge Cabinet, Assistant Juridique, Assistant IA, Paramétrage — ce
  dernier groupe conditionné par les droits).
- Bloc utilisateur en bas (avatar initiales + nom + rôle + déconnexion).

La **topbar** (`src/components/topbar.tsx`) : logo (masqué mobile),
recherche globale, toggle thème, cloche de notifications (dropdown), avatar +
nom + rôle.

---

## 8. Éléments manquants ou non récupérables tels quels

À signaler honnêtement, avec une méthode de recréation proposée :

1. **Fichiers de police Geist** : non présents en local dans le repo (chargés
   à la demande par `next/font/google`). → *Méthode* : inclure `Geist` via
   Google Fonts (`<link>` ou `@import`) ou télécharger les `.woff2` officiels
   sur vercel.com/font et les déclarer en `@font-face` dans `tokens.css`.

2. **Pas de bibliothèque de composants formalisée** : les boutons/cards/etc.
   n'existaient que comme combinaisons de classes Tailwind répétées dans
   chaque page, jamais extraites en composants React partagés. → *Méthode* :
   `components.css` fait ce travail d'extraction ; côté React, il est
   recommandé de créer de vrais composants (`Button`, `Card`, `Badge`...)
   dans le nouveau projet en s'appuyant sur ces classes (voir section 9).

3. **Pas d'adaptation mobile de la sidebar** (pas de drawer/burger menu) —
   l'ERP source est pensé desktop-first pour un usage interne cabinet.
   → *Méthode* : si le nouveau projet doit être mobile-friendly, concevoir un
   drawer plein écran sous le breakpoint `md`, en réutilisant les classes
   `.sidebar-link`, `.sidebar-group-label` existantes.

4. **Pas de Storybook ni de documentation de composants** dans le projet
   source — tout a été reconstitué par lecture du code à la date de cette
   extraction (FEC/Production/CRM/Academy/Paramétrage). Si de nouvelles pages
   ont été ajoutées après cette extraction, leurs patterns ne sont pas
   couverts ici.

5. **Logos** : récupérés tels quels (`logo-icon.svg`, `logo-full.svg`,
   variantes dark/mono/PNG multi-résolutions, favicon). Aucune retouche
   nécessaire, ce sont les fichiers sources exacts.

6. **Illustrations** : aucune illustration custom n'existe dans l'ERP source
   (uniquement logos + icônes Lucide). Les fichiers `next.svg`, `vercel.svg`,
   `file.svg`, `globe.svg`, `window.svg` présents dans `public/` sont les
   assets par défaut du template Next.js (non utilisés dans les pages de
   l'app) — **volontairement exclus** de cet export car ils ne font pas
   partie du design réel du produit.

---

## 9. Structure recommandée pour le nouveau projet

```
/design-system
  tokens.css
  global.css
  layout.css
  components.css
  responsive.css
  /assets
    /brand
      logo-icon.svg, logo-full.svg, logo-icon-dark.svg, logo-icon-mono.svg,
      logo-full-dark.svg, favicon.ico, icon-*.png, logo-icon-*.png
    /icons
      icon-192.png, icon-512.png
  README-design.md

/src
  /styles
    index.css            → importe tokens/global/layout/components/responsive
  /components/ui          → si recréation en composants React
    Button.tsx             (.btn, .btn-primary, .btn-secondary, .btn-icon, .btn-dark)
    Card.tsx                (.card, glass-panel)
    Input.tsx / Select.tsx (.input, .select)
    Badge.tsx               (.badge-*)
    Alert.tsx               (.alert-*)
    Table.tsx               (.table)
    Modal.tsx               (.modal-overlay, .modal-panel)
    Sidebar.tsx             (.sidebar, .sidebar-link)
    Topbar.tsx              (.topbar, .avatar, .dropdown-panel)
    Loader.tsx              (.loading-screen)
  /lib/theme.ts            → logique ThemeProvider (localStorage + classe .dark)
```

### Conventions de nommage

- Classes utilitaires structurelles en **kebab-case**, préfixées par le rôle
  du composant (`btn-`, `badge-`, `alert-`, `sidebar-`, `modal-`, `card-`).
- États en suffixe avec préfixe `is-` (`is-active`, `is-expanded`,
  `is-pinned`) plutôt que des classes Tailwind conditionnelles en dur, pour
  rester portable hors-Tailwind.
- Couleurs sémantiques nommées par intention (`success`/`warning`/`danger`/
  `info`/`neutral`), jamais par teinte brute, pour pouvoir changer la palette
  sans renommer les classes.
- Variables CSS toujours préfixées par catégorie : `--color-*`, `--radius-*`,
  `--space-*`, `--text-*`, `--shadow-*`, `--glass-*`.

### Organisation du design system

1. `tokens.css` ne doit contenir QUE des variables (aucun sélecteur de
   composant) — c'est la source unique à modifier pour un re-branding.
2. `global.css` gère le fond de page, le glassmorphism de base et le dark
   mode — rien de spécifique à un composant.
3. `layout.css` gère la structure de page (grilles, shell applicatif).
4. `components.css` est strictement additif : un composant = un bloc de
   règles, commenté avec son fichier source d'origine (déjà fait ici pour
   permettre l'audit).
5. `responsive.css` regroupe toutes les media queries en un seul endroit
   plutôt que de les disperser, pour visualiser d'un coup d'œil tous les
   points de rupture du produit.

---

## 10. Icônes utilisées (liste exhaustive relevée dans le code)

Toutes proviennent de `lucide-react` (taille courante 14–20px, 28–64px pour
le branding) :

AlertTriangle, Bell, BrainCircuit, Building2, Calculator, CalendarPlus, Check,
CheckCircle2, CheckSquare, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
ClipboardCheck, Euro, ExternalLink, FileText, Folder, FolderOpen, Globe,
GraduationCap, Inbox, Info, KanbanSquare, Landmark, LayoutDashboard,
LineChart, Loader2, LogOut, Mail, Megaphone, MessageCircle, MessageSquare,
Moon, Network, Pencil, Phone, Plus, Scale, Search, Send, Settings,
ShieldAlert, ShieldCheck, Sparkles, Star, Sun, Tag, Target, Trash2,
TrendingUp, Upload, User, Users, UsersRound, Wallet, X.

Installation dans le nouveau projet : `npm install lucide-react`, puis
`import { Bell } from "lucide-react"`.

---

## 11. Assets fournis

```
assets/brand/
  logo-icon.svg            ← icône seule, fond clair
  logo-icon-dark.svg        ← icône seule, fond sombre
  logo-icon-mono.svg        ← icône monochrome
  logo-full.svg             ← logo + wordmark, fond clair
  logo-full-dark.svg        ← logo + wordmark, fond sombre
  logo-full.png             ← export raster du logo complet
  logo-icon-512.png / logo-icon-1024.png
  favicon.ico
  icon-16.png / icon-32.png / icon-48.png / icon-180.png / icon-192.png

assets/icons/
  icon-192.png / icon-512.png   ← icônes PWA (manifest)
```

Tous ces fichiers sont des copies exactes de `public/brand/` et
`public/icons/` de l'ERP source — rien n'a été régénéré ou retouché.
