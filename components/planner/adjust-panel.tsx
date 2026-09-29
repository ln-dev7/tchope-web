"use client"

import { Check, ChevronDown, Loader2, Sparkles } from "lucide-react"
import type { TranslationKey } from "@/constants/translations"
import { ErrorBanner } from "./error-banner"

/** « Ajuster le plan » : demande libre envoyée à l'IA (violet TchopAI). */
export function AdjustPanel({
  open,
  onToggle,
  value,
  onChange,
  onSubmit,
  isAdjusting,
  errorMessage,
  onDismissError,
  isFr,
  t,
}: {
  open: boolean
  onToggle: () => void
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isAdjusting: boolean
  errorMessage: string | null
  onDismissError: () => void
  isFr: boolean
  t: (key: TranslationKey) => string
}) {
  const disabled = isAdjusting || !value.trim()

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={open ? "planner-adjust" : undefined}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#A855F7]/15 bg-[#A855F7]/8 p-3.5 text-sm font-bold text-[#A855F7] transition-colors hover:bg-[#A855F7]/12 dark:border-[#A855F7]/25 dark:bg-[#A855F7]/12 dark:hover:bg-[#A855F7]/18"
      >
        <Sparkles className="size-[18px]" />
        {t("plannerAdjust")}
        <ChevronDown className={`size-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <form
          id="planner-adjust"
          className="mt-2.5 animate-in space-y-2 fade-in-0 slide-in-from-top-1 duration-200"
          onSubmit={(e) => {
            e.preventDefault()
            if (!disabled) onSubmit()
          }}
        >
          <label htmlFor="planner-adjust-text" className="sr-only">
            {t("plannerAdjustPlaceholder")}
          </label>
          <textarea
            id="planner-adjust-text"
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                if (!disabled) onSubmit()
              }
            }}
            placeholder={t("plannerAdjustPlaceholder")}
            rows={3}
            disabled={isAdjusting}
            className="min-h-[80px] w-full resize-y rounded-[14px] border border-foreground/10 bg-surface p-3.5 text-sm leading-relaxed text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted focus:border-[#A855F7]/40 focus:ring-4 focus:ring-[#A855F7]/10 disabled:opacity-70 dark:border-white/10 dark:bg-dark-surface dark:text-white dark:placeholder:text-dark-muted"
          />
          <button
            type="submit"
            disabled={disabled}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[#A855F7] p-3.5 text-sm font-bold text-white transition-[background-color,opacity] hover:bg-[#9333EA] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#A855F7]"
          >
            {isAdjusting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("plannerAdjusting")}
              </>
            ) : (
              <>
                <Check className="size-[18px]" />
                {t("plannerAdjust")}
              </>
            )}
          </button>
          {errorMessage && (
            <ErrorBanner message={errorMessage} onDismiss={onDismissError} dismissLabel={isFr ? "Fermer" : "Close"} />
          )}
        </form>
      )}
    </div>
  )
}
