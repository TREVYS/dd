"use client";

import { useActionState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LogoFull } from "@/components/logo";
import { resetPasswordAction, type ResetState } from "../actions";

const initial: ResetState = { ok: false, message: "" };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("e") ?? "";
  const token = params.get("t") ?? "";
  const [state, action, pending] = useActionState(resetPasswordAction, initial);

  useEffect(() => {
    if (state.ok) {
      const t = setTimeout(() => router.push("/login"), 2000);
      return () => clearTimeout(t);
    }
  }, [state.ok, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md glass-panel rounded-3xl shadow-sm p-8">
        <div className="flex items-center mb-8">
          <LogoFull height={34} />
        </div>
        <h1 className="text-2xl font-semibold mb-1">Nouveau mot de passe</h1>

        {!email || !token ? (
          <p className="text-sm text-red-500 mt-4">
            Lien invalide.{" "}
            <Link href="/login/mot-de-passe-oublie" className="underline">Refaire une demande</Link>.
          </p>
        ) : state.ok ? (
          <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 mt-2">
            {state.message} Redirection…
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">Choisissez un nouveau mot de passe (10 caractères minimum).</p>
            <form action={action} className="space-y-4">
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="token" value={token} />
              <div>
                <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={10}
                  autoFocus
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="••••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
                <input
                  type="password"
                  name="confirm"
                  required
                  minLength={10}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="••••••••••"
                />
              </div>
              {state.message && !state.ok && (
                <p className="text-sm text-red-500">{state.message}</p>
              )}
              <button
                type="submit"
                disabled={pending}
                className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {pending ? "Enregistrement…" : "Valider le nouveau mot de passe"}
              </button>
            </form>
          </>
        )}

        <p className="text-sm text-gray-400 mt-6">
          <Link href="/login" className="hover:text-brand">← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
}
