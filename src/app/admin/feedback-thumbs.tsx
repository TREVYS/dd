import { alfredFeedbackAction } from "./actions";
import { getFeedback, type FeedbackKind } from "@/lib/alfred-feedback";

// Pouces d'apprentissage : John note une création d'Alfred, Alfred retient.
export function FeedbackThumbs({
  kind,
  refId,
  excerpt,
  back,
}: {
  kind: FeedbackKind;
  refId: string;
  excerpt: string;
  back: string;
}) {
  const cur = getFeedback(refId, kind)?.verdict;
  const Btn = ({ verdict, active }: { verdict: "up" | "down"; active: boolean }) => (
    <form action={alfredFeedbackAction} style={{ display: "inline" }}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="refId" value={refId} />
      <input type="hidden" name="excerpt" value={excerpt.slice(0, 220)} />
      <input type="hidden" name="verdict" value={verdict} />
      <input type="hidden" name="back" value={back} />
      <button
        className={`adm-thumb${active ? " on" : ""}${verdict === "down" ? " down" : ""}`}
        type="submit"
        title={verdict === "up" ? "J'aime — Alfred retient ce style" : "Je n'aime pas — Alfred évitera ce style"}
        aria-label={verdict === "up" ? "Pouce vers le haut" : "Pouce vers le bas"}
      >
        <svg viewBox="0 0 24 24" style={verdict === "down" ? { transform: "rotate(180deg)" } : undefined}>
          <path d="M7 10v12M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88z" />
        </svg>
      </button>
    </form>
  );
  return (
    <span className="adm-thumbs">
      <Btn verdict="up" active={cur === "up"} />
      <Btn verdict="down" active={cur === "down"} />
      {cur && <small>{cur === "up" ? "Alfred a noté : à reproduire" : "Alfred a noté : à éviter"}</small>}
    </span>
  );
}
