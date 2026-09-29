"use client"

import { Camera, Hand, Mic, Play, X } from "lucide-react"
import { motion } from "framer-motion"
import type { TranslationKey } from "@/constants/translations"

const FEATURES: { icon: typeof Mic; key: TranslationKey }[] = [
  { icon: Mic, key: "liveExplainFeature1" },
  { icon: Camera, key: "liveExplainFeature2" },
  { icon: Hand, key: "liveExplainFeature3" },
]

/**
 * Écran d'introduction TchopAI Live (équivalent de LiveIntroScreen.tsx) :
 * présente le fonctionnement du mode avant de démarrer la session.
 */
export function LiveIntroScreen({
  t,
  isFr,
  onClose,
  onStart,
}: {
  t: (key: TranslationKey) => string
  isFr: boolean
  onClose: () => void
  onStart: () => void
}) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-6 pt-4 pb-6">
        {/* Close */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label={isFr ? "Fermer" : "Close"}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-foreground/5 dark:bg-dark-surface dark:text-white dark:hover:bg-white/10"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 16, stiffness: 180 }}
            className="mt-6 flex justify-center"
          >
            <div className="relative flex size-20 items-center justify-center rounded-full bg-[#A855F7]/[0.08] dark:bg-[#A855F7]/15">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#A855F7]/10 [animation-duration:2.4s] motion-reduce:hidden" />
              <Mic className="relative size-10 text-[#A855F7]" />
            </div>
          </motion.div>

          {/* Title + Description */}
          <h1 className="mt-5 text-center text-2xl font-extrabold tracking-tight text-foreground dark:text-white">
            {t("liveExplainTitle")}
          </h1>
          <p className="mt-3 px-2 text-center text-[15px] leading-[22px] text-muted dark:text-dark-muted">
            {t("liveExplainDesc")}
          </p>

          {/* Features */}
          <div className="mt-8 flex flex-col gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * (i + 1), duration: 0.3 }}
                className="flex items-center gap-3.5 rounded-2xl border border-foreground/10 bg-white p-4 dark:border-transparent dark:bg-dark-surface"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#A855F7]/[0.06] dark:bg-[#A855F7]/[0.12]">
                  <f.icon className="size-5 text-[#A855F7]" />
                </div>
                <span className="flex-1 text-[15px] font-medium text-foreground dark:text-white">
                  {t(f.key)}
                </span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={onStart}
            className="mt-8 flex cursor-pointer items-center justify-center gap-2 rounded-[20px] bg-primary py-4 text-base font-bold text-white shadow-[0_8px_20px_-8px_rgba(232,118,42,0.7)] transition-colors hover:bg-primary-dark active:scale-[0.99]"
          >
            <Play className="size-[18px] fill-current" />
            {t("liveStartCta")}
          </button>
        </div>
      </div>
    </div>
  )
}
