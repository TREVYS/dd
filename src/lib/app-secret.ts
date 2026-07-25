import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Secret d'application pour signer les jetons (désinscription, webhook…).
// Priorité à AUTH_SECRET ; à défaut, un secret aléatoire persistant sur le
// disque de l'instance — jamais une constante devinable.
const FILE = path.join(process.cwd(), "data", ".app-secret");
let cached: string | null = null;

export function appSecret(): string {
  const env = process.env.AUTH_SECRET;
  if (env && env.trim()) return env.trim();
  if (cached) return cached;
  try {
    if (fs.existsSync(FILE)) {
      cached = fs.readFileSync(FILE, "utf8").trim();
      if (cached) return cached;
    }
    const gen = crypto.randomBytes(32).toString("hex");
    const dir = path.dirname(FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FILE, gen, { mode: 0o600 });
    cached = gen;
    return gen;
  } catch {
    // Dernier recours (disque non inscriptible) : secret aléatoire de session.
    cached = cached ?? crypto.randomBytes(32).toString("hex");
    return cached;
  }
}
