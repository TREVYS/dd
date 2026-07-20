"use client";

import { useState } from "react";
import { mdToHtml } from "@/lib/md-preview";

export function MarkdownEditor({
  name,
  defaultValue = "",
  placeholder,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div className="adm-md">
      <div className="adm-md-tabs">
        <button type="button" className={tab === "write" ? "on" : ""} onClick={() => setTab("write")}>Écrire</button>
        <button type="button" className={tab === "preview" ? "on" : ""} onClick={() => setTab("preview")}>Aperçu</button>
      </div>
      <div className={`adm-md-panes ${tab}`}>
        <textarea
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
        />
        <div className="adm-md-preview mkt">
          <div className="mkt-article" dangerouslySetInnerHTML={{ __html: mdToHtml(value) || "<p style='color:#9b8f7c'>L’aperçu s’affichera ici…</p>" }} />
        </div>
      </div>
    </div>
  );
}
