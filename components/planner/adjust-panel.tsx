"use client"

import { Sparkles } from "lucide-react"
import type { TranslationKey } from "@/constants/translations"

/** « Ajuster le plan » : demande à l'IA, dans l'app (ouvre la fenêtre « dans l'app »). */
export function AdjustPanel({
  onOpen,
  t,
}: {
  onOpen: () => void
  t: (key: TranslationKey) => string
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-primary/15 bg-primary/8 p-3.5 text-sm font-bold text-primary transition-colors hover:bg-primary/12 dark:border-primary/25 dark:bg-primary/12 dark:hover:bg-primary/18"
    >
      <Sparkles className="size-[18px]" />
      {t("plannerAdjust")}
    </button>
  )
}
