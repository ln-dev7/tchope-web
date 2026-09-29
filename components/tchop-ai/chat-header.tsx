"use client"

import { ArrowLeft, History, Sparkles, SquarePen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { useAppTranslations } from "@/hooks/use-app-translations"
import { focusRing, roundButton } from "./styles"

type Props = {
  isFr: boolean
  messageCount: number
  onBack: () => void
  onNewChat: () => void
  onOpenHistory: () => void
  t: ReturnType<typeof useAppTranslations>["t"]
}

const smallButton =
  "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface dark:bg-dark-surface dark:text-white dark:hover:bg-white/10 dark:disabled:hover:bg-dark-surface"

/** En-tête du chat (comme tchope/components/tchop-ai/ChatHeader.tsx). */
export function ChatHeader({ isFr, messageCount, onBack, onNewChat, onOpenHistory, t }: Props) {
  return (
    <header className="shrink-0 border-b border-foreground/5 bg-background/90 backdrop-blur-xl dark:border-white/5 dark:bg-dark/90">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          aria-label={isFr ? "Retour" : "Back"}
          title={isFr ? "Retour" : "Back"}
          className={cn(roundButton, focusRing)}
        >
          <ArrowLeft className="size-5" />
        </button>
        <div
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#A855F7]/10 dark:bg-[#A855F7]/15"
        >
          <Sparkles className="size-[18px] fill-[#A855F7]/20 text-[#A855F7]" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-[17px] leading-tight font-bold text-foreground dark:text-white">
            {t("tchopaiTitle")}
          </h1>
          <p className="truncate text-xs text-muted dark:text-dark-muted">{t("tchopaiSubtitle")}</p>
        </div>
        <button
          type="button"
          onClick={onNewChat}
          disabled={messageCount <= 1}
          aria-label={t("newChat")}
          title={t("newChat")}
          className={cn(smallButton, focusRing)}
        >
          <SquarePen className="size-[18px]" />
        </button>
        <button
          type="button"
          onClick={onOpenHistory}
          aria-label={t("chatHistory")}
          title={t("chatHistory")}
          className={cn(smallButton, focusRing)}
        >
          <History className="size-[18px]" />
        </button>
      </div>
    </header>
  )
}
