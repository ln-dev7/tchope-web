"use client"

import { Check, CircleCheck, CirclePause, CornerUpLeft, Pause, Play, Square, Timer } from "lucide-react"
import type { TranslationKey } from "@/constants/translations"
import { formatTime, timerColor } from "@/lib/timer-utils"
import { isTimerDone, type TimerEntry } from "@/stores/timers"

type Actions = {
  currentStep: number
  onGoToStep: (index: number) => void
  onPauseResume: (entry: TimerEntry) => void
  onStop: (entry: TimerEntry) => void
  t: (key: TranslationKey) => string
}

/** Grande carte de minuteur du mode cuisine (un seul minuteur pour la recette). */
export function RecipeTimerCard({ entry, currentStep, onGoToStep, onPauseResume, onStop, t }: Actions & { entry: TimerEntry }) {
  const isDone = isTimerDone(entry)
  const progress = entry.totalSeconds > 0 ? (entry.totalSeconds - entry.remainingSeconds) / entry.totalSeconds : 0
  const isOnDifferentStep = entry.stepIndex != null && entry.stepIndex !== currentStep
  const StateIcon = isDone ? CircleCheck : entry.isPaused ? CirclePause : Timer

  return (
    <div
      className="flex flex-col gap-2.5 rounded-[20px] p-4 text-white shadow-sm transition-colors"
      style={{ backgroundColor: timerColor({ ...entry, isDone }) }}
    >
      {isOnDifferentStep && entry.stepIndex != null && (
        <button
          type="button"
          onClick={() => onGoToStep(entry.stepIndex!)}
          className="flex w-fit cursor-pointer items-center gap-1 text-xs font-semibold text-white/70 transition-colors hover:text-white"
        >
          <CornerUpLeft className="size-3.5" />
          {t("stepTimer")} {entry.stepIndex + 1}
        </button>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <StateIcon className="size-5 shrink-0" />
          <span className="truncate text-[28px] leading-tight font-extrabold tabular-nums" aria-live="off">
            {isDone ? t("timerReady") : formatTime(entry.remainingSeconds)}
          </span>
        </div>
        <div className="flex shrink-0 gap-2">
          {!isDone && (
            <button
              type="button"
              onClick={() => onPauseResume(entry)}
              aria-label={entry.isPaused ? t("timerResume") : t("timerPause")}
              title={entry.isPaused ? t("timerResume") : t("timerPause")}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/25 transition-colors hover:bg-white/35"
            >
              {entry.isPaused ? <Play className="size-5 fill-current" /> : <Pause className="size-5 fill-current" />}
            </button>
          )}
          <button
            type="button"
            onClick={() => onStop(entry)}
            className="flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-white/15 px-4 text-[13px] font-semibold transition-colors hover:bg-white/25"
          >
            {isDone ? <Check className="size-[18px]" /> : <Square className="size-4 fill-current" />}
            {isDone ? t("timerClose") : t("timerStop")}
          </button>
        </div>
      </div>
      {!isDone && (
        <div className="h-1 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-500 ease-linear"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
      )}
    </div>
  )
}

/** Pastille compacte (plusieurs minuteurs) : un clic va à l'étape, les boutons contrôlent le minuteur. */
export function RecipeTimerPill({ entry, currentStep, onGoToStep, onPauseResume, onStop, t }: Actions & { entry: TimerEntry }) {
  const isDone = isTimerDone(entry)
  const isCurrent = entry.stepIndex === currentStep

  return (
    <div
      className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full pr-1 pl-1 text-white transition-shadow ${
        isCurrent ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-background dark:ring-offset-dark" : ""
      }`}
      style={{ backgroundColor: timerColor({ ...entry, isDone }) }}
    >
      <button
        type="button"
        onClick={() => entry.stepIndex != null && onGoToStep(entry.stepIndex)}
        aria-label={entry.stepIndex != null ? `${t("stepTimer")} ${entry.stepIndex + 1}` : entry.recipeName}
        className="flex h-full cursor-pointer items-center gap-1.5 rounded-full pl-2.5"
      >
        {entry.stepIndex != null && (
          <span className="text-[11px] font-bold text-white/70">{entry.stepIndex + 1}</span>
        )}
        <span className="text-[15px] font-extrabold tabular-nums">{isDone ? "!" : formatTime(entry.remainingSeconds)}</span>
      </button>
      {!isDone && (
        <button
          type="button"
          onClick={() => onPauseResume(entry)}
          aria-label={entry.isPaused ? t("timerResume") : t("timerPause")}
          title={entry.isPaused ? t("timerResume") : t("timerPause")}
          className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-white/25 transition-colors hover:bg-white/35"
        >
          {entry.isPaused ? <Play className="size-3 fill-current" /> : <Pause className="size-3 fill-current" />}
        </button>
      )}
      <button
        type="button"
        onClick={() => onStop(entry)}
        aria-label={isDone ? t("timerClose") : t("timerStop")}
        title={isDone ? t("timerClose") : t("timerStop")}
        className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
      >
        {isDone ? <Check className="size-3.5" /> : <Square className="size-3 fill-current" />}
      </button>
    </div>
  )
}
