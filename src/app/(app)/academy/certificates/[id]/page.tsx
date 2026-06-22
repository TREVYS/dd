import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { LogoIcon } from "@/components/logo";
import { PrintButton } from "./print-button";

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: { formation: { select: { title: true, durationMinutes: true } }, user: { select: { firstName: true, lastName: true } } },
  });

  if (!certificate || certificate.userId !== session.user.id) notFound();

  return (
    <div className="min-h-[80vh] flex items-center justify-center print:min-h-0">
      <div className="glass-panel rounded-3xl p-12 max-w-2xl w-full text-center border-4 border-brand/20">
        <div className="flex justify-center mb-6">
          <LogoIcon size={48} />
        </div>
        <p className="text-xs uppercase tracking-widest text-gray-400">Certificat de réussite</p>
        <h1 className="text-2xl font-semibold mt-3">
          {certificate.user.firstName} {certificate.user.lastName}
        </h1>
        <p className="text-sm text-gray-500 mt-2">a complété avec succès la formation</p>
        <h2 className="text-xl font-semibold text-brand mt-3">{certificate.formation.title}</h2>
        <div className="flex justify-center gap-8 mt-6 text-sm text-gray-500">
          <span>Obtenu le {certificate.issuedAt.toLocaleDateString("fr-FR")}</span>
          {certificate.score !== null && <span>Score : {certificate.score}%</span>}
        </div>
        <p className="text-xs text-gray-400 mt-8">TREVYS Academy</p>
        <PrintButton />
      </div>
    </div>
  );
}
