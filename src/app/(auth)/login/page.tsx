"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md glass-panel rounded-3xl shadow-sm p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-brand flex items-center justify-center text-white font-bold">
            T
          </div>
          <span className="text-xl font-semibold">TREVYS OS</span>
        </div>
        <h1 className="text-2xl font-semibold mb-1">Connexion</h1>
        <p className="text-sm text-gray-500 mb-6">
          Accédez à votre espace cabinet.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="vous@trevys-advisory.fr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-6">
          Comptes démo : associe@trevys-advisory.fr / manager@trevys-advisory.fr
          / collab@trevys-advisory.fr — mot de passe trevys2024
        </p>
      </div>
    </div>
  );
}
