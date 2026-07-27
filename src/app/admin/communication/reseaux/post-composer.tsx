"use client";

import { useActionState, useEffect, useState } from "react";
import { draftPostAction, createPostAction } from "./actions";
import { ImageField } from "../../image-field";

const initial = { content: "", generated: false as boolean, error: undefined as string | undefined };

export function PostComposer() {
  const [draft, runDraft, drafting] = useActionState(draftPostAction, initial);
  const [network, setNetwork] = useState<"linkedin" | "instagram">("linkedin");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (draft.content) setContent(draft.content);
  }, [draft]);

  return (
    <div className="adm-card">
      <h2>Composer un post</h2>

      <div className="adm-net-toggle">
        <button type="button" className={network === "linkedin" ? "on" : ""} onClick={() => setNetwork("linkedin")}>in · LinkedIn</button>
        <button type="button" className={network === "instagram" ? "on" : ""} onClick={() => setNetwork("instagram")}>IG · Instagram</button>
      </div>

      {/* Rédaction assistée par Alfred */}
      <form action={runDraft} className="adm-draft-row">
        <input type="hidden" name="network" value={network} />
        <input name="topic" placeholder="Sujet du post (ex. « réforme facturation, doctrine de démarrage »)" />
        <button className="adm-btn" type="submit" disabled={drafting}>
          {drafting ? "Alfred rédige…" : "Rédiger avec Alfred"}
        </button>
      </form>
      {draft.error && <p style={{ color: "#c0392b", fontSize: ".82rem", margin: ".2rem 0 0" }}>{draft.error}</p>}
      {draft.content && !draft.generated && (
        <p className="muted" style={{ fontSize: ".8rem", color: "var(--ink3)", marginTop: ".3rem" }}>
          Gabarit généré sans IA (clé ANTHROPIC_API_KEY manquante). Complétez le texte ci-dessous.
        </p>
      )}

      {/* Enregistrement dans la file */}
      <form action={createPostAction} style={{ marginTop: "1rem" }}>
        <input type="hidden" name="network" value={network} />
        {network === "linkedin" && (
          <div className="adm-field">
            <label>Publier sur</label>
            <select name="liTarget" defaultValue="profil" style={{ maxWidth: 320 }}>
              <option value="profil">Mon profil personnel</option>
              <option value="page">La Page entreprise Trevys</option>
            </select>
          </div>
        )}
        <div className="adm-field">
          <label>Texte du post</label>
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Écrivez votre post, ou laissez Alfred le rédiger ci-dessus…"
            style={{ minHeight: 180 }}
          />
        </div>
        <div className="adm-field">
          <label>Image du post <small>(optionnel — importez un visuel)</small></label>
          <ImageField name="image" />
        </div>
        <div className="adm-row2">
          <div className="adm-field">
            <label>Programmer <small>(optionnel — laisser vide = brouillon)</small></label>
            <div style={{ display: "flex", gap: ".5rem" }}>
              <input type="date" name="scheduledDate" />
              <input type="time" name="scheduledTime" />
            </div>
          </div>
          <div className="adm-field" style={{ justifyContent: "flex-end", display: "flex", alignItems: "flex-end" }}>
            <button className="adm-btn" type="submit" disabled={!content.trim()}>Ajouter à la file</button>
          </div>
        </div>
      </form>
    </div>
  );
}
