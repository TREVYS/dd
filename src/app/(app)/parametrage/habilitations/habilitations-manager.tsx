"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

type Role = { id: string; name: string };
type Permission = { id: string; code: string; module: string };
type RolePermission = { roleId: string; permissionId: string };

const MODULE_LABELS: Record<string, string> = {
  crm: "CRM",
  production: "Production",
  ged: "GED",
  juridique: "Juridique",
  academy: "Academy",
  assistant_ia: "Assistant IA",
  knowledge_cabinet: "Knowledge Cabinet",
  ticketing: "Ticketing",
  reporting: "Reporting",
};

export function HabilitationsManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [pending, setPending] = useState<string | null>(null);

  async function load() {
    const data = await fetch("/api/admin/habilitations").then((r) => r.json());
    setRoles(data.roles);
    setPermissions(data.permissions);
    setRolePermissions(data.rolePermissions);
  }

  useEffect(() => {
    load();
  }, []);

  function isEnabled(roleId: string, permissionId: string) {
    return rolePermissions.some((rp) => rp.roleId === roleId && rp.permissionId === permissionId);
  }

  async function toggle(roleId: string, permissionId: string) {
    const key = `${roleId}-${permissionId}`;
    const enabled = !isEnabled(roleId, permissionId);
    setPending(key);
    setRolePermissions((prev) =>
      enabled
        ? [...prev, { roleId, permissionId }]
        : prev.filter((rp) => !(rp.roleId === roleId && rp.permissionId === permissionId))
    );
    await fetch("/api/admin/habilitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId, permissionId, enabled }),
    });
    setPending(null);
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-100">
            <th className="py-3 px-5">Module</th>
            {roles.map((r) => (
              <th key={r.id} className="py-3 px-5 text-center">{r.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {permissions.map((p) => (
            <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-3 px-5 font-medium">{MODULE_LABELS[p.module] ?? p.module}</td>
              {roles.map((r) => {
                const key = `${r.id}-${p.id}`;
                const enabled = isEnabled(r.id, p.id);
                return (
                  <td key={r.id} className="py-3 px-5 text-center">
                    <button
                      onClick={() => toggle(r.id, p.id)}
                      disabled={pending === key}
                      className={`inline-flex items-center justify-center h-6 w-6 rounded-lg border transition disabled:opacity-50 ${
                        enabled
                          ? "bg-brand border-brand text-white"
                          : "border-gray-200 text-transparent hover:border-brand/50"
                      }`}
                    >
                      <Check size={14} />
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
          {permissions.length === 0 && (
            <tr>
              <td colSpan={roles.length + 1} className="py-8 text-center text-gray-400">
                Aucun module.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
