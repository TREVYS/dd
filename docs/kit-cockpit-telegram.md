# Kit de reproduction — Cockpit + assistant IA + Telegram

Ce document donne tout ce qu'il faut pour reproduire le cockpit Trevys (où
vit **Alfred**) dans une autre application du cabinet, avec **d'autres
couleurs** et **un autre assistant** (ex. **Jacques** pour le conseil),
y compris la conversation et les notifications sur **Telegram**.

Il s'adresse à un développeur ou à une IA de développement (Claude Code).
Le dépôt `trevys/dd` sert de référence : chaque fichier cité y existe.

> Complément visuel : `docs/direction-artistique-jacques.md` (palette bleu
> nuit, avatar de Jacques, feuille de style de départ).

---

## 1. Ce que l'on reproduit

| Brique | Rôle | Fichiers de référence |
|---|---|---|
| Coquille du cockpit | Barre latérale, barre du haut, recherche, tiroir mobile, barre du bas façon appli avec l'assistant au centre | `src/app/admin/layout.tsx`, `admin-shell.tsx`, `admin-nav.tsx`, `global-search.tsx`, `icons.tsx` |
| Styles | Couleurs, cartes, boutons, champs, tableaux (en fiches sur mobile), conversation | `src/app/admin/admin.css` |
| Assistant (avatar) | Personnage SVG animé (clignement des yeux) | `src/app/admin/alfred-avatar.tsx` |
| Assistant (cerveau) | Agent IA Claude + outils (rédiger, planifier, lister, publier sur « go »…) | `src/lib/comms-agent.ts` (`runCommsAgent`), `src/lib/alfred-config.ts` |
| Conversation dans le cockpit | Page de chat, pièces jointes | `src/app/admin/communication/page.tsx`, `chat.tsx`, `src/app/api/admin/...` |
| Éducation de l'assistant | Ton, ligne éditoriale, mots interdits, exemples, base de connaissance | `src/app/admin/reglages/alfred/*`, `src/lib/alfred-config.ts`, `src/lib/alfred-ingest.ts` |
| Telegram : notifications | Messages, photos, documents, « en train d'écrire » | `src/lib/notify.ts` |
| Telegram : conversation | Webhook sécurisé, mémoire, pièces jointes, /start, /reset | `src/lib/telegram-alfred.ts`, `src/app/api/telegram/webhook/route.ts` |
| Travail en autonomie | Réveil toutes les 5 min : routines, publications programmées, rapports | `src/instrumentation.ts`, `src/lib/alfred-routines*.ts`, `src/lib/scheduler.ts` |
| Réglages | Clés API et connexions saisies dans le cockpit (prioritaires sur les variables d'environnement) | `src/lib/settings.ts`, `src/app/admin/reglages/*` |
| Connexion | Session sécurisée, rôles autorisés | `src/lib/auth.ts`, `src/proxy.ts` |

---

## 2. Pile technique

- **Next.js 16** (App Router, composants serveur, Server Actions), **React 19**, TypeScript.
- **next-auth v5** en session JWT (expiration 7 jours), utilisateurs et rôles en **PostgreSQL** via **Prisma**.
- **Stockage léger en fichiers JSON** dans `data/` (jamais versionné) : réglages, routines, brouillons, conversation Telegram… Aucune base supplémentaire à créer pour l'assistant.
- **Anthropic SDK** (`@anthropic-ai/sdk`) pour l'assistant, avec outils (tool use) et recherche web.
- **Telegram Bot API** en HTTPS direct (pas de bibliothèque).
- Police **Geist** (`next/font/google`).
- Hébergement Gandi (Node en continu, ce qui permet le réveil périodique). Le build Gandi saute la vérification TypeScript (`SKIP_BUILD_TYPECHECK=1`, voir `scripts/gandi-build.js`) : vérifier le typage avant chaque envoi avec `npx tsc --noEmit`.

---

## 3. Changer les couleurs

### 3.1 Les variables (l'essentiel)

En tête de `src/app/admin/admin.css`, la classe `.adm` définit la palette.
Changer ces quatre valeurs recolore l'essentiel du cockpit :

```css
.adm{
  --o:#F5811F;      /* accent principal (boutons, actif, liens)  */
  --o2:#C2410C;     /* accent foncé (survol, texte actif)        */
  --o-tint:#FFF6EF; /* fond teinté très clair (élément actif)    */
  --o-soft:#FDEEE0; /* fond teinté doux                          */
  --ink:#1B1712; --ink2:#726757; --ink3:#A79C8C;   /* textes      */
  --line:#EFEBE4; --bg:#F4F1EC; --card:#fff;       /* fonds, filets */
}
```

Exemple pour Jacques (bleu nuit) :

```css
--o:#1F2A44; --o2:#141C30; --o-tint:#F1F4F9; --o-soft:#E3E9F3;
```

### 3.2 Les couleurs écrites en dur (à remplacer aussi)

Quelques dégradés et ombres utilisent la couleur directement. Faire un
rechercher-remplacer dans `admin.css` (et les fichiers `.tsx` du dossier
`src/app/admin`) :

| Valeur Alfred | Usage | Équivalent Jacques |
|---|---|---|
| `#FBB040` | début des dégradés (carte assistant, avatars) | `#3B5078` |
| `#C2410C` | fin des dégradés | `#1F2A44` |
| `#E26A0F` | pastilles de notification | garder (orange = alerte Trevys) ou `#2B3A5C` |
| `#F5811F` | accents ponctuels | `#1F2A44` |
| `#FFF7F0`, `#FFF6EC`, `#FDECDD`, `#F5D9BE` | fonds et bordures d'encarts | `#F1F4F9`, `#F1F4F9`, `#E3E9F3`, `#C9D3E3` |
| `rgba(226,106,15,…)` | ombres colorées | `rgba(31,42,68,…)` |
| `rgba(245,129,31,…)` | fonds translucides | `rgba(31,42,68,…)` |

Garder l'orange pour la **marque** (monogramme « TA », mot « Trevys ») et
les **alertes** relie visuellement les deux applications.

### 3.3 Ce qu'il ne faut pas changer

Fond crème, panneaux blancs arrondis (22 px), ombres très diffuses, police
Geist, barre du bas flottante avec l'assistant au centre, tableaux en
fiches sur mobile : c'est l'identité commune des applications du cabinet.

---

## 4. Créer un autre assistant (ex. Jacques)

1. **Nom et rôle** — le nom « Alfred » apparaît dans environ 75 fichiers
   (295 occurrences), surtout des libellés et des commentaires. Remplacer
   par « Jacques » dans les textes affichés, et renommer les fichiers
   `alfred-*.ts(x)` en `jacques-*.ts(x)` si on veut un code propre. Rôle
   affiché : « Directeur conseil » (au lieu de « Directeur de communication »).
2. **Avatar** — remplacer le SVG de `src/app/admin/alfred-avatar.tsx` par
   celui de Jacques (fourni dans `docs/direction-artistique-jacques.md`).
   Garder la classe `adm-alf-eye` sur les deux cercles des yeux pour le
   clignement.
3. **Personnalité** — le texte de cadrage de l'assistant est la constante
   `OPERATING` au début de `src/lib/comms-agent.ts` (« Tu es le
   super-assistant personnel de John Lévy… »). La réécrire pour le conseil :
   missions, propositions commerciales, planning des consultants, livrables,
   retours d'expérience. Garder les règles de sécurité :
   - tout part en **brouillon** ;
   - **rien n'est publié ni envoyé sans un « go » explicite** de l'utilisateur ;
   - annoncer la cible et le nombre de destinataires avant tout envoi.
4. **Outils** — `comms-agent.ts` déclare la liste des outils de l'assistant
   (`rediger_article`, `rediger_post`, `publier_post`, `lister_candidatures`,
   `creer_routine`, `chercher_documents`, `lister_statistiques`,
   `web_search`…). Pour Jacques, garder les outils génériques
   (`creer_routine`, `lister_routines`, `chercher_documents`, `web_search`)
   et remplacer les outils métier par ceux du conseil, par exemple
   `lister_missions`, `rediger_proposition`, `planifier_consultant`,
   `rediger_livrable`. Chaque outil = une entrée dans la liste (nom,
   description, schéma des paramètres) + son exécution dans
   `runCommsAgent`.
5. **Éducation** — `src/lib/alfred-config.ts` stocke le ton, la ligne
   éditoriale, les messages clés, les mots interdits, la signature, des
   exemples et une base de connaissance (documents déposés). Le tout est
   injecté dans le prompt par `alfredSystemBlock()`. La page
   `Réglages → Éduquer` permet de le modifier sans code. À reprendre tel quel.
6. **Modèle** — l'appel se fait avec `@anthropic-ai/sdk`. Utiliser le modèle
   Claude le plus récent disponible pour l'organisation.

---

## 5. Telegram, comme pour Alfred

### 5.1 Ce que fait l'intégration

- **Notifications** envoyées par l'assistant : brouillon prêt, routine
  exécutée, rapport hebdomadaire, résumé des mails, nouvelle candidature
  (avec le CV en pièce jointe), mise en ligne d'une nouvelle version…
- **Conversation** : on écrit au bot comme dans le cockpit ; l'assistant
  répond avec les mêmes outils, garde en mémoire les 16 derniers échanges,
  affiche « en train d'écrire… » pendant qu'il travaille.
- **Validation par « go »** : quand l'assistant annonce un brouillon prêt,
  répondre « go » sur Telegram le fait publier ou envoyer (outil dédié,
  jamais sans confirmation).
- **Pièces jointes** : une photo ou un document envoyé au bot est rangé
  (image → médiathèque, PDF/Word/texte → base de connaissance), 8 Mo maximum.
- **Commandes** : `/start` (présentation), `/reset` (efface la mémoire).

### 5.2 Mise en place (une fois par application)

**Un bot par assistant.** Jacques doit avoir son propre bot : un même bot
ne peut avoir qu'un seul webhook, et donc une seule application.

1. Sur Telegram, écrire à **@BotFather** → `/newbot` → nom « Jacques —
   Trevys Conseil », identifiant par exemple `TrevysJacquesBot`. BotFather
   donne un **jeton de bot** (`123456:ABC…`).
2. Démarrer une conversation avec le nouveau bot (envoyer « Bonjour »).
3. Récupérer son **Chat ID** : écrire à **@userinfobot**, il répond avec
   l'identifiant.
4. Dans le cockpit de la nouvelle application → **Réglages → Clés &
   connexions → Notifications Telegram** : coller le jeton et le Chat ID,
   enregistrer. (À défaut : variables d'environnement `TELEGRAM_BOT_TOKEN`
   et `TELEGRAM_CHAT_ID`.)
5. Toujours dans les Réglages, bloc **« Parler à … sur Telegram »** →
   **Activer**. L'application déclare alors son webhook à Telegram.
6. Écrire `/start` au bot : il doit répondre.

### 5.3 Fonctionnement technique

```
Utilisateur ──message──▶ Telegram ──POST /api/telegram/webhook──▶ Application
                                    (en-tête secret vérifié)          │
                                                                       ├─ 200 immédiat
                                                                       └─ traitement en arrière-plan :
                                                                          Chat ID autorisé ? dédoublonnage ?
                                                                          → runCommsAgent(historique)
                                                                          → sendMessage (découpé par 3 900 car.)
```

- **Déclaration du webhook** (`enableAlfredOnTelegram`) : appel
  `setWebhook` avec l'URL `https://<site>/api/telegram/webhook`, un
  `secret_token`, `allowed_updates: ["message"]` et
  `drop_pending_updates: true`.
- **Secret du webhook** : dérivé du jeton du bot par HMAC-SHA256 avec le
  secret de l'application (`AUTH_SECRET`, sinon un secret aléatoire
  persistant dans `data/.app-secret`). Rien de plus à stocker.
