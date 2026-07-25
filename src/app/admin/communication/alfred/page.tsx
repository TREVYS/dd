import { redirect } from "next/navigation";

// L'éducation d'Alfred a déménagé dans les Réglages.
export default function Moved() {
  redirect("/admin/reglages/alfred");
}
