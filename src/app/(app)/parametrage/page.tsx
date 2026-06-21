import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, UsersRound, ShieldCheck, GraduationCap, Mail } from "lucide-react";
import { canManageCollaborators, canManageHabilitations, canManageAcademy, canManageEmailSettings } from "@/lib/permissions";

export default async function ParametragePage() {
  const session = await auth();
  if (!canManageCollaborators(session?.user?.role)) {
    redirect("/");
  }

  const cards = [
    {
      href: "/parametrage/collaborateurs",
      title: "Collaborateurs",
      description: "Créer, modifier et affecter les collaborateurs du cabinet.",
      icon: Users,
      show: true,
    },
    {
      href: "/parametrage/equipes",
      title: "Équipes",
      description: "Gérer les équipes, leurs effectifs et leur charge.",
      icon: UsersRound,
      show: true,
    },
    {
      href: "/parametrage/habilitations",
      title: "Droits d'accès & habilitations",
      description: "Attribuer les rôles et activer les modules par profil.",
      icon: ShieldCheck,
      show: canManageHabilitations(session?.user?.role),
    },
    {
      href: "/parametrage/academy",
      title: "Academy TREVYS",
      description: "Gérer les formations, parcours et le suivi des collaborateurs.",
      icon: GraduationCap,
      show: canManageAcademy(session?.user?.role),
    },
    {
      href: "/parametrage/email",
      title: "Envoi de mail",
      description: "Configurer le serveur SMTP utilisé pour l'envoi des rapports clients.",
      icon: Mail,
      show: canManageEmailSettings(session?.user?.role),
    },
  ].filter((c) => c.show);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Paramétrage</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className="glass-panel rounded-2xl p-6 hover:shadow-lg transition block"
            >
              <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-4">
                <Icon size={20} />
              </div>
              <h2 className="font-semibold mb-1">{c.title}</h2>
              <p className="text-sm text-gray-500">{c.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