- **Sécurité** : toute requête sans le bon en-tête
  `x-telegram-bot-api-secret-token` est refusée (401), et seuls les
  messages venant du **Chat ID configuré** sont traités.
- **Réponse immédiate** : le webhook répond 200 tout de suite et traite
  le message ensuite, sinon Telegram relivre le message en boucle. Les
  `update_id` déjà vus (60 derniers) sont ignorés.
- **Envoi** (`notify.ts`) : `sendMessage` en HTML avec repli en texte
  brut si Telegram refuse le formatage ; `sendPhoto`, `sendDocument`,
  `sendChatAction` (« typing », rafraîchi toutes les 4,5 s).
- **Mémoire** : `data/telegram-chat.json` (16 derniers échanges).

### 5.4 Fichiers à copier pour Telegram

- `src/lib/notify.ts` — envoi de messages, photos, documents.
- `src/lib/telegram-alfred.ts` — renommer en `telegram-jacques.ts`, adapter
  les textes de `/start`.
- `src/app/api/telegram/webhook/route.ts` — tel quel.
- `src/lib/app-secret.ts` — tel quel.
- Bloc « Parler à Alfred sur Telegram » de `src/app/admin/reglages/page.tsx`
  et ses actions `enableTelegramAlfredAction` / `disableTelegramAlfredAction`
  dans `src/app/admin/reglages/actions.ts`.
