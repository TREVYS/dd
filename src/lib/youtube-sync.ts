import fs from "node:fs";
import path from "node:path";
import { getSetting } from "@/lib/settings";
import { addVideo, hasYoutubeId } from "@/lib/videos";

// Synchronisation automatique avec la chaîne YouTube du cabinet : récupère
// chaque semaine les dernières vidéos (lien + description uniquement — la
// YouTube Data API ne renvoie jamais le fichier vidéo, rien n'est téléchargé)
// et les ajoute dans Ressources si elles n'y sont pas déjà.
const STATE_FILE = path.join(process.cwd(), "data", "youtube-sync.json");

function parisToday(): string {
  return new Date().toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" });
}

function readState(): { lastRunDay?: string; uploadsPlaylistId?: string } {
  try {
    if (!fs.existsSync(STATE_FILE)) return {};
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeState(patch: Record<string, string>) {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify({ ...readState(), ...patch }), "utf8");
}

export function youtubeSyncConfigured(): boolean {
  return !!getSetting("youtubeApiKey") && !!getSetting("youtubeChannelHandle");
}

function normalizeHandle(input: string): string {
  const s = input.trim();
  const m = s.match(/youtube\.com\/(@[\w.-]+)/i);
  if (m) return m[1];
  return s.startsWith("@") ? s : `@${s}`;
}

async function getUploadsPlaylistId(apiKey: string, handle: string): Promise<string | null> {
  const cached = readState().uploadsPlaylistId;
  if (cached) return cached;
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`,
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { items?: { contentDetails?: { relatedPlaylists?: { uploads?: string } } }[] };
  const id = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (id) writeState({ uploadsPlaylistId: id });
  return id ?? null;
}

type FetchedVideo = { youtubeId: string; title: string; description: string; publishedAt: string };

async function fetchLatestVideos(apiKey: string, playlistId: string, max = 10): Promise<FetchedVideo[]> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${max}&key=${apiKey}`,
  );
  if (!res.ok) return [];
  const data = (await res.json()) as {
    items?: { snippet?: { title?: string; description?: string; publishedAt?: string; resourceId?: { videoId?: string } } }[];
  };
  return (data.items ?? [])
    .map((it) => ({
      youtubeId: it.snippet?.resourceId?.videoId ?? "",
      title: it.snippet?.title ?? "",
      description: it.snippet?.description ?? "",
      publishedAt: it.snippet?.publishedAt ?? "",
    }))
    .filter((v) => v.youtubeId);
}

// Récupère les dernières vidéos de la chaîne et ajoute celles qui manquent
// (comparaison par id YouTube). Retourne les titres ajoutés.
export async function syncYoutubeVideos(): Promise<{ added: string[]; error?: string }> {
  const apiKey = getSetting("youtubeApiKey");
  const handleRaw = getSetting("youtubeChannelHandle");
  if (!apiKey || !handleRaw) return { added: [], error: "Chaîne YouTube non configurée (Réglages)." };

  const handle = normalizeHandle(handleRaw);
  const playlistId = await getUploadsPlaylistId(apiKey, handle);
  if (!playlistId) return { added: [], error: "Chaîne YouTube introuvable — vérifiez l'identifiant (Réglages)." };

  const videos = await fetchLatestVideos(apiKey, playlistId);
  const added: string[] = [];
  for (const v of videos) {
    if (hasYoutubeId(v.youtubeId)) continue;
    addVideo({
      youtubeId: v.youtubeId,
      title: v.title,
      focus: "YouTube",
      date: v.publishedAt ? v.publishedAt.slice(0, 10) : undefined,
      description: v.description,
      source: "youtube",
    });
    added.push(v.title);
  }
  return { added };
}

// Lancé au plus une fois par semaine (calendrier Paris) depuis le battement
// de cœur — même logique que le rapport d'audience / résumé des mails.
export async function maybeSyncYoutubeWeekly(): Promise<void> {
  if (!youtubeSyncConfigured()) return;
  const today = parisToday();
  const state = readState();
  if (state.lastRunDay) {
    const daysSince = (Date.parse(today) - Date.parse(state.lastRunDay)) / (24 * 3600 * 1000);
    if (daysSince < 7) return;
  }
  // Réservation avant l'appel réseau : jamais deux synchros la même semaine.
  writeState({ lastRunDay: today });

  const { added, error } = await syncYoutubeVideos();
  const { telegramConfigured, sendTelegram } = await import("@/lib/notify");
  if (!telegramConfigured()) return;
  if (error) {
    await sendTelegram(`🎥 Synchronisation YouTube impossible : ${error}`).catch(() => {});
    return;
  }
  if (added.length === 0) return; // rien de nouveau, pas de notification inutile
  await sendTelegram(
    `🎥 ${added.length} nouvelle${added.length > 1 ? "s" : ""} vidéo${added.length > 1 ? "s" : ""} ajoutée${added.length > 1 ? "s" : ""} dans Ressources :\n` +
      added.map((t) => `• ${t}`).join("\n"),
  ).catch(() => {});
}
