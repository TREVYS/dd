// Battement de cœur du serveur : Alfred travaille en autonomie, navigateur
// fermé. Au démarrage de l'application (Gandi fait tourner Node en continu),
// on arme un réveil périodique qui exécute :
//  - les routines d'Alfred dues (articles/posts/newsletters récurrents) ;
//  - les publications programmées (posts réseaux, articles, mailings) ;
//  - le rapport d'audience hebdomadaire Telegram ;
//  - l'annonce de mise à jour après un déploiement.
// Les visites du site et du cockpit restent des déclencheurs complémentaires.

const HEARTBEAT_MS = 5 * 60_000; // toutes les 5 minutes

async function tick() {
  try {
    const { notifyDeployOnce } = await import("@/lib/deploy-notify");
    await notifyDeployOnce();
  } catch { /* non bloquant */ }
  try {
    const { runDueRoutines } = await import("@/lib/alfred-routines-run");
    await runDueRoutines();
  } catch (e) {
    console.error("[heartbeat] routines:", e);
  }
  try {
    const { runScheduledPublications } = await import("@/lib/scheduler");
    await runScheduledPublications();
  } catch (e) {
    console.error("[heartbeat] planificateur:", e);
  }
  try {
    const { maybeSendWeeklyStatsReport } = await import("@/lib/stats-report");
    await maybeSendWeeklyStatsReport();
  } catch { /* non bloquant */ }
}

export async function register() {
  // Uniquement dans le vrai serveur Node (ni Edge, ni pendant le build).
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // Heure de Paris pour tout le processus (le serveur Gandi tourne en GMT) :
  // toutes les dates/heures affichées et calculées suivent l'heure française.
  process.env.TZ = "Europe/Paris";
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  // Premier passage peu après le démarrage, puis toutes les 5 minutes.
  setTimeout(() => { tick().catch(() => {}); }, 20_000);
  setInterval(() => { tick().catch(() => {}); }, HEARTBEAT_MS);
  console.log("[heartbeat] planificateur d'Alfred armé (toutes les 5 min)");
}
