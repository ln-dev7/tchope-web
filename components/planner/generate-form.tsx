"use client"

import { Loader2, Sparkles, Utensils } from "lucide-react"
import type { TranslationKey } from "@/constants/translations"
import { ErrorBanner } from "./error-banner"

/** Pas encore de plan : envies de l'utilisateur et génération par l'IA. */
export function GenerateForm({
  value,
  onChange,
  onSubmit,
  isGenerating,
  errorMessage,
  onDismissError,
  isFr,
  t,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isGenerating: boolean
  errorMessage: string | null
  onDismissError: () => void
  isFr: boolean
  t: (key: TranslationKey) => string
}) {
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

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <label htmlFor="planner-preferences" className="sr-only">
          {t("plannerDescribePlaceholder")}
        </label>
        <textarea
          id="planner-preferences"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              onSubmit()
            }
          }}
          placeholder={t("plannerDescribePlaceholder")}
          rows={4}
          disabled={isGenerating}
          className="min-h-[100px] w-full resize-y rounded-2xl border border-foreground/10 bg-surface p-4 text-sm leading-relaxed text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted focus:border-primary/40 focus:ring-4 focus:ring-primary/10 disabled:opacity-70 dark:border-white/10 dark:bg-dark-surface dark:text-white dark:placeholder:text-dark-muted"
        />

        <button
          type="submit"
          disabled={isGenerating}
          className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-primary p-[18px] text-base font-bold text-white shadow-lg shadow-primary/20 transition-[background-color,transform] hover:bg-primary-dark active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              {t("plannerGenerating")}
            </>
          ) : (
            <>
              <Sparkles className="size-5" />
              {t("plannerGenerate")}
            </>
          )}
        </button>
        <p className="mt-2 hidden text-center text-[11px] text-muted sm:block dark:text-dark-muted">
          {isFr ? "Astuce : Ctrl + Entrée (⌘ + Entrée sur Mac) pour générer" : "Tip: Ctrl + Enter (⌘ + Enter on Mac) to generate"}
        </p>
      </form>

      {errorMessage && (
        <div className="mt-4">
          <ErrorBanner message={errorMessage} onDismiss={onDismissError} dismissLabel={isFr ? "Fermer" : "Close"} />
        </div>
      )}

      {isGenerating && <GeneratingPreview />}
    </section>
  )
}

/** Aperçu animé pendant que l'IA compose le plan. */
function GeneratingPreview() {
  return (
    <div className="mt-8 space-y-5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
          <div className="mb-2.5 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/15" />
            <div className="h-4 w-36 rounded-full bg-foreground/5 dark:bg-white/5" />
          </div>
          <div className="ml-[52px] space-y-2">
            {[0, 1].map((j) => (
              <div
                key={j}
                className="flex h-20 overflow-hidden rounded-2xl border border-foreground/5 bg-surface dark:border-white/5 dark:bg-dark-surface"
              >
                <div className="size-20 shrink-0 bg-foreground/5 dark:bg-white/5" />
                <div className="flex flex-1 flex-col justify-center gap-2 px-3">
                  <div className="h-2.5 w-14 rounded-full bg-primary/15" />
                  <div className="h-3.5 w-3/5 rounded-full bg-foreground/8 dark:bg-white/8" />
                  <div className="h-2.5 w-2/5 rounded-full bg-foreground/5 dark:bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
