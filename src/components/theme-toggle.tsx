"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
      className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
