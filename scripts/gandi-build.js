// Build Next.js en limitant le parallélisme (l'hébergement mutualisé Gandi
// limite le nombre de threads : sans ça, le build plante avec
// "OS can't spawn worker thread"). Utilisé par le script postinstall.
const { spawnSync } = require("child_process");

// Résolution robuste du binaire Next (indépendante du PATH).
const nextBin = require.resolve("next/dist/bin/next");

const result = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    RAYON_NUM_THREADS: process.env.RAYON_NUM_THREADS || "1",
    TOKIO_WORKER_THREADS: process.env.TOKIO_WORKER_THREADS || "1",
  },
});

process.exit(result.status ?? 1);
