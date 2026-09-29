"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  steps: string[]
  currentStep: number
  isFr: boolean
  stepOfLabel: string
  previousLabel: string
  nextLabel: string
  disabled: boolean
  onGoToStep: (step: number) => void
  onSpeakStep: () => void
}

const NAV_BUTTON =
  "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-background text-foreground transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-dark dark:text-white dark:hover:bg-white/10"

/**
 * Étape en cours : suivie par les commandes vocales (« étape suivante »,
 * « reviens »…) et navigable au clic.
 */
export function LiveStepCard({
  steps,
  currentStep,
  isFr,
  stepOfLabel,
  previousLabel,
  nextLabel,
  disabled,
  onGoToStep,
  onSpeakStep,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const total = steps.length
  if (total === 0) return null
  const text = steps[currentStep] ?? ""
  const progress = ((currentStep + 1) / total) * 100

  return (
    <div className="px-4 pt-3 sm:px-5">
      <div className="relative overflow-hidden rounded-2xl border border-foreground/5 bg-surface dark:border-transparent dark:bg-dark-surface">
        <div className="flex items-center gap-2 p-2.5 sm:gap-3 sm:p-3">
          <button
            type="button"
            className={NAV_BUTTON}
            onClick={() => {
              setExpanded(false)
              onGoToStep(currentStep - 1)
            }}
            disabled={currentStep === 0}
            aria-label={previousLabel}
            title={previousLabel}
          >
            <ChevronLeft className="size-5" />
          </button>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="min-w-0 flex-1 cursor-pointer text-left"
          >
            <span className="block text-[11px] font-bold tracking-wide text-primary uppercase">
              {isFr ? "Étape" : "Step"} {currentStep + 1} {stepOfLabel} {total}
            </span>
            <span
              key={currentStep}
              className={cn(
                "mt-0.5 block text-sm leading-5 text-foreground animate-in fade-in-0 slide-in-from-bottom-1 duration-200 dark:text-white",
                !expanded && "line-clamp-2"
              )}
            >
              {text}
            </span>
          </button>

          <button
            type="button"
            className={cn(NAV_BUTTON, "text-primary dark:text-primary")}
            onClick={onSpeakStep}
            disabled={disabled}
            aria-label={isFr ? "Lire l'étape à voix haute" : "Read the step aloud"}
            title={isFr ? "Lire l'étape à voix haute" : "Read the step aloud"}
          >
            <Volume2 className="size-[18px]" />
          </button>

          <button
            type="button"
            className={NAV_BUTTON}
            onClick={() => {
              setExpanded(false)
              onGoToStep(currentStep + 1)
            }}
            disabled={currentStep >= total - 1}
            aria-label={nextLabel}
            title={nextLabel}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
        <div className="h-1 bg-foreground/5 dark:bg-white/5">
          <div
            className="h-full rounded-r-full bg-primary transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
