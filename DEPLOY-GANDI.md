# Déploiement sur Gandi — site + back-office (www.trevys.fr)

Ce guide met en ligne **le site vitrine + le back-office `/admin`** sur
**`https://www.trevys.fr`**, avec **hébergement des médias sur l'instance**.

- Site public : `https://www.trevys.fr`
- Back-office : `https://www.trevys.fr/admin` (connexion requise)

> Le back-office a besoin d'une **base PostgreSQL** (pour l'authentification).
> Le contenu (articles, pages) et les **médias importés** vivent sur le
> **disque de l'instance** → il faut **une seule instance** et un disque
> **persistant et inscriptible**.

---

## 0. Prérequis

- **Node.js 20+** sur l'instance (Next.js 16 l'exige).
  - WordPress tourne en **PHP** : il ne peut pas exécuter Node. Il faut une
    **instance Node séparée** :
    - **Gandi Simple Hosting « Node »** (si Node 20+ disponible), **ou**
    - **Gandi Cloud / VPS** (recommandé pour la persistance des médias — voir §7 Docker).
- **Une base PostgreSQL** (Gandi Simple Hosting en propose, ou une base gérée).
- Le domaine **trevys.fr** géré chez Gandi (pour le DNS).

---

## 1. Variables d'environnement

À définir dans la console Gandi (ou un fichier `.env.production`) :

| Variable | Obligatoire | Rôle |
|---|---|---|
| `AUTH_SECRET` | **oui** | Secret d'auth. Générer : `openssl rand -base64 32` |
| `NEXTAUTH_SECRET` | oui | Mettre la **même** valeur que `AUTH_SECRET` |
| `DATABASE_URL` | **oui** (admin) | `postgresql://user:pass@host:5432/base?schema=public` |
| `NEXT_PUBLIC_SITE_URL` | oui | `https://www.trevys.fr` (canoniques, SEO, sitemap) |
| `NEXTAUTH_URL` | oui | `https://www.trevys.fr` |
| `NODE_ENV` | oui | `production` |
| `NEXT_PUBLIC_CALENDLY_URL` | non | défaut : `https://calendly.com/trevys-advisory/15min` |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` `SMTP_FROM` `CONTACT_TO` | non | e-mails du formulaire de contact |
| `BREVO_API_KEY` `BREVO_LIST_ID` | non | inscription newsletter |
| `TURNSTILE_SECRET_KEY` `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | non | anti-bot |

---

## 2. Base de données + compte administrateur

Une fois `DATABASE_URL` défini, sur l'instance (ou en local pointant vers la
base de prod) :

```bash
npx prisma migrate deploy     # crée les tables (ou : npx prisma db push)
npm run seed                  # rôles + données de base (facultatif mais conseillé)
```

Créez **votre compte** — le mot de passe passe par une variable, il n'est
jamais écrit dans le code :

```bash
# bash
ADMIN_EMAIL="levy@trevys.fr" ADMIN_PASSWORD='VotreMotDePasseFort' npx tsx scripts/create-admin.ts
```
```powershell
# PowerShell
$env:ADMIN_EMAIL="levy@trevys.fr"; $env:ADMIN_PASSWORD="VotreMotDePasseFort"; npx tsx scripts/create-admin.ts
```

> 🔐 Choisissez un mot de passe **long** (12+ caractères). Vous pourrez le
> changer plus tard en relançant la même commande.

---

## 3. Build

```bash
npm ci
npx prisma generate
bash scripts/build-standalone.sh
```

Le script produit `.next/standalone/` **avec** : le serveur Node, les assets,
le dossier `public/` (dont `uploads/`), le `content/` éditorial, et prépare
les dossiers inscriptibles `data/` et `public/uploads/`.

---

## 4. Démarrage

```bash
HOSTNAME=0.0.0.0 PORT=3000 node .next/standalone/server.js
```

Sur Gandi Simple Hosting, la commande de démarrage de l'instance Node doit
pointer sur `server.js` du bundle standalone (ou adaptez selon le panneau).

---

## 5. Domaine & HTTPS

1. Dans Gandi, faites pointer **www.trevys.fr** (et **trevys.fr** en
   redirection) vers l'instance Node.
2. Activez le **certificat SSL** (Let's Encrypt via Gandi).
3. Vérifiez que `NEXT_PUBLIC_SITE_URL` et `NEXTAUTH_URL` valent bien
   `https://www.trevys.fr` (sinon les connexions au back-office échouent).

---

## 6. Hébergement & gestion des médias (rappel important)

- **Où sont stockés les médias ?** Les fichiers importés depuis
  **`/admin/medias`** sont écrits dans **`public/uploads/`** sur le disque de
  l'instance, et servis publiquement à **`/uploads/<fichier>`**.
- **Le contenu** (articles/pages/légal en `.mdx`) est dans **`content/`** ;
  **les statistiques** dans **`data/analytics.json`**.
- **À garantir sur Gandi :**
  1. **Une seule instance** (pas d'auto-scaling multi-nœuds) — sinon les
     fichiers d'une instance ne sont pas vus par les autres.
  2. Un **disque persistant et inscriptible** pour `public/uploads/`,
     `content/` et `data/`. Sur VPS/Docker : **montez des volumes** (voir §7).
  3. Sauvegardez régulièrement ces trois dossiers.
- **Formats acceptés à l'import** : JPG, PNG, WebP, GIF, SVG, PDF — **8 Mo max**.
- **Limite d'un hébergement « éphémère »** : si l'instance est recréée à
  chaque déploiement, les médias importés seraient perdus. Dans ce cas,
  passez à un **stockage objet** (Gandi Object Storage / S3) — dites-le-moi,
  je bascule l'upload dessus.

---

## 7. Option recommandée : Gandi Cloud / VPS avec Docker

Un `Dockerfile` est fourni. La persistance des médias se fait via des volumes :

```bash
docker build -t trevys-site .
docker run -d --name trevys -p 3000:3000 \
  --env-file .env.production \
  -v trevys-uploads:/app/public/uploads \
  -v trevys-content:/app/content \
  -v trevys-data:/app/data \
  trevys-site
```

Placez un **reverse-proxy** (Caddy/Nginx) devant, avec TLS pour
`www.trevys.fr`, qui transmet vers `http://127.0.0.1:3000`.

Exemple **Caddy** (`/etc/caddy/Caddyfile`) :
```
www.trevys.fr {
    reverse_proxy 127.0.0.1:3000
}
trevys.fr {
    redir https://www.trevys.fr{uri}
}
```

Initialisez ensuite la base et le compte admin **dans le conteneur** :
```bash
docker exec -it trevys sh -lc 'npx prisma migrate deploy'
docker exec -it -e ADMIN_EMAIL=levy@trevys.fr -e ADMIN_PASSWORD='VotreMotDePasseFort' trevys sh -lc 'npx tsx scripts/create-admin.ts'
```

---

## 8. Vérifications post-déploiement

- `https://www.trevys.fr` → accueil s'affiche.
- `https://www.trevys.fr/blog` → ressources.
- `https://www.trevys.fr/admin` → redirige vers la connexion, puis accessible
  après login `levy@trevys.fr`.
- Importez une image dans `/admin/medias` → elle s'ouvre sur
  `https://www.trevys.fr/uploads/<fichier>`.
- `https://www.trevys.fr/robots.txt` et `/sitemap.xml` renvoient bien le
  domaine `www.trevys.fr`.
