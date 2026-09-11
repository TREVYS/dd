"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LogoFull } from "@/components/logo";
import { requestPasswordResetAction, type ForgotState } from "../actions";

const initial: ForgotState = { sent: false, message: "" };

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initial);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md glass-panel rounded-3xl shadow-sm p-8">
        <div className="flex items-center mb-8">
          <LogoFull height={34} />
        </div>
        <h1 className="text-2xl font-semibold mb-1">Mot de passe oublié</h1>
        <p className="text-sm text-gray-500 mb-6">
          Indiquez votre e-mail : vous recevrez un lien pour choisir un nouveau mot de passe.
        </p>

        {state.sent ? (
          <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4">{state.message}</p>
        ) : (
          <form action={action} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                autoFocus
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="vous@trevys-advisory.fr"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Envoi…" : "Recevoir le lien"}
            </button>
          </form>
        )}

        <p className="text-sm text-gray-400 mt-6">
          <Link href="/login" className="hover:text-brand">← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
}
