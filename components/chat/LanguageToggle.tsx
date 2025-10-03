"use client";

import { Languages } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Language } from "@/lib/utils/language";

interface LanguageToggleProps {
  language: Language;
  onChange: (language: Language) => void;
}

export function LanguageToggle({ language, onChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
      <Languages className="w-4 h-4 text-gray-600 ml-1" />
      <button
        onClick={() => onChange("ar")}
        className={cn(
          "px-3 py-1 rounded text-sm font-medium transition-all",
          language === "ar"
            ? "bg-white text-primary-600 shadow-sm font-arabic"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        عربي
      </button>
      <button
        onClick={() => onChange("fr")}
        className={cn(
          "px-3 py-1 rounded text-sm font-medium transition-all",
          language === "fr"
            ? "bg-white text-primary-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        Français
      </button>
    </div>
  );
}
