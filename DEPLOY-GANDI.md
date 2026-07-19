# Déploiement du site vitrine sur Gandi (Simple Hosting Node)

Ce guide déploie **le site public seul** (marketing) sur une instance
**Node.js** Gandi, accessible via un **sous-domaine** de `trevys-advisory.fr`.

> L'app embarque aussi l'ERP TREVYS OS, mais il reste inaccessible sans base de
> données : le site vitrine, lui, fonctionne sans base. On branchera l'ERP plus
> tard si besoin.

---

## 0. Prérequis important : la version de Node

Next.js 16 exige **Node.js 20 ou plus**. Avant tout, vérifie que ton instance
Gandi peut tourner en **Node 20+**.

- Ton WordPress est sur une instance **PHP** : elle ne peut pas exécuter Node.
  Il faut une **instance Node.js distincte** (Gandi Simple Hosting « Node »),
  ou un **Gandi Cloud / VPS**.
- Si Gandi Simple Hosting ne propose pas Node 20+, passe sur **Gandi Cloud
  (VPS)** — dis-le-moi, je te fournis un `Dockerfile` prêt à l'emploi.

---

## 1. Variables d'environnement (site vitrine)

À définir dans la console Gandi (ou un fichier `.env` de l'instance) :

| Variable | Obligatoire | Rôle |
|---|---|---|
| `AUTH_SECRET` | **oui** | Secret NextAuth (le middleware l'exige). Générer : `openssl rand -base64 32` |
| `NODE_ENV` | oui | `production` |
| `NEXT_PUBLIC_CALENDLY_URL` | non | Défaut : `https://calendly.com/trevys-advisory/15min` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `CONTACT_TO` | non | Envoi des e-mails du formulaire de contact |
| `BREVO_API_KEY`, `BREVO_LIST_ID` | non | Inscription newsletter |
| `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | non | Anti-bot Cloudflare |

> `DATABASE_URL` n'est **pas** nécessaire pour le site vitrine (uniquement pour
> l'ERP plus tard).

---

## 2. Construire le bundle autonome

En local (ou en CI), avec Node 20+ :

```bash
npm ci
bash scripts/build-standalone.sh
```

Cela produit un dossier **autonome** dans `.next/standalone/` contenant :
`server.js`, les dépendances minimales, `.next/static` et `public`.

Démarrage (ce que fera Gandi) :

```bash
HOSTNAME=0.0.0.0 PORT=$PORT node .next/standalone/server.js
```

Le port est fourni par Gandi via la variable `PORT`.

---

## 3. Déployer sur l'instance Node Gandi

Deux méthodes (voir la doc Gandi de ton instance) :

**A. Git (recommandé)**
1. Dans la console Gandi, crée une **instance Simple Hosting Node** (Node 20+).
2. Récupère l'URL git de l'instance (format
   `git+ssh://<instance>@git.<dc>.gpaas.net/default.git`).
3. `git remote add gandi <url-git-gandi>`
4. `git push gandi claude/festive-ptolemy-kzls4m:main`
5. Gandi lance `npm install` puis le build. Configure la **commande de
   démarrage** de l'instance sur :
   `node .next/standalone/server.js`
   (ou `npm run start` si tu ne passes pas par le standalone).

**B. SFTP**
1. Construire en local (`bash scripts/build-standalone.sh`).
2. Envoyer le contenu de `.next/standalone/` dans le dossier applicatif de
   l'instance (vhost).
3. Régler la commande de démarrage sur `node server.js`.

> Renseigne les variables d'environnement de l'étape 1 dans la console Gandi
> **avant** le premier démarrage.

---

## 4. Sous-domaine + HTTPS

1. Dans **Gandi → Domaine `trevys-advisory.fr` → Enregistrements DNS**, ajoute
   un enregistrement pour le sous-domaine choisi (ex. `site` ou `new`) :
   - **CNAME** `site` → l'adresse fournie par ton instance Node Gandi
     (ou un **A/AAAA** vers son IP si Gandi donne une IP).
2. Dans la config de l'instance (vhosts), **ajoute le domaine**
   `site.trevys-advisory.fr`.
3. Active le **certificat HTTPS** (Let's Encrypt, proposé par Gandi) pour ce
   vhost.

Le site sera alors accessible sur `https://site.trevys-advisory.fr`.

---

## 5. Vérifications après mise en ligne

- Page d'accueil, expertises, `/le-cabinet`, `/references`, `/blog` et un
  article : doivent s'afficher (HTTP 200).
- `/app` doit rediriger vers `/login` (ERP protégé) — normal.
- `robots.txt` et `sitemap.xml` accessibles.
- Pense à mettre à jour l'URL publique dans `metadataBase`
  (`src/app/(marketing)/layout.tsx`) et le `sitemap.ts` si tu utilises un
  sous-domaine différent de `www.trevys-advisory.fr` pour l'indexation.

---

## Alternative plus simple

Si la mise en place Node sur Gandi coince (version de Node, process
manager…), **Vercel** héberge cette app en quelques minutes (zéro config
Next.js, HTTPS auto) — tu gardes le domaine chez Gandi et ajoutes un simple
CNAME `site` → `cname.vercel-dns.com`. Dis-le-moi et je te guide.
