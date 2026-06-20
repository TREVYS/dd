import { prisma } from "@/lib/prisma";

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function ChargePage() {
  const weekStart = startOfWeek(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const users = await prisma.user.findMany({
    where: { status: "active" },
    include: {
      tasksAssigned: {
        where: {
          status: { not: "done" },
        },
      },
    },
    orderBy: { firstName: "asc" },
  });

  const timeByUser = await prisma.timeEntry.groupBy({
    by: ["userId"],
    where: { entryDate: { gte: weekStart, lt: weekEnd } },
    _sum: { durationMinutes: true },
  });
  const timeMap = new Map(timeByUser.map((t) => [t.userId, t._sum.durationMinutes ?? 0]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Plan de charge</h1>
      <p className="text-sm text-gray-500">
        Semaine du {weekStart.toLocaleDateString("fr-FR")}
      </p>

      <div className="bg-white rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-3 px-5">Collaborateur</th>
              <th className="py-3 px-5">Capacité hebdo</th>
              <th className="py-3 px-5">Heures saisies</th>
              <th className="py-3 px-5">Tâches en cours</th>
              <th className="py-3 px-5">Charge</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const capacity = Number(u.weeklyCapacityHours);
              const actualHours = (timeMap.get(u.id) ?? 0) / 60;
              const ratio = capacity > 0 ? Math.min(actualHours / capacity, 1.5) : 0;
              return (
                <tr key={u.id} className="border-b border-gray-50">
                  <td className="py-3 px-5 font-medium">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="py-3 px-5 text-gray-500">{capacity} h</td>
                  <td className="py-3 px-5 text-gray-500">{actualHours.toFixed(1)} h</td>
                  <td className="py-3 px-5 text-gray-500">{u.tasksAssigned.length}</td>
                  <td className="py-3 px-5">
                    <div className="w-32 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full ${ratio > 1 ? "bg-red-400" : "bg-brand"}`}
                        style={{ width: `${ratio * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
