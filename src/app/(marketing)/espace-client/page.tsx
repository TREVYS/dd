import { redirect } from "next/navigation";

// L'espace client est désormais hébergé chez Licornne — on redirige toute
// visite de l'ancienne URL (signets, liens externes, résultats de recherche)
// vers le vrai portail plutôt que d'afficher la page « bientôt disponible ».
export default function Page() {
  redirect("https://trevys.licornne.com/espace/connexion/");
}
