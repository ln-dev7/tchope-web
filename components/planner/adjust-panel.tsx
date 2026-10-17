"use client"

import { Sparkles } from "lucide-react"
import type { TranslationKey } from "@/constants/translations"

/** « Ajuster le plan » : demande à l'IA, dans l'app (ouvre la fenêtre « dans l'app »). */
export function AdjustPanel({ onOpen, t }: { onOpen: () => void; t: (key: TranslationKey) => string }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#A855F7]/15 bg-[#A855F7]/8 p-3.5 text-sm font-bold text-[#A855F7] transition-colors hover:bg-[#A855F7]/12 dark:border-[#A855F7]/25 dark:bg-[#A855F7]/12 dark:hover:bg-[#A855F7]/18"
    >
      <Sparkles className="size-[18px]" />
      {t("plannerAdjust")}
    </button>
  )
}
