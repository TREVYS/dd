# Lancer le site en local (sur votre machine)

Ce guide vous permet de **visualiser le site** sur `http://localhost:3000`
avant la mise en production sur Gandi.

> Le **site vitrine** fonctionne **sans base de données**.
> Le **back-office `/admin`** nécessite une base PostgreSQL (pour la connexion).

---

## 1. Prérequis

- **Node.js 20 ou plus** — vérifiez :
  ```bash
  node -v
  ```
  Si < 20 (ou « command not found »), installez-le : https://nodejs.org (version LTS).
- **Git**.

---

## 2. Récupérer le code (branche du site)

```bash
git clone https://github.com/trevys/dd.git
cd dd
git checkout claude/festive-ptolemy-kzls4m
```

Si vous avez déjà le dossier :

```bash
cd dd
git fetch origin
git checkout claude/festive-ptolemy-kzls4m
git pull origin claude/festive-ptolemy-kzls4m
```

---

## 3. Installer les dépendances

```bash
npm install
```

---

## 4. Créer le fichier de configuration `.env.local`

Copiez le modèle :

```bash
cp .env.example .env.local
```

Puis ouvrez `.env.local` et renseignez au minimum **deux** lignes :

```env
# Générez un secret : exécutez « openssl rand -base64 32 » et collez le résultat
AUTH_SECRET=collez-un-secret-ici

# URL factice suffisante pour voir le SITE VITRINE (sans back-office) :
DATABASE_URL=postgresql://user:pass@localhost:5432/db?schema=public
```

> Astuce macOS/Linux — générer le secret en une commande :
> ```bash
> echo "AUTH_SECRET=$(openssl rand -base64 32)" >> .env.local
> ```

---

## 5. Lancer le site

```bash
npm run dev
```

Ouvrez ensuite **http://localhost:3000** dans votre navigateur.
Vous pouvez naviguer sur tout le site public (accueil, expertises, ressources,
articles, cabinet, écosystème, contact, rendez-vous…).

Pour **arrêter** le serveur : `Ctrl + C` dans le terminal.

---

## 6. (Optionnel) Utiliser le back-office `/admin`

Le back-office demande une vraie base PostgreSQL :

1. Dans `.env.local`, mettez la **vraie** `DATABASE_URL` de votre base PostgreSQL.
2. Créez les tables et un compte de démonstration :
   ```bash
   npx prisma migrate deploy   # ou : npx prisma db push
   npm run seed                # crée les données/compte de départ
   ```
3. Connectez-vous sur **http://localhost:3000/login**, puis allez sur
   **http://localhost:3000/admin**.

> Pas de PostgreSQL en local ? Le plus simple est **Docker** :
> ```bash
> docker run --name trevys-db -e POSTGRES_PASSWORD=trevys -p 5432:5432 -d postgres:16
> ```
> puis `DATABASE_URL=postgresql://postgres:trevys@localhost:5432/postgres?schema=public`

---

## 7. Vérifier avant Gandi (build de production)

Pour reproduire le comportement de production :

```bash
npm run build
npm start
```

Le site tourne alors sur **http://localhost:3000** en mode production.
Si le build passe sans erreur, on est prêts pour Gandi — voir `DEPLOY-GANDI.md`.

---

## Récapitulatif express (site vitrine seul)

```bash
git checkout claude/festive-ptolemy-kzls4m && git pull origin claude/festive-ptolemy-kzls4m
npm install
cp .env.example .env.local
echo "AUTH_SECRET=$(openssl rand -base64 32)" >> .env.local
echo "DATABASE_URL=postgresql://user:pass@localhost:5432/db?schema=public" >> .env.local
npm run dev
# → http://localhost:3000
```
