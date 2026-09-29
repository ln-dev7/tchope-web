"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { motion } from "framer-motion"
import { Camera, Loader2, Mic, SendHorizontal, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LiveState } from "@/hooks/use-live-cooking"

type Props = {
  state: LiveState
  mode: "audio" | "camera"
  inputMode: "voice" | "text"
  isFr: boolean
  /** Raccourci clavier Espace actif (désactivé quand une fenêtre est ouverte). */
  shortcutEnabled: boolean
  onMicPress: () => void
  onMicRelease: () => void
  onSubmitText: (text: string) => boolean
  onPhoto: () => void
  onEnd: () => void
  holdLabel: string
  tapToStopLabel: string
  endLabel: string
  photoLabel: string
  placeholder: string
}

/** Un appui bref (clic) garde le micro ouvert jusqu'au clic suivant. */
const TAP_MAX_MS = 350

const SIDE_BUTTON =
  "flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-foreground/10 bg-white transition-[opacity,background-color] hover:bg-foreground/[0.03] disabled:cursor-not-allowed disabled:opacity-40 dark:border-transparent dark:bg-dark-surface dark:hover:bg-white/10"

/**
 * Commandes (équivalent de LiveCookingControls.tsx) : appareil photo, micro
 * « maintenir pour parler » (souris, tactile, Espace) et fin de session.
 * En mode clavier, le micro est remplacé par un champ texte.
 */
