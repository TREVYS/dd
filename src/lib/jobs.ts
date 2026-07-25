import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { slugify } from "@/lib/blog";

// Offres d'emploi (page « Nous rejoindre ») + candidatures, gérées depuis le
// cockpit. Stockées sur le disque de l'instance : data/jobs.json et
// data/job-applications.json.
const FILE = path.join(process.cwd(), "data", "jobs.json");
const APPS_FILE = path.join(process.cwd(), "data", "job-applications.json");

export type JobStatus = "brouillon" | "publie";

export type Job = {
  id: string;
  slug: string;
  title: string;
  category: string; // Expertise comptable | Conseil…
  contract: string; // CDI, CDD, alternance…
  location: string;
  summary: string; // accroche courte (liste + partage)
  body: string; // contenu Markdown
  status: JobStatus;
  createdAt: string;
  views: number;
  applications: number;
};

const SEED: Job[] = [
  {
    id: "seed-consultant-ec",
    slug: "consultant-expertise-comptable-conseil",
    title: "Consultant en expertise comptable & conseil aux entreprises (H/F)",
    category: "Expertise comptable",
    contract: "CDI",
    location: "Paris 16e",
    summary:
      "Rejoignez un cabinet qui ne se limite pas à produire des comptes : expertise comptable, conseil, transformation digitale et IA au service des dirigeants.",
    body: `Chez TREVYS, nous accompagnons les dirigeants dans leurs décisions stratégiques en combinant expertise comptable, transformation digitale et intelligence artificielle.

Notre conviction est simple : l'expert-comptable de demain doit être un véritable consultant, capable d'apporter de la valeur bien au-delà de la conformité réglementaire.

Dans le cadre de notre développement, nous recherchons un Consultant en expertise comptable & conseil souhaitant évoluer dans un environnement exigeant, innovant et à fort impact.

## Vos missions

Vous interviendrez sur deux axes complémentaires.

### Expertise comptable

- Gestion autonome d'un portefeuille de clients
- Révision comptable et établissement des comptes annuels
- Établissement des déclarations fiscales
- Préparation des liasses fiscales
- Accompagnement des dirigeants dans leurs problématiques comptables et fiscales
- Participation à des missions exceptionnelles (prévisionnels, évaluations, audits d'acquisition, restructurations…)

### Conseil et renfort chez nos clients

Vous serez amené à intervenir directement au sein de PME, ETI et grands groupes afin de :

- Renforcer temporairement leurs équipes comptables ou financières
- Accompagner des projets de transformation des fonctions finance
- Participer à l'amélioration des processus comptables et financiers
- Contribuer à des projets de digitalisation et d'automatisation
- Accompagner les entreprises dans leurs évolutions réglementaires, notamment autour de la facturation électronique
- Travailler aux côtés des directions financières sur des problématiques opérationnelles ou organisationnelles

Chaque mission est différente. Vous alternerez entre le cabinet et les interventions directement chez nos clients.

## Le profil recherché

Nous recherchons avant tout un consultant. Vous êtes :

- Diplômé d'un Bac +5 minimum (Master CCA, DSCG ou équivalent)
- Doté d'une première expérience significative en cabinet d'expertise comptable
- Autonome sur les travaux de révision et la relation client
- À l'aise dans des environnements variés
- Curieux, rigoureux et orienté solutions
- Capable de comprendre rapidement les enjeux d'une entreprise

Une expérience en conseil, en direction financière externalisée ou en gestion de projet constitue un véritable atout.

## Ce que nous proposons

- Des missions variées mêlant expertise comptable et conseil
- Une forte exposition auprès des dirigeants
- Des projets innovants autour de l'intelligence artificielle et de la transformation digitale
- Un environnement où les idées sont encouragées
- Une montée en compétences rapide sur des sujets à forte valeur ajoutée
- Des perspectives d'évolution vers des fonctions de management ou de pilotage de missions

## Pourquoi rejoindre TREVYS ?

Parce que nous sommes convaincus que l'avenir de notre profession ne réside plus uniquement dans la production comptable.

Nous construisons un cabinet où la technologie, l'intelligence artificielle et le conseil permettent aux collaborateurs de consacrer leur temps à ce qui crée réellement de la valeur pour les entreprises.

Si vous souhaitez participer à cette évolution et accompagner des dirigeants sur des sujets stratégiques, nous serons ravis d'échanger avec vous.

**Rémunération** : selon profil et expérience.`,
    status: "publie",
    createdAt: new Date().toISOString(),
    views: 0,
    applications: 0,
  },
  {
    id: "seed-consultant-transfo",
    slug: "consultant-transformation-finance",
    title: "Consultant transformation Finance & facturation électronique (H/F)",
    category: "Conseil",
    contract: "CDI",
    location: "Paris 16e · missions clients",
    summary:
      "Pilotez des projets de transformation des fonctions finance — SI Finance, facturation électronique, automatisation — auprès de PME, ETI et grands groupes.",
    body: `TREVYS accompagne les directions financières dans leurs grands chantiers : transformation des SI Finance, réforme de la facturation électronique, automatisation et intelligence artificielle.

Pour accompagner la forte demande liée à la réforme de la facturation électronique (2026-2027), nous renforçons notre équipe conseil.

## Vos missions

- Cadrage et pilotage de projets de mise en conformité facturation électronique (choix de plateforme agréée, cartographie des flux, conduite du changement)
- Assistance à maîtrise d'ouvrage sur des projets SI Finance (ERP, outils comptables, dématérialisation)
- Diagnostic et amélioration des processus comptables et financiers (P2P, O2C, clôture)
- Audit de la Piste d'Audit Fiable (PAF) et sécurisation du contrôle interne
- Renfort opérationnel auprès des directions comptables et financières
- Contribution au développement de l'offre : méthodologies, formations, prises de parole

## Le profil recherché

- Bac +5 (école de commerce, Master CCA/finance, ou équivalent)
- 3 ans d'expérience minimum en conseil, en cabinet ou en direction financière
- Bonne culture des processus comptables et des SI Finance
- Goût du terrain : vous aimez être chez le client, comprendre, embarquer les équipes
- Excellent relationnel et vraie plume — vous savez restituer clairement
- La connaissance de la réforme de la facturation électronique est un vrai plus

## Ce que nous proposons

- Un positionnement rare : cabinet d'expertise comptable ET de conseil, au cœur de la réforme
- Des missions à fort impact auprès de dirigeants et de directions financières
- Un environnement technophile : IA, automatisation, outils modernes
- Une équipe à taille humaine où vos idées comptent
- Des perspectives rapides de pilotage de missions et de développement d'offre

**Rémunération** : selon profil et expérience.`,
    status: "publie",
    createdAt: new Date().toISOString(),
    views: 0,
    applications: 0,
  },
];

