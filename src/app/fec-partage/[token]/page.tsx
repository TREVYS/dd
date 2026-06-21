import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function FecSharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const report = await prisma.fecReport.findUnique({
    where: { shareToken: token },
    include: { client: { select: { legalName: true } }, fecImport: { select: { fiscalYear: true } } },
  });

  if (!report) notFound();

  const expired = report.shareExpiresAt && report.shareExpiresAt < new Date();
  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Ce lien de restitution a expiré. Contactez votre cabinet pour un nouvel accès.</p>
      </div>
    );
  }

  await prisma.fecReport.update({
    where: { id: report.id },
    data: { viewedAt: new Date(), viewCount: { increment: 1 } },
  });

  const content = report.content as unknown as {
    summary: string;
    sections: { title: string; body: string }[];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 space-y-6">
        <div>
          <div className="text-sm text-gray-500">{report.client.legalName} — Exercice {report.fecImport.fiscalYear}</div>
          <h1 className="text-2xl font-semibold">{report.title}</h1>
        </div>
        <p className="text-gray-700 leading-relaxed">{content.summary}</p>
        {content.sections?.map((section, i) => (
          <div key={i} className="space-y-1">
            <h2 className="font-semibold text-lg">{section.title}</h2>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{section.body}</p>
          </div>
        ))}
        <div className="border-t pt-4 text-sm text-gray-400">
          Document généré par votre cabinet comptable via TREVYS Cockpit. Pour toute question, contactez votre interlocuteur habituel.
        </div>
      </div>
    </div>
  );
}