- Clés `telegramBotToken` et `telegramChatId` dans `src/lib/settings.ts`.

---

## 6. Travail en autonomie (routines)

`src/instrumentation.ts` arme un réveil **toutes les 5 minutes** au
démarrage du serveur (heure forcée à Europe/Paris). À chaque passage :
routines dues, publications programmées, rapport hebdomadaire, résumé des
mails, synchronisation YouTube, annonce de mise en ligne.

- Une routine = type + fréquence (quotidienne, hebdomadaire, mensuelle) +
  jour + heure + consigne. Elle produit un **brouillon** et prévient sur
  Telegram. Stockage : `data/alfred-routines.json`.
- Chaque tâche périodique note sa dernière exécution dans un petit fichier
  `data/*.json` pour ne jamais tourner deux fois sur la même période.
- Prérequis : un hébergement où Node tourne en continu (pas de fonctions
  serverless qui s'endorment).

---

## 7. Réglages et secrets

Saisis dans **Réglages → Clés & connexions** (stockés dans
`data/settings.json`, prioritaires sur les variables d'environnement) :

| Réglage | Variable de repli | Obligatoire pour |
|---|---|---|
| Clé API Anthropic | `ANTHROPIC_API_KEY` | l'assistant |
| Jeton du bot Telegram | `TELEGRAM_BOT_TOKEN` | Telegram |
| Chat ID Telegram | `TELEGRAM_CHAT_ID` | Telegram |
| Microsoft 365 (tenant, client, secret, expéditeur) | `MS_*` | envoi de mails, résumé de boîte |
| Brevo, LinkedIn, Instagram, WhatsApp, YouTube | voir `settings.ts` | modules correspondants |

Variables d'environnement de l'hébergement (hors cockpit) :
`DATABASE_URL` (PostgreSQL), `AUTH_SECRET`, `NEXTAUTH_URL`,
`NEXT_PUBLIC_SITE_URL`.

Ne jamais mettre une clé dans le code ni dans un fichier versionné.

---

## 8. Étapes, dans l'ordre

1. Créer le nouveau projet à partir de `trevys/dd` (ou copier les dossiers
   `src/app/admin`, `src/lib`, `src/app/api/telegram`, `prisma`, la
   configuration Next et `scripts/gandi-build.js`).
2. Retirer ce qui ne concerne pas l'application cible (site public,
   newsletter, recrutement… selon le besoin) et adapter la navigation dans
   `admin-nav.tsx` et les 4 raccourcis de la barre du bas dans
   `admin-shell.tsx` (`TABS`).
3. Recolorer (section 3).
4. Remplacer l'assistant : nom, avatar, prompt, outils (section 4).
5. Configurer la base PostgreSQL, créer le compte administrateur
   (`scripts/create-admin.ts`), renseigner `AUTH_SECRET`.
6. Déployer, ouvrir le cockpit, saisir la clé Anthropic dans les Réglages.
7. Créer le bot Telegram de l'assistant et l'activer (section 5.2).
8. Créer les premières routines depuis le cockpit ou en le demandant à
   l'assistant.

---

## 9. Consigne prête à donner à Claude Code

> Dans ce nouveau projet, reproduis le cockpit du dépôt `trevys/dd`
> (dossier `src/app/admin`) en suivant `docs/kit-cockpit-telegram.md` et
> `docs/direction-artistique-jacques.md`. L'assistant s'appelle **Jacques**,
> « Directeur conseil », couleur bleu nuit `#1F2A44` ; l'orange Trevys reste
> pour le monogramme et les alertes. Navigation : Tableau de bord,
> Missions, Propositions, Planning des consultants, Livrables, GED,
> Réglages ; barre du bas mobile : Accueil, Missions, Jacques au centre,
> Planning, Messages. Reprends l'intégration Telegram à l'identique
> (`notify.ts`, `telegram-alfred.ts` renommé, webhook sécurisé, validation
> par « go »), avec un bot dédié. Tout ce que produit Jacques part en
> brouillon ; rien n'est envoyé sans confirmation explicite.
