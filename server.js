// Point d'entrée pour l'hébergement Gandi Simple Hosting (Node.js).
// Démarre Next.js en production et écoute sur le port fourni par Gandi
// via la variable d'environnement PORT.
const { createServer } = require("http");
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
