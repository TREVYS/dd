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
    // Compile dans le processus principal : par défaut, Next lance Turbopack
    // dans un fil d'exécution séparé, que Gandi refuse parfois de créer
    // (« Error: EAGAIN … ERR_WORKER_INIT_FAILED »).
    NEXT_TURBOPACK_USE_WORKER: process.env.NEXT_TURBOPACK_USE_WORKER || "0",
    NEXT_TELEMETRY_DISABLED: "1",
    // Saute la vérification TypeScript du build (manque de threads chez Gandi) ;
    // le typage est contrôlé avant chaque envoi du code.
    SKIP_BUILD_TYPECHECK: process.env.SKIP_BUILD_TYPECHECK || "1",
  },
});

process.exit(result.status ?? 1);
