"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Landmark,
  Calculator,
  Wallet,
  Scale,
} from "lucide-react";

const ICONS = { Landmark, Calculator, Wallet, Scale };

type Lesson = {
  title: string;
  category: string;
  icon: keyof typeof ICONS;
  color: string;
  summary: string;
};

const PER_PAGE = 4;

export function LessonsCarousel({ lessons }: { lessons: Lesson[] }) {
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(lessons.length / PER_PAGE);
  const visible = lessons.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {visible.map((l) => {
          const Icon = ICONS[l.icon];
          return (
            <div
              key={l.title}
              className="rounded-2xl border-2 border-gray-100 p-5 space-y-3 shadow-sm hover:shadow-md hover:border-brand/30 transition"
            >
              <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${l.color}`}>
                <Icon size={14} />
                {l.category}
              </div>
              <p className="font-semibold text-sm leading-snug">{l.title}</p>
              <p className="text-xs text-gray-500 line-clamp-3">{l.summary}</p>
            </div>
          );
        })}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => setPage((p) => (p - 1 + pageCount) % pageCount)}
            className="h-8 w-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500"
            aria-label="Précédent"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === page ? "w-6 bg-brand" : "w-1.5 bg-gray-200"
                }`}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setPage((p) => (p + 1) % pageCount)}
            className="h-8 w-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500"
            aria-label="Suivant"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
