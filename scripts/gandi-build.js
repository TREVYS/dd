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
    // Limite le parallélisme (threads) — évite "can't spawn worker thread".
    RAYON_NUM_THREADS: process.env.RAYON_NUM_THREADS || "1",
    TOKIO_WORKER_THREADS: process.env.TOKIO_WORKER_THREADS || "1",
    UV_THREADPOOL_SIZE: process.env.UV_THREADPOOL_SIZE || "2",
    // Plafonne la mémoire du build sous la limite de l'instance (2 Go) pour
    // éviter que le processus soit tué (OOM) en pleine compilation.
    NODE_OPTIONS: `${process.env.NODE_OPTIONS || ""} --max-old-space-size=1536`.trim(),
    NEXT_TELEMETRY_DISABLED: "1",
  },
});

process.exit(result.status ?? 1);
