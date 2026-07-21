// Point d'entrée pour Gandi Simple Hosting (Node.js).
// - charge une config persistante (~/.env.trevys) qui survit aux redéploiements
// - auto-génère AUTH_SECRET au premier démarrage si absent
// - démarre Next.js sur le port fourni par Gandi (process.env.PORT)
const { createServer } = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

// 1) Config persistante (hors du dossier synchronisé, donc conservée aux deploys)
const persistentEnv = path.join(os.homedir(), ".env.trevys");
try {
  if (fs.existsSync(persistentEnv)) {
    for (const line of fs.readFileSync(persistentEnv, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  }
} catch {
  /* ignore */
}

// 2) Secret d'authentification : généré une seule fois puis persisté.
if (!process.env.AUTH_SECRET) {
  const secret = crypto.randomBytes(32).toString("base64");
  process.env.AUTH_SECRET = secret;
  try {
    fs.appendFileSync(persistentEnv, `AUTH_SECRET=${secret}\n`);
  } catch {
    /* disque en lecture seule : le secret restera valable le temps du process */
  }
}
if (!process.env.NEXTAUTH_SECRET) process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET;

// 3) Démarrage de Next.js
const next = require("next");
const port = parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOST || "0.0.0.0";
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> Site Trevys prêt sur http://${hostname}:${port}`);
  });
});
