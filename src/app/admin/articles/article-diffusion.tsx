"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ImageField } from "../image-field";
import { diffuseArticleAction } from "./diffusion-actions";

// Bouton avec retour visuel : la rédaction par Alfred prend 10-20 secondes,
// sans cela on croit que le bouton ne fait rien.
function SubmitBtn({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <>
      <button className="adm-btn" type="submit" disabled={disabled || pending}>
        {pending ? "Alfred rédige…" : "Préparer les posts"}
      </button>
      {pending && (
        <span className="muted" style={{ fontSize: ".84rem", marginLeft: ".7rem" }}>
          Un instant — les brouillons arrivent dans « Réseaux sociaux ».
        </span>
      )}
    </>
  );
}

// Panneau de diffusion : depuis un article, préparer des posts réseaux avec une
// image de front au choix par réseau. Les brouillons partent dans la file.
export function ArticleDiffusion({ title, excerpt }: { title: string; excerpt: string }) {
  const [linkedin, setLinkedin] = useState(true);
  const [instagram, setInstagram] = useState(false);

  return (
    <div className="adm-card" style={{ marginTop: "1.6rem" }}>
      <h2>Diffuser sur les réseaux</h2>
      <p className="muted" style={{ color: "var(--ink3)", fontSize: ".86rem", margin: "0 0 1.1rem" }}>
        Préparez des brouillons de posts à partir de cet article. Choisissez une image de front
        différente selon le réseau. Alfred rédige le texte (si sa clé API est configurée) — vous
        relisez et publiez ensuite depuis « Réseaux sociaux ».
      </p>
      <form action={diffuseArticleAction}>
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="excerpt" value={excerpt} />

        <label className="adm-diff-net">
          <input type="checkbox" name="net_linkedin" checked={linkedin} onChange={(e) => setLinkedin(e.target.checked)} />
          <b>LinkedIn</b>
        </label>
        {linkedin && (
          <div className="adm-field" style={{ margin: ".4rem 0 1.1rem" }}>
            <label>Image de front LinkedIn <small>(optionnel)</small></label>
            <ImageField name="img_linkedin" />
          </div>
        )}

        <label className="adm-diff-net">
          <input type="checkbox" name="net_instagram" checked={instagram} onChange={(e) => setInstagram(e.target.checked)} />
          <b>Instagram</b>
        </label>
        {instagram && (
          <div className="adm-field" style={{ margin: ".4rem 0 1.1rem" }}>
            <label>Image de front Instagram <small>(optionnel)</small></label>
            <ImageField name="img_instagram" />
          </div>
        )}

        <div className="adm-field" style={{ maxWidth: 260 }}>
          <label>Date de publication prévue <small>(optionnel)</small></label>
          <input type="date" name="scheduledDate" />
          <small style={{ color: "var(--ink3)" }}>Sans date : brouillon. Avec une date : planifié.</small>
        </div>

        <div className="adm-actions" style={{ marginTop: ".6rem", alignItems: "center" }}>
          <SubmitBtn disabled={!linkedin && !instagram} />
        </div>
      </form>
    </div>
  );
}
