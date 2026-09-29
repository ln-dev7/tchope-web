"use client"

import { ArrowLeft, MessagesSquare, Mic, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  recipeName: string
  isFr: boolean
  isMuted: boolean
  onBack: () => void
  onHistory: () => void
  onToggleMute: () => void
}

const ROUND_BUTTON =
  "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-foreground/5 dark:bg-dark-surface dark:text-white dark:hover:bg-white/10"

/** En-tête (équivalent de LiveCookingHeader.tsx) + bouton pour couper la voix. */
export function LiveCookingHeader({
  recipeName,
  isFr,
  isMuted,
  onBack,
  onHistory,
  onToggleMute,
}: Props) {
  const muteLabel = isMuted
    ? isFr
      ? "Réactiver la voix de TchopAI"
      : "Unmute TchopAI"
    : isFr
      ? "Couper la voix de TchopAI"
      : "Mute TchopAI"

  return (
    <header className="flex items-center gap-2 border-b border-foreground/5 px-4 py-3 sm:gap-3 sm:px-5 dark:border-white/5">
      <button
        type="button"
        onClick={onBack}
        className={ROUND_BUTTON}
        aria-label={isFr ? "Retour" : "Back"}
      >
        <ArrowLeft className="size-5" />
      </button>

      <h1 className="min-w-0 flex-1 truncate text-lg font-bold text-foreground dark:text-white">
        {recipeName}
      </h1>

      <button
        type="button"
        onClick={onToggleMute}
        className={cn(ROUND_BUTTON, isMuted && "text-primary dark:text-primary")}
        aria-label={muteLabel}
        aria-pressed={isMuted}
        title={muteLabel}
      >
        {isMuted ? <VolumeX className="size-[18px]" /> : <Volume2 className="size-[18px]" />}
      </button>

      <button
        type="button"
        onClick={onHistory}
        className={cn(ROUND_BUTTON, "text-muted dark:text-dark-muted")}
        aria-label={isFr ? "Historique" : "History"}
        title={isFr ? "Historique" : "History"}
      >
        <MessagesSquare className="size-[18px]" />
      </button>

      <div className="flex shrink-0 items-center gap-1 rounded-xl bg-primary/10 px-2.5 py-1.5 text-primary dark:bg-primary/20">
        <span className="relative flex size-3.5 items-center justify-center">
          <Mic className="size-3.5" />
        </span>
        <span className="text-xs font-bold">Live</span>
        <span className="relative ml-0.5 flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:hidden" />
          <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
        </span>
      </div>
    </header>
  )
}
