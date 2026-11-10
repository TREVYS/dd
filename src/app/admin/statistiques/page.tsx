import { redirect } from "next/navigation";

// Les statistiques sont désormais fusionnées dans le tableau de bord
// (section « Audience du site ») : l'ancienne adresse y renvoie.
export default async function AdminStats({ searchParams }: { searchParams: Promise<{ periode?: string }> }) {
  const sp = await searchParams;
  redirect(sp.periode ? `/admin?periode=${encodeURIComponent(sp.periode)}#audience` : "/admin#audience");
}
