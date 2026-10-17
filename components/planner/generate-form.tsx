"use client"

import { Sparkles, Utensils } from "lucide-react"
import type { TranslationKey } from "@/constants/translations"

/** Pas encore de plan : le planning par l'IA est dans l'app (ouvre la fenêtre « dans l'app »). */
export function GenerateForm({ onSubmit, t }: { onSubmit: () => void; t: (key: TranslationKey) => string }) {
  return (
    <section className="mx-auto w-full max-w-xl">
      <div className="flex flex-col items-center py-6 text-center">
        <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/15">
          <Utensils className="size-9 text-primary" />
        </div>
        <h2 className="text-[17px] font-bold text-foreground dark:text-white">{t("plannerEmptyState")}</h2>
        <p className="mt-1.5 max-w-sm text-[13px] leading-[18px] text-muted dark:text-dark-muted">
          {t("plannerEmptyStateSubtitle")}
        </p>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-primary p-[18px] text-base font-bold text-white shadow-lg shadow-primary/20 transition-[background-color,transform] hover:bg-primary-dark active:scale-[0.99]"
      >
        <Sparkles className="size-5" />
        {t("plannerGenerate")}
      </button>
    </section>
  )
}
