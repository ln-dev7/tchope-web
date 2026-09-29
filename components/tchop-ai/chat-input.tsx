"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import { Camera, SendHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import type { useAppTranslations } from "@/hooks/use-app-translations"
import { focusRing } from "./styles"

export const MAX_INPUT_LENGTH = 500
const MAX_TEXTAREA_HEIGHT = 120

type Props = {
  input: string
  setInput: (text: string) => void
  loading: boolean
  canSend: boolean
  canPhoto: boolean
  isFr: boolean
  onSend: () => void
  onPhoto: () => void
  t: ReturnType<typeof useAppTranslations>["t"]
}

/**
 * Champ du chat (comme tchope/components/tchop-ai/ChatInput.tsx) : bouton photo,
 * zone de texte qui s'agrandit (500 caractères max), bouton d'envoi violet.
 * Entrée envoie, Maj+Entrée va à la ligne.
 */
export function ChatInput({ input, setInput, loading, canSend, canPhoto, isFr, onSend, onPhoto, t }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sendEnabled = !!input.trim() && !loading && canSend
  const photoDisabled = loading || !canPhoto

  // Hauteur automatique (1 ligne → ~5 lignes), comme le TextInput multiline du mobile.
  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
    el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden"
  }, [input])

  // Sur ordinateur (souris/trackpad), le champ est prêt à taper dès l'ouverture.
  // Pas sur téléphone, pour ne pas ouvrir le clavier d'office.
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) textareaRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      if (sendEnabled) onSend()
    }
  }

  const remaining = MAX_INPUT_LENGTH - input.length

  return (
    <div className="shrink-0 border-t border-foreground/5 bg-background pb-[max(env(safe-area-inset-bottom),0.75rem)] dark:border-white/5 dark:bg-dark">
      <div className="mx-auto w-full max-w-3xl px-4 pt-2 sm:px-6">
        <div className="flex items-end rounded-3xl bg-surface px-1 ring-[#A855F7]/40 transition-shadow focus-within:ring-2 dark:bg-dark-surface">
          <button
            type="button"
            onClick={onPhoto}
            disabled={photoDisabled}
            aria-label={isFr ? "Envoyer une photo" : "Send a photo"}
            title={isFr ? "Envoyer une photo" : "Send a photo"}
            className={cn(
              "mb-1 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted dark:text-dark-muted dark:hover:bg-white/5 dark:hover:text-white",
              focusRing
            )}
          >
            <Camera className="size-5" />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
            onKeyDown={handleKeyDown}
            placeholder={t("tchopaiPlaceholder")}
            aria-label={t("tchopaiPlaceholder")}
            maxLength={MAX_INPUT_LENGTH}
            rows={1}
            enterKeyHint="send"
            className="min-w-0 flex-1 resize-none bg-transparent px-1 py-3 text-base leading-6 text-foreground outline-none placeholder:text-muted dark:text-white dark:placeholder:text-dark-muted"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!sendEnabled}
            aria-label={isFr ? "Envoyer" : "Send"}
            title={isFr ? "Envoyer" : "Send"}
            className={cn(
              "mb-1 flex size-10 shrink-0 items-center justify-center rounded-full transition-colors",
              sendEnabled
                ? "cursor-pointer bg-[#A855F7] text-white hover:bg-[#9333EA]"
                : "cursor-not-allowed bg-transparent text-muted dark:text-dark-muted",
              focusRing
            )}
          >
            <SendHorizontal className="size-[18px]" />
          </button>
        </div>
        {remaining <= 50 && (
          <p
            aria-live="polite"
            className={cn(
              "mt-1 px-3 text-right text-[11px]",
              remaining <= 0 ? "font-semibold text-red-500" : "text-muted dark:text-dark-muted"
            )}
          >
            {input.length}/{MAX_INPUT_LENGTH}
          </p>
        )}
      </div>
    </div>
  )
}