export function LiveCookingControls({
  state,
  mode,
  inputMode,
  isFr,
  shortcutEnabled,
  onMicPress,
  onMicRelease,
  onSubmitText,
  onPhoto,
  onEnd,
  holdLabel,
  tapToStopLabel,
  endLabel,
  photoLabel,
  placeholder,
}: Props) {
  const isListening = state === "listening"
  const isThinking = state === "thinking"
  const isSpeaking = state === "speaking"
  // Disable mic and photo when AI is processing or speaking
  const micDisabled = isThinking || isSpeaking
  const photoDisabled = isThinking || isSpeaking

  const [latched, setLatched] = useState(false)
  const [pressing, setPressing] = useState(false)
  const [text, setText] = useState("")
  const pressRef = useRef<{ active: boolean; startedAt: number; stopOnUp: boolean }>({
    active: false,
    startedAt: 0,
    stopOnUp: false,
  })
  const latchedOpen = latched && isListening

  // Passage en mode clavier pendant un appui (erreur micro) : le bouton disparaît
  // sans relâchement, on repart d'un appui neutre.
  const [prevInputMode, setPrevInputMode] = useState(inputMode)
  if (inputMode !== prevInputMode) {
    setPrevInputMode(inputMode)
    setPressing(false)
    setLatched(false)
  }
  useEffect(() => {
    if (inputMode !== "voice") pressRef.current = { active: false, startedAt: 0, stopOnUp: false }
  }, [inputMode])

  // Dernières valeurs pour les écouteurs clavier globaux.
  const latest = useRef({ micDisabled, latchedOpen, onMicPress, onMicRelease })
  useEffect(() => {
    latest.current = { micDisabled, latchedOpen, onMicPress, onMicRelease }
  })

  const beginPress = () => {
    const { micDisabled: disabled, latchedOpen: open } = latest.current
    if (pressRef.current.active) return
    if (open) {
      // Deuxième appui en mode « clic » : on arrête au relâchement.
      pressRef.current = { active: true, startedAt: Date.now(), stopOnUp: true }
      return
    }
    if (disabled) return
    pressRef.current = { active: true, startedAt: Date.now(), stopOnUp: false }
    setLatched(false)
    setPressing(true)
    latest.current.onMicPress()
  }

  const endPress = () => {
    const press = pressRef.current
    if (!press.active) return
    pressRef.current = { active: false, startedAt: 0, stopOnUp: false }
    setPressing(false)
    if (press.stopOnUp) {
      setLatched(false)
      latest.current.onMicRelease()
      return
    }
    if (Date.now() - press.startedAt < TAP_MAX_MS) {
      setLatched(true)
      return
    }
    latest.current.onMicRelease()
  }

  const endPressRef = useRef(endPress)
  const beginPressRef = useRef(beginPress)
  useEffect(() => {
    endPressRef.current = endPress
    beginPressRef.current = beginPress
  })

  // Espace = maintenir pour parler (hors champs, boutons et fenêtres).
  useEffect(() => {
    if (!shortcutEnabled || inputMode !== "voice") return
    const isIgnoredTarget = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      !!target.closest("input, textarea, select, button, a, [contenteditable='true'], [role='dialog']")
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat || isIgnoredTarget(e.target)) return
      e.preventDefault()
      beginPressRef.current()
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space" || isIgnoredTarget(e.target)) return
      e.preventDefault()
      endPressRef.current()
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [shortcutEnabled, inputMode])

  // Relâchement manqué (fenêtre qui perd le focus pendant l'appui).
  useEffect(() => {
    const onBlur = () => endPressRef.current()
    window.addEventListener("blur", onBlur)
    return () => window.removeEventListener("blur", onBlur)
  }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (micDisabled || !text.trim()) return
    if (onSubmitText(text)) setText("")
  }

  const hint = latchedOpen
    ? tapToStopLabel
    : isListening || pressing
      ? ""
      : holdLabel

  const photoButton =
    mode === "audio" ? (
      <button
        type="button"
        onClick={onPhoto}
        disabled={photoDisabled}
        aria-label={photoLabel}
        title={photoLabel}
        className={cn(SIDE_BUTTON, inputMode === "text" ? "size-12" : "size-14")}
      >
        <Camera className="size-6 text-primary" />
      </button>
    ) : (
      <div className={cn("shrink-0", inputMode === "text" ? "size-12" : "size-14")} />
    )

  const endButton = (
    <button
      type="button"
      onClick={onEnd}
      aria-label={endLabel}
      title={endLabel}
      className={cn(SIDE_BUTTON, inputMode === "text" ? "size-12" : "size-14")}
    >
      <X className="size-6 text-muted dark:text-dark-muted" />
    </button>
  )

  if (inputMode === "text") {
    return (
      <div className="mx-auto flex w-full max-w-xl items-center gap-2.5 px-4 sm:gap-3">
        {photoButton}
        <form
          onSubmit={handleSubmit}
          className="flex h-12 min-w-0 flex-1 items-center gap-1.5 rounded-full border border-foreground/10 bg-white pr-1.5 pl-4 focus-within:border-primary/50 dark:border-white/10 dark:bg-dark-surface"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            enterKeyHint="send"
            aria-label={placeholder}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted dark:text-white dark:placeholder:text-dark-muted"
          />
          <button
            type="submit"
            disabled={micDisabled || !text.trim()}
            aria-label={isFr ? "Envoyer" : "Send"}
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isThinking ? (
              <Loader2 className="size-[18px] animate-spin" />
            ) : (
              <SendHorizontal className="size-[18px]" />
            )}
          </button>
        </form>
        {endButton}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-8 px-6">
      {photoButton}

      {/* Main mic button */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          {isListening && (
            <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-[#F97F06]/40 motion-reduce:hidden dark:bg-[#FFB347]/40" />
          )}
          <motion.button
            type="button"
            disabled={micDisabled}
            aria-label={latchedOpen ? tapToStopLabel : holdLabel}
            aria-pressed={isListening}
            animate={{ scale: isListening ? 1.08 : 1 }}
            transition={{ type: "spring", damping: 14, stiffness: 260 }}
            onPointerDown={(e) => {
              if (e.button !== 0) return
              e.preventDefault()
              e.currentTarget.setPointerCapture?.(e.pointerId)
              beginPress()
            }}
            onPointerUp={() => endPress()}
            onPointerCancel={() => endPress()}
            onLostPointerCapture={() => endPress()}
            onKeyDown={(e) => {
              if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                e.preventDefault()
                beginPress()
              }
            }}
            onKeyUp={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault()
                endPress()
              }
            }}
            onContextMenu={(e) => e.preventDefault()}
            className={cn(
              "relative flex size-[72px] cursor-pointer touch-none items-center justify-center rounded-full text-white shadow-[0_6px_16px_-4px_rgba(0,0,0,0.25)] transition-[background-color,opacity] select-none [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent] disabled:cursor-not-allowed disabled:opacity-50",
              isListening ? "bg-[#F97F06] dark:bg-[#FFB347]" : "bg-primary"
            )}
          >
            <Mic className="size-8" strokeWidth={isListening ? 2.5 : 2} />
          </motion.button>
        </div>
        <p className="h-4 text-xs text-muted dark:text-dark-muted">
          {hint}
          {hint && !latchedOpen && (
            <span className="hidden md:inline">
              {" · "}
              <kbd className="rounded border border-foreground/15 px-1 font-sans text-[10px] dark:border-white/20">
                {isFr ? "Espace" : "Space"}
              </kbd>
            </span>
          )}
        </p>
      </div>

      {endButton}
    </div>
  )
}
