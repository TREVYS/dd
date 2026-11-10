import Link from "next/link";
import { listOpenTasks, listArchivedTasks, type Task } from "@/lib/tasks";
import { parisToday } from "@/lib/dates";
import { PendingButton } from "../pending-button";
import { ConfirmSubmit } from "../confirm-submit";
import { addTaskAction, completeTaskAction, deleteTaskAction, reopenTaskAction, updateTaskAction } from "./actions";

export const dynamic = "force-dynamic";

const SOURCE_LABEL: Record<Task["source"], string> = { cockpit: "Cockpit", alfred: "Via Alfred", telegram: "Via Telegram" };

function frDate(d: string) {
  return new Date(`${d}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}

function addDays(d: string, n: number) {
  const x = new Date(`${d}T12:00:00`);
  x.setDate(x.getDate() + n);
  return x.toLocaleDateString("fr-CA");
}

function TaskRow({ t, today }: { t: Task; today: string }) {
  const late = !!t.due && t.due < today;
  return (
    <li className={`tk-item${t.priority === "haute" ? " hi" : ""}`}>
      <form action={completeTaskAction}>
        <input type="hidden" name="id" value={t.id} />
        <button className="tk-check" type="submit" title="Terminer et archiver" aria-label={`Terminer « ${t.title} »`}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
        </button>
      </form>
      <div className="tk-body">
        <div className="tk-title">{t.title}</div>
        {t.note && <div className="tk-note">{t.note}</div>}
        <div className="tk-meta">
          {t.due && <span className={`tk-chip${late ? " late" : t.due === today ? " today" : ""}`}>{late ? "En retard · " : ""}{t.due === today ? "Aujourd'hui" : frDate(t.due)}</span>}
          {t.priority === "haute" && <span className="tk-chip hi">Prioritaire</span>}
          {t.priority === "basse" && <span className="tk-chip">Quand j&apos;ai le temps</span>}
          <span className="tk-src">{SOURCE_LABEL[t.source]}</span>
        </div>
        <details className="tk-edit">
          <summary>Modifier</summary>
          <form action={updateTaskAction} className="adm-form" style={{ marginTop: ".6rem" }}>
            <input type="hidden" name="id" value={t.id} />
            <div className="adm-field"><label>Intitulé</label><input name="title" defaultValue={t.title} required /></div>
            <div className="adm-row2">
              <div className="adm-field"><label>Échéance</label><input type="date" name="due" defaultValue={t.due ?? ""} /></div>
              <div className="adm-field"><label>Priorité</label>
                <select name="priority" defaultValue={t.priority}>
                  <option value="haute">Prioritaire</option><option value="normale">Normale</option><option value="basse">Quand j&apos;ai le temps</option>
                </select>
              </div>
            </div>
            <div className="adm-field"><label>Note</label><textarea name="note" defaultValue={t.note ?? ""} style={{ minHeight: 60 }} /></div>
            <div className="adm-actions">
              <PendingButton className="adm-btn sm">Enregistrer</PendingButton>
            </div>
          </form>
          <form action={deleteTaskAction} style={{ marginTop: ".4rem" }}>
            <input type="hidden" name="id" value={t.id} />
            <ConfirmSubmit className="adm-btn sm ghost" message="Supprimer définitivement cette tâche ?">Supprimer</ConfirmSubmit>
          </form>
        </details>
      </div>
    </li>
  );
}

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  const sp = await searchParams;
  const archives = sp.v === "archives";
  const today = parisToday();
  const open = listOpenTasks();
  const archived = listArchivedTasks();
  const in7 = addDays(today, 7);

  const groups: { k: string; label: string; items: Task[] }[] = [
    { k: "late", label: "En retard", items: open.filter((t) => t.due && t.due < today) },
    { k: "today", label: "Aujourd'hui", items: open.filter((t) => t.due === today) },
    { k: "week", label: "Dans les 7 jours", items: open.filter((t) => t.due && t.due > today && t.due <= in7) },
    { k: "later", label: "Plus tard", items: open.filter((t) => t.due && t.due > in7) },
    { k: "none", label: "Sans échéance", items: open.filter((t) => !t.due) },
  ];

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Mes tâches</h1>
          <p>Votre todo, partagée avec Alfred. Ajoutez un sujet ici, dans le chat ou sur Telegram — cochez-le quand c&apos;est fait, il part dans les archives.</p>
        </div>
        <Link className="adm-btn ghost" href="/admin/communication">Demander à Alfred</Link>
      </div>

      <div className="tk-tabs">
        <Link href="/admin/taches" className={!archives ? "on" : ""}>À traiter <b>{open.length}</b></Link>
        <Link href="/admin/taches?v=archives" className={archives ? "on" : ""}>Archives <b>{archived.length}</b></Link>
      </div>

      {!archives && (
        <>
          <form action={addTaskAction} className="adm-card tk-add">
            <input name="title" required placeholder="Nouveau sujet à traiter… ex. Rappeler M. Dupont pour son bilan" aria-label="Nouvelle tâche" />
            <input type="date" name="due" aria-label="Échéance" />
            <select name="priority" defaultValue="normale" aria-label="Priorité">
              <option value="haute">Prioritaire</option><option value="normale">Normale</option><option value="basse">Plus tard</option>
            </select>
            <PendingButton pendingLabel="Ajout…">Ajouter</PendingButton>
          </form>

          <div className="adm-note" style={{ margin: "0 0 1.2rem" }}>
            💬 <b>Sur Telegram ou dans le chat :</b> « note : relancer le cabinet X sur la lettre de mission vendredi »,
            « rappelle-moi d&apos;appeler la banque demain », « c&apos;est fait pour la banque », « qu&apos;est-ce que j&apos;ai à faire ? ».
            Commande <b>/taches</b> sur Telegram pour la liste. Chaque matin à 8 h, Alfred vous envoie les retards et les tâches du jour.
          </div>

          {open.length === 0 ? (
            <div className="adm-card tk-empty">🎉 Rien à traiter. Profitez-en — ou confiez un sujet à Alfred.</div>
          ) : (
            groups.filter((g) => g.items.length > 0).map((g) => (
              <section key={g.k} className={`tk-group ${g.k}`}>
                <h2>{g.label} <span>{g.items.length}</span></h2>
                <ul className="tk-list">{g.items.map((t) => <TaskRow key={t.id} t={t} today={today} />)}</ul>
              </section>
            ))
          )}
        </>
      )}

      {archives && (
        archived.length === 0 ? (
          <div className="adm-card tk-empty">Aucune tâche archivée pour l&apos;instant.</div>
        ) : (
          <ul className="tk-list">
            {archived.map((t) => (
              <li key={t.id} className="tk-item done">
                <span className="tk-check on" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
                </span>
                <div className="tk-body">
                  <div className="tk-title">{t.title}</div>
                  <div className="tk-meta">
                    {t.doneAt && <span className="tk-src">Terminée le {new Date(t.doneAt).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "long" })}</span>}
                  </div>
                </div>
                <div className="tk-arch-act">
                  <form action={reopenTaskAction}><input type="hidden" name="id" value={t.id} /><PendingButton className="adm-btn sm ghost">Rouvrir</PendingButton></form>
                  <form action={deleteTaskAction}><input type="hidden" name="id" value={t.id} /><ConfirmSubmit className="adm-btn sm ghost" message="Supprimer définitivement cette tâche ?">Supprimer</ConfirmSubmit></form>
                </div>
              </li>
            ))}
          </ul>
        )
      )}
    </>
  );
}
