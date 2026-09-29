"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  CirclePause,
  Pause,
  Play,
  Square,
  Timer,
} from "lucide-react"
import { formatTime, timerColor, truncateName } from "@/lib/timer-utils"

export type WidgetTimer = {
  key: string
  name: string
  href: string
  totalSeconds: number
  remainingSeconds: number
  isRunning: boolean
  isPaused: boolean
  isDone: boolean
}

type Labels = {
  ready: string
  paused: string
  pause: string
  resume: string
  stop: string
  close: string
  open: string
  expand: string
  collapse: string
}

/**
 * Widget flottant des minuteurs (même contenu que celui de
 * context/TimerContext.tsx sur mobile) : minuteur qui finit le plus tôt,
 * nombre d'autres minuteurs, contrôles, et lien vers le mode cuisine ou la
 * page Minuteur.
 */
export function TimerWidget({
  timer,
  otherCount,
  minimized,
  onToggleMinimized,
  onPauseResume,
  onStop,
  labels,
  raised = false,
}: {
  timer: WidgetTimer
  otherCount: number
  /** Écrans plein écran avec une barre de saisie en bas (TchopAI) : widget remonté. */
  raised?: boolean
  minimized: boolean
  onToggleMinimized: () => void
  onPauseResume: () => void
  onStop: () => void
  labels: Labels
}) {
  const reduceMotion = useReducedMotion()
  const pulse = timer.isRunning && !reduceMotion
  const bg = timerColor(timer)
  const progress =
    timer.totalSeconds > 0 ? (timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds : 0
  const StateIcon = timer.isDone ? CircleCheck : timer.isPaused ? CirclePause : Timer
  const timeLabel = timer.isDone ? labels.ready : formatTime(timer.remainingSeconds)

  return (
    <motion.div
      // Téléphone : au-dessus des onglets du bas, à gauche (le bouton TchopAI est à droite).
      // Tablette / desktop : en bas à gauche, à côté de la barre latérale.
      className={`fixed left-4 z-50 max-w-[calc(100vw-7.5rem)] origin-bottom-left md:left-[88px] md:max-w-xs lg:left-[236px] ${
        raised ? "bottom-28" : "bottom-24 md:bottom-6"
      }`}
      initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.95 }}
      animate={pulse ? { opacity: 1, y: 0, scale: [1, 1.02, 1] } : { opacity: 1, y: 0, scale: 1 }}
      transition={
        pulse
          ? { scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }, default: { duration: 0.25 } }
          : { duration: 0.25 }
      }
    >
      <div
        role="region"
        aria-label={timer.name}
        className="rounded-3xl text-white shadow-xl shadow-black/25 transition-colors"
        style={{ backgroundColor: bg }}
      >
        {minimized ? (
          <button
            type="button"
            onClick={onToggleMinimized}
            aria-label={labels.expand}
            title={labels.expand}
            className="flex h-12 cursor-pointer items-center gap-1.5 rounded-3xl px-4"
          >
            <StateIcon className="size-[18px] shrink-0" />
            <span className="text-base font-bold tabular-nums">
              {timer.isDone ? "!" : formatTime(timer.remainingSeconds)}
            </span>
            {otherCount > 0 && <CountBadge count={otherCount} />}
            <ChevronUp className="size-4 shrink-0 text-white/70" />
          </button>
        ) : (
          <div className="flex w-[216px] max-w-full flex-col items-center gap-2 px-4 pt-3 pb-2">
            <div className="flex w-full items-center gap-2">
              <StateIcon className="size-4 shrink-0" />
              <Link
                href={timer.href}
                className="min-w-0 flex-1 truncate text-[13px] font-semibold text-white/80 hover:text-white"
                title={timer.name}
              >
                {timer.isPaused
                  ? `${truncateName(timer.name)} (${labels.paused})`
                  : truncateName(timer.name)}
              </Link>
              {otherCount > 0 && <CountBadge count={otherCount} />}
            </div>

            <Link
              href={timer.href}
              aria-label={`${timer.name} — ${labels.open}`}
              className="text-[28px] leading-tight font-extrabold tabular-nums"
            >
              {timeLabel}
            </Link>

            {!timer.isDone && (
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-[width] duration-500 ease-linear"
                  style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
                />
              </div>
            )}

            <div className="mt-1 flex items-center gap-2">
              {timer.isDone ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="flex h-9 cursor-pointer items-center justify-center rounded-full bg-white/20 px-4 text-xs font-semibold transition-colors hover:bg-white/30"
                >
                  {labels.close}
                </button>
              ) : (
                <>
                  <WidgetButton
                    label={timer.isPaused ? labels.resume : labels.pause}
                    onClick={onPauseResume}
                    strong
                  >
                    {timer.isPaused ? (
                      <Play className="size-[18px] fill-current" />
                    ) : (
                      <Pause className="size-[18px] fill-current" />
                    )}
                  </WidgetButton>
                  <WidgetButton label={labels.stop} onClick={onStop}>
                    <Square className="size-4 fill-current" />
                  </WidgetButton>
                </>
              )}
              <Link
                href={timer.href}
                aria-label={labels.open}
                title={labels.open}
                className="flex size-9 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
              >
                <ChevronRight className="size-[18px]" />
              </Link>
            </div>

            <button
              type="button"
              onClick={onToggleMinimized}
              aria-label={labels.collapse}
              title={labels.collapse}
              className="flex h-6 w-12 cursor-pointer items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronDown className="size-[18px]" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function CountBadge({ count }: { count: number }) {
  return (
    <span className="shrink-0 rounded-full bg-white/30 px-1.5 py-px text-[11px] font-bold">+{count}</span>
  )
}

function WidgetButton({
  label,
  onClick,
  strong,
  children,
}: {
  label: string
  onClick: () => void
  strong?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors ${
        strong ? "bg-white/25 hover:bg-white/35" : "bg-white/15 hover:bg-white/25"
      }`}
    >
      {children}
    </button>
  )
}