function readAll(): Job[] {
  try {
    if (!fs.existsSync(FILE)) return SEED;
    const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return Array.isArray(data) ? data : SEED;
  } catch {
    return SEED;
  }
}

function writeAll(jobs: Job[]) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(jobs, null, 2), "utf8");
}

export function listJobs(): Job[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listPublishedJobs(): Job[] {
  return listJobs().filter((j) => j.status === "publie");
}

export function getJob(idOrSlug: string): Job | undefined {
  return readAll().find((j) => j.id === idOrSlug || j.slug === idOrSlug);
}

export function addJob(input: Omit<Job, "id" | "slug" | "createdAt" | "views" | "applications">): Job {
  const jobs = readAll();
  let slug = slugify(input.title).slice(0, 80) || "offre";
  let i = 1;
  while (jobs.some((j) => j.slug === slug)) slug = `${slugify(input.title).slice(0, 76)}-${i++}`;
  const job: Job = {
    ...input,
    id: crypto.randomBytes(6).toString("hex"),
    slug,
    createdAt: new Date().toISOString(),
    views: 0,
    applications: 0,
  };
  jobs.push(job);
  writeAll(jobs);
  return job;
}

export function updateJob(id: string, patch: Partial<Job>) {
  writeAll(readAll().map((j) => (j.id === id ? { ...j, ...patch } : j)));
}

export function removeJob(id: string) {
  writeAll(readAll().filter((j) => j.id !== id));
}

// Compteur de vues (page publique).
export function trackJobView(slug: string) {
  const jobs = readAll();
  const j = jobs.find((x) => x.slug === slug);
  if (!j) return;
  j.views = (j.views ?? 0) + 1;
  writeAll(jobs);
}

// --- Candidatures ----------------------------------------------------------

export type JobApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  date: string; // ISO
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  message: string;
  read: boolean;
};

function readApps(): JobApplication[] {
  try {
    if (!fs.existsSync(APPS_FILE)) return [];
    return JSON.parse(fs.readFileSync(APPS_FILE, "utf8")) as JobApplication[];
  } catch {
    return [];
  }
}

function writeApps(apps: JobApplication[]) {
  const dir = path.dirname(APPS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(APPS_FILE, JSON.stringify(apps, null, 2), "utf8");
}

export function listApplications(): JobApplication[] {
  return readApps().sort((a, b) => b.date.localeCompare(a.date));
}

export function unreadApplications(): number {
  return readApps().filter((a) => !a.read).length;
}

export function addApplication(input: Omit<JobApplication, "id" | "date" | "read">): JobApplication {
  const apps = readApps();
  const app: JobApplication = {
    ...input,
    id: crypto.randomBytes(6).toString("hex"),
    date: new Date().toISOString(),
    read: false,
  };
  apps.push(app);
  writeApps(apps);

  // Incrémente le compteur de l'offre.
  const jobs = readAll();
  const j = jobs.find((x) => x.id === input.jobId);
  if (j) {
    j.applications = (j.applications ?? 0) + 1;
    writeAll(jobs);
  }
  return app;
}

export function markApplicationRead(id: string) {
  writeApps(readApps().map((a) => (a.id === id ? { ...a, read: true } : a)));
}

export function removeApplication(id: string) {
  writeApps(readApps().filter((a) => a.id !== id));
}
