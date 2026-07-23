"use client";

import { useState } from "react";
import { ImageField } from "../image-field";
import { diffuseArticleAction } from "./diffusion-actions";

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

        <div className="adm-actions" style={{ marginTop: ".6rem" }}>
          <button className="adm-btn" type="submit" disabled={!linkedin && !instagram}>
            Préparer les brouillons de posts
          </button>
        </div>
      </form>
    </div>
  );
}
