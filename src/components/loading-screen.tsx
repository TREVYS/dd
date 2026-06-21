import { LogoIcon } from "@/components/logo";

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse drop-shadow-[0_0_24px_rgba(109,91,246,0.45)]">
          <LogoIcon size={64} />
        </div>
        <p className="text-sm text-gray-400">Chargement...</p>
      </div>
    </div>
  );
}
