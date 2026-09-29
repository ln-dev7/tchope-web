"use client"

import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { LiveState } from "@/hooks/use-live-cooking"

type Props = {
  subtitle: string
  userTranscript: string
  state: LiveState
}

/**
 * Sous-titres (équivalent de LiveSubtitles.tsx) : pendant l'écoute, ce que
 * l'utilisateur dit (en italique, couleur de marque) ; sinon la réponse de
 * TchopAI ou un message d'erreur.
 */
export function LiveSubtitles({ subtitle, userTranscript, state }: Props) {
  const isUserText = state === "listening" && !!userTranscript
  const displayText = isUserText ? userTranscript : subtitle

  return (
    <div className="px-4 sm:px-6" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        {displayText ? (
          <motion.div
            key={isUserText ? "user" : "assistant"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "mx-auto flex min-h-12 max-w-xl items-center justify-center rounded-2xl px-5 py-3.5",
              isUserText
                ? "border border-primary/25 bg-primary/10 dark:border-transparent dark:bg-primary/20"
                : "border border-foreground/10 bg-surface dark:border-transparent dark:bg-dark-surface"
            )}
          >
            <p
              className={cn(
                "max-h-[7.5rem] overflow-y-auto text-center text-base leading-[22px] [overscroll-behavior:contain]",
                isUserText ? "italic text-primary" : "text-foreground dark:text-white"
              )}
            >
              {displayText}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
