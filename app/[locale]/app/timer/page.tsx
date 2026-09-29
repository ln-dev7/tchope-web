"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowLeft,
  CircleArrowRight,
  CircleCheck,
  CirclePause,
  CirclePlus,
  Clock,
  Droplets,
  Egg,
  Eye,
  EyeOff,
  Flame,
  Leaf,
  Pause,
  Play,
  RotateCcw,
  Square,
  Timer,
  Trash2,
  Utensils,
  UtensilsCrossed,
  Volume2,
  VolumeX,
  X,
  type LucideIcon,
} from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import {
  isTimerDone,
  pickNearestTimer,
  useLiveKitchenTimers,
  useLiveRecipeTimers,
  useTimerStore,
  type KitchenTimer,
} from "@/stores/timers"
import { useIsClient } from "@/lib/timer-clock"
import { cookingModeHref, formatTime } from "@/lib/timer-utils"
import { playTimerTick } from "@/lib/timer-sound"
import { useWakeLock } from "@/lib/timer-wake-lock"
import { NumberPicker } from "@/components/timer/number-picker"
import { CircularProgress } from "@/components/timer/circular-progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const PRESETS = [
  { label: "1 min", seconds: 60 },
  { label: "3 min", seconds: 180 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
  { label: "20 min", seconds: 1200 },
  { label: "30 min", seconds: 1800 },
  { label: "45 min", seconds: 2700 },
  { label: "1h", seconds: 3600 },
  { label: "1h30", seconds: 5400 },
  { label: "2h", seconds: 7200 },
  { label: "3h", seconds: 10800 },
]

const COOKING_PRESETS: { labelKey: "timerPresetBoilEgg" | "timerPresetPasta" | "timerPresetRice" | "timerPresetBraise" | "timerPresetMarinade" | "timerPresetSauce"; icon: LucideIcon; seconds: number }[] = [
  { labelKey: "timerPresetBoilEgg", icon: Egg, seconds: 420 },
  { labelKey: "timerPresetPasta", icon: UtensilsCrossed, seconds: 600 },
  { labelKey: "timerPresetRice", icon: Leaf, seconds: 1200 },
  { labelKey: "timerPresetBraise", icon: Flame, seconds: 2700 },
  { labelKey: "timerPresetMarinade", icon: Clock, seconds: 1800 },
  { labelKey: "timerPresetSauce", icon: Droplets, seconds: 2400 },
]

/** Sur la page Minuteur, un minuteur à zéro est « prêt » même s'il était en pause (comme sur mobile). */
function isKitchenDone(timer: KitchenTimer): boolean {
  return timer.totalSeconds > 0 && timer.remainingSeconds === 0 && !timer.isRunning
}

export default function TimerPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const isFr = locale === "fr"
  const reduceMotion = useReducedMotion()
  const isClient = useIsClient()

  // Minuteurs de recette (mode cuisine)
  const recipeTimerList = useLiveRecipeTimers()
  const pauseRecipeTimer = useTimerStore((s) => s.pauseTimer)
  const resumeRecipeTimer = useTimerStore((s) => s.resumeTimer)
  const stopRecipeTimer = useTimerStore((s) => s.stopTimer)

  // Minuteurs de la page
  const timers = useLiveKitchenTimers()
  const createKitchenTimer = useTimerStore((s) => s.createKitchenTimer)
  const pauseKitchenTimer = useTimerStore((s) => s.pauseKitchenTimer)
  const resumeKitchenTimer = useTimerStore((s) => s.resumeKitchenTimer)
  const stopKitchenTimer = useTimerStore((s) => s.stopKitchenTimer)
  const resetKitchenTimer = useTimerStore((s) => s.resetKitchenTimer)
  const addKitchenTime = useTimerStore((s) => s.addKitchenTime)
  const stopAllKitchenTimers = useTimerStore((s) => s.stopAllKitchenTimers)

  // Préférences (gardées d'une visite à l'autre)
  const storedTickSound = useTimerStore((s) => s.tickSound)
  const storedKeepAwake = useTimerStore((s) => s.keepAwake)
  const setTickSound = useTimerStore((s) => s.setTickSound)
  const setKeepAwake = useTimerStore((s) => s.setKeepAwake)
  const tickSound = isClient ? storedTickSound : true
  const keepAwake = isClient ? storedKeepAwake : true

  const [activeTimerId, setActiveTimerId] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(true)
  const [pickerHours, setPickerHours] = useState(0)
  const [pickerMinutes, setPickerMinutes] = useState(5)
  const [pickerSeconds, setPickerSeconds] = useState(0)
  const [timerLabel, setTimerLabel] = useState("")
  const [confirmStopId, setConfirmStopId] = useState<string | null>(null)
  const [confirmStopAll, setConfirmStopAll] = useState(false)
  const pickerRef = useRef<HTMLFormElement>(null)

  // En revenant sur la page, on affiche le minuteur qui finit le plus tôt.
  const [restored, setRestored] = useState(false)
  if (isClient && !restored) {
    setRestored(true)
    const nearest = pickNearestTimer(timers)
    if (nearest) {
      setActiveTimerId(nearest.id)
      setShowPicker(false)
    }
  }

  const activeTimer = timers.find((timer) => timer.id === activeTimerId) ?? null
  const isDone = activeTimer ? isKitchenDone(activeTimer) : false
  const totalPickerSeconds = pickerHours * 3600 + pickerMinutes * 60 + pickerSeconds

  // Écran allumé tant qu'un minuteur tourne.
  useWakeLock(keepAwake && (timers.some((timer) => timer.isRunning) || recipeTimerList.length > 0))

  // Tic-tac à chaque seconde du minuteur affiché.
  const activeRemaining = activeTimer?.remainingSeconds ?? null
  const activeRunning = activeTimer?.isRunning ?? false
  const prevRemainingRef = useRef<number | null>(null)
  useEffect(() => {
    if (!tickSound || !activeRunning || activeRemaining === null) {
      prevRemainingRef.current = activeRemaining
      return
    }
    if (
      prevRemainingRef.current !== null &&
      activeRemaining !== prevRemainingRef.current &&
      activeRemaining > 0 &&
      document.visibilityState === "visible"
    ) {
      playTimerTick()
    }
    prevRemainingRef.current = activeRemaining
  }, [activeRemaining, activeRunning, tickSound])

  // --- Actions ------------------------------------------------------------------

  const createTimer = () => {
    if (totalPickerSeconds <= 0) return
    const label = timerLabel.trim() || `${t("timerPageTitle")} ${timers.length + 1}`
    const id = createKitchenTimer(label, totalPickerSeconds)
    setActiveTimerId(id)
    setShowPicker(false)
    setTimerLabel("")
  }

  const applyDuration = (seconds: number) => {
    setPickerHours(Math.floor(seconds / 3600))
    setPickerMinutes(Math.floor((seconds % 3600) / 60))
    setPickerSeconds(seconds % 60)
    pickerRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" })
  }

  const stopLocalTimer = (id: string) => {
    stopKitchenTimer(id)
    if (activeTimerId === id) {
      setActiveTimerId(null)
      setShowPicker(true)
    }
  }

  const togglePause = (timer: KitchenTimer) => {
    if (timer.isPaused) resumeKitchenTimer(timer.id)
    else pauseKitchenTimer(timer.id)
  }

  const progressColor = isDone
    ? "text-secondary dark:text-green-500"
    : activeTimer?.isPaused
      ? "text-[#FFC107]"
      : "text-primary"

  const hasSide = recipeTimerList.length > 0 || timers.length > 0

  // --- Blocs ----------------------------------------------------------------------

  const recipeBanners = recipeTimerList.length > 0 && (
    <div className="space-y-2">
      {recipeTimerList.map((entry) => {
        const done = isTimerDone(entry)
        return (
          <div
            key={entry.id}
            className="rounded-[20px] border border-primary/20 bg-[#FFF3E0] p-4 dark:bg-[#2A1800]"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Utensils className="size-5" />
              </div>
              <Link
                href={cookingModeHref(locale, entry.recipeId, entry.stepIndex)}
                className="min-w-0 flex-1 rounded-lg hover:opacity-80"
              >
                <span className="block text-[13px] font-semibold text-muted dark:text-dark-muted">
                  {t("timerRecipeTimer")}
                </span>
                <span className="block truncate text-[15px] font-bold text-foreground dark:text-white">
                  {entry.recipeName}
                </span>
              </Link>
              <span
                className={`shrink-0 text-2xl font-extrabold tabular-nums ${
                  done ? "text-secondary dark:text-green-500" : "text-primary"
                }`}
              >
                {done ? t("timerReady") : formatTime(entry.remainingSeconds)}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              {!done && (
                <button
                  type="button"
                  onClick={() => (entry.isPaused ? resumeRecipeTimer(entry.id) : pauseRecipeTimer(entry.id))}
                  className="flex h-[38px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary/10 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/15"
                >
                  {entry.isPaused ? <Play className="size-4 fill-current" /> : <Pause className="size-4 fill-current" />}
                  {entry.isPaused ? t("timerResume") : t("timerPause")}
                </button>
              )}
              <button
                type="button"
                onClick={() => stopRecipeTimer(entry.id)}
                aria-label={done ? t("timerClose") : t("timerStop")}
                title={done ? t("timerClose") : t("timerStop")}
                className={`flex h-[38px] cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#FF4444]/10 px-4 text-[13px] font-semibold text-[#FF4444] transition-colors hover:bg-[#FF4444]/15 ${
                  done ? "flex-1" : ""
                }`}
              >
                {done ? <X className="size-4" /> : <Square className="size-4 fill-current" />}
                {done && t("timerClose")}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )

  const timerList = timers.length > 0 && (
    <section>
      <h2 className="mb-3 text-base font-bold text-foreground dark:text-white">
        {t("timerActiveTimers")} ({timers.length})
      </h2>
      <div className="space-y-2.5">
        {timers.map((timer) => {
          const timerDone = isKitchenDone(timer)
          const isActive = timer.id === activeTimerId && !showPicker
          const timerProgress =
            timer.totalSeconds > 0 ? ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100 : 0
          const tone = timerDone
            ? "bg-secondary/15 text-secondary dark:bg-green-500/15 dark:text-green-500"
            : timer.isPaused
              ? "bg-[#FFC107]/20 text-[#D39E00] dark:text-[#FFC107]"
              : "bg-primary/15 text-primary"
          const StateIcon = timerDone ? CircleCheck : timer.isPaused ? CirclePause : Timer
          return (
            <div
              key={timer.id}
              className={`relative overflow-hidden rounded-[18px] p-4 transition-colors ${
                isActive
                  ? "border-2 border-primary bg-primary/5 dark:bg-primary/10"
                  : "border border-foreground/10 bg-white hover:border-primary/40 dark:border-white/10 dark:bg-dark-surface"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveTimerId(timer.id)
                  setShowPicker(false)
                }}
                aria-label={timer.label}
                className="absolute inset-0 cursor-pointer"
              />
              <div
                className={`absolute bottom-0 left-0 h-[3px] rounded-full transition-[width] duration-500 ${
                  timerDone ? "bg-secondary dark:bg-green-500" : timer.isPaused ? "bg-[#FFC107]" : "bg-primary"
                }`}
                style={{ width: `${Math.min(100, timerProgress)}%` }}
              />
              <div className="pointer-events-none relative flex items-center gap-3">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${tone}`}>
                  <StateIcon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground dark:text-white">{timer.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted dark:text-dark-muted">
                    {timerDone ? t("timerReady") : timer.isPaused ? t("timerPaused") : t("timerRunning")}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[22px] font-extrabold tabular-nums ${
                    timerDone
                      ? "text-secondary dark:text-green-500"
                      : timer.isPaused
                        ? "text-[#D39E00] dark:text-[#FFC107]"
                        : "text-foreground dark:text-white"
                  }`}
                >
                  {timerDone ? "00:00" : formatTime(timer.remainingSeconds)}
                </span>
                <div className="pointer-events-auto flex shrink-0 gap-1.5">
                  {!timerDone && (
                    <button
                      type="button"
                      onClick={() => togglePause(timer)}
                      aria-label={timer.isPaused ? t("timerResume") : t("timerPause")}
                      title={timer.isPaused ? t("timerResume") : t("timerPause")}
                      className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-foreground/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                    >
                      {timer.isPaused ? <Play className="size-3.5 fill-current" /> : <Pause className="size-3.5 fill-current" />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => stopLocalTimer(timer.id)}
                    aria-label={t("timerStop")}
                    title={t("timerStop")}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-[#FF4444]/10 text-[#FF4444] transition-colors hover:bg-[#FF4444]/20"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {timers.length > 1 && (
        <button
          type="button"
          onClick={() => setConfirmStopAll(true)}
          className="mt-3 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[#FF4444]/[0.06] text-sm font-semibold text-[#FF4444] transition-colors hover:bg-[#FF4444]/10"
        >
          <Trash2 className="size-[18px]" />
          {t("timerStopAll")}
        </button>
      )}
    </section>
  )

  // --- Rendu ----------------------------------------------------------------------

  return (
    <div className="space-y-6 pb-4">
      {/* En-tête */}
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label={isFr ? "Retour" : "Back"}
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-foreground/5 dark:bg-dark-surface dark:text-white dark:hover:bg-white/10"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-2xl font-extrabold text-foreground dark:text-white">
          {t("timerPageTitle")}
        </h1>
        <button
          type="button"
          onClick={() => setTickSound(!tickSound)}
          aria-pressed={tickSound}
          className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-2xl px-2.5 py-2 text-[11px] font-semibold transition-colors sm:px-3 sm:text-xs ${
            tickSound
              ? "bg-primary/15 text-primary hover:bg-primary/20"
              : "bg-surface text-muted hover:bg-foreground/5 dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-white/10"
          }`}
        >
          {tickSound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          {t("timerTickSound")}
        </button>
        <button
          type="button"
          onClick={() => setKeepAwake(!keepAwake)}
          aria-pressed={keepAwake}
          aria-label={t("timerKeepAwake")}
          title={t("timerKeepAwake")}
          className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-2xl px-2.5 py-2 text-xs font-semibold transition-colors sm:px-3 ${
            keepAwake
              ? "bg-primary/15 text-primary hover:bg-primary/20"
              : "bg-surface text-muted hover:bg-foreground/5 dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-white/10"
          }`}
        >
          {keepAwake ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          <span className="hidden sm:inline">{t("timerKeepAwake")}</span>
        </button>
      </header>

      <div className={hasSide ? "lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8" : ""}>
        <div className="space-y-6">
          {/* Minuteurs de recette (en haut sur téléphone, à droite sur grand écran) */}
          {recipeBanners && <div className="lg:hidden">{recipeBanners}</div>}

          <div className={`mx-auto w-full ${hasSide ? "max-w-xl" : "max-w-2xl"}`}>
            {showPicker ? (
              <motion.div
                // Ce bloc est rendu côté serveur : `initial` ne doit pas dépendre de
                // useReducedMotion (null au serveur, true/false au client), sinon le
                // style serveur (opacity 0) resterait figé après l'hydratation.
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 26 }}
                className="space-y-7"
              >
                <form
                  ref={pickerRef}
                  onSubmit={(e) => {
                    e.preventDefault()
                    createTimer()
                  }}
                  className="scroll-mt-6 space-y-6"
                >
                  <input
                    type="text"
                    value={timerLabel}
                    onChange={(e) => setTimerLabel(e.target.value)}
                    placeholder={t("timerLabelPlaceholder")}
                    maxLength={60}
                    className="h-12 w-full rounded-[14px] border border-foreground/10 bg-white px-4 text-[15px] text-foreground outline-none placeholder:text-muted focus:border-primary/40 dark:border-white/10 dark:bg-dark-surface dark:text-white dark:placeholder:text-dark-muted"
                  />

                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <NumberPicker value={pickerHours} onChange={setPickerHours} max={23} label={t("timerHours")} />
                    <span className="mb-7 text-3xl font-extrabold text-muted dark:text-dark-muted">:</span>
                    <NumberPicker value={pickerMinutes} onChange={setPickerMinutes} max={59} label={t("timerMinutes")} />
                    <span className="mb-7 text-3xl font-extrabold text-muted dark:text-dark-muted">:</span>
                    <NumberPicker value={pickerSeconds} onChange={setPickerSeconds} max={59} label={t("timerSeconds")} />
                  </div>

                  <button
                    type="submit"
                    disabled={totalPickerSeconds <= 0}
                    className="flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-[20px] bg-primary text-[17px] font-bold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-dark disabled:cursor-default disabled:bg-surface disabled:text-muted disabled:shadow-none dark:disabled:bg-dark-surface dark:disabled:text-dark-muted"
                  >
                    <Play className="size-[22px] fill-current" />
                    {t("timerStart")}
                  </button>
                </form>

                {/* Durées rapides */}
                <section>
                  <h2 className="mb-3 text-base font-bold text-foreground dark:text-white">{t("timerQuickPresets")}</h2>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((preset) => {
                      const selected = preset.seconds === totalPickerSeconds
                      return (
                        <button
                          key={preset.seconds}
                          type="button"
                          onClick={() => applyDuration(preset.seconds)}
                          aria-pressed={selected}
                          className={`cursor-pointer rounded-[14px] border px-4 py-2.5 text-sm font-semibold transition-colors ${
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-foreground/10 bg-white text-foreground hover:border-primary/40 dark:border-white/10 dark:bg-dark-surface dark:text-white"
                          }`}
                        >
                          {preset.label}
                        </button>
                      )
                    })}
                  </div>
                </section>

                {/* Préréglages cuisine */}
                <section>
                  <h2 className="mb-3 text-base font-bold text-foreground dark:text-white">{t("timerCookingPresets")}</h2>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {COOKING_PRESETS.map((preset) => {
                      const label = t(preset.labelKey)
                      const Icon = preset.icon
                      return (
                        <button
                          key={preset.labelKey}
                          type="button"
                          onClick={() => {
                            setTimerLabel(label)
                            applyDuration(preset.seconds)
                          }}
                          className="group flex cursor-pointer items-center gap-3.5 rounded-2xl border border-foreground/10 bg-white p-3.5 text-left transition-colors hover:border-primary/40 dark:border-white/10 dark:bg-dark-surface"
                        >
                          <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary dark:bg-primary/20">
                            <Icon className="size-[22px]" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[15px] font-semibold text-foreground dark:text-white">
                              {label}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted tabular-nums dark:text-dark-muted">
                              {formatTime(preset.seconds)}
                            </span>
                          </span>
                          <CircleArrowRight className="size-6 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                        </button>
                      )
                    })}
                  </div>
                </section>
              </motion.div>
            ) : activeTimer ? (
              <section className="flex flex-col items-center pt-2">
                <p className="mb-5 max-w-full truncate text-[17px] font-bold text-muted dark:text-dark-muted">
                  {activeTimer.label}
                </p>

                <motion.div
                  animate={activeTimer.isRunning && !reduceMotion ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                  transition={
                    activeTimer.isRunning && !reduceMotion
                      ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.2 }
                  }
                >
                  <CircularProgress
                    progress={
                      activeTimer.totalSeconds > 0 ? 1 - activeTimer.remainingSeconds / activeTimer.totalSeconds : 0
                    }
                    colorClassName={progressColor}
                  >
                    {isDone ? (
                      <>
                        <CircleCheck className="size-12 text-secondary dark:text-green-500" />
                        <span className="mt-2 text-[32px] font-black text-secondary dark:text-green-500">
                          {t("timerReady")}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[44px] leading-none font-black tracking-wider text-foreground tabular-nums sm:text-[52px] dark:text-white">
                          {formatTime(activeTimer.remainingSeconds)}
                        </span>
                        {activeTimer.isPaused && (
                          <span className="mt-1 text-sm font-semibold text-[#D39E00] dark:text-[#FFC107]">
                            {t("timerPaused")}
                          </span>
                        )}
                        <span className="mt-1 text-[13px] text-muted tabular-nums dark:text-dark-muted">
                          {t("timerTotal")}: {formatTime(activeTimer.totalSeconds)}
                        </span>
                      </>
                    )}
                  </CircularProgress>
                </motion.div>

                {/* +/- temps */}
                {!isDone && (
                  <div className="mt-5 mb-2 flex flex-wrap justify-center gap-2.5">
                    {[
                      { label: "-30s", seconds: -30 },
                      { label: "-1 min", seconds: -60 },
                      { label: "+1 min", seconds: 60 },
                      { label: "+5 min", seconds: 300 },
                    ].map((step) => (
                      <button
                        key={step.label}
                        type="button"
                        onClick={() => addKitchenTime(activeTimer.id, step.seconds)}
                        className={`cursor-pointer rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                          step.seconds > 0
                            ? "bg-primary/10 text-primary hover:bg-primary/15"
                            : "bg-surface text-muted hover:bg-foreground/5 dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-white/10"
                        }`}
                      >
                        {step.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Contrôles */}
                <div className="mt-6 flex items-center gap-4">
                  {isDone ? (
                    <>
                      <button
                        type="button"
                        onClick={() => resetKitchenTimer(activeTimer.id)}
                        aria-label={isFr ? "Relancer" : "Restart"}
                        title={isFr ? "Relancer" : "Restart"}
                        className="flex size-16 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-dark"
                      >
                        <RotateCcw className="size-7" />
                      </button>
                      <button
                        type="button"
                        onClick={() => stopLocalTimer(activeTimer.id)}
                        aria-label={t("timerClose")}
                        title={t("timerClose")}
                        className="flex size-16 cursor-pointer items-center justify-center rounded-full bg-[#FF4444] text-white transition-colors hover:bg-[#E53935]"
                      >
                        <X className="size-7" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => resetKitchenTimer(activeTimer.id)}
                        aria-label={isFr ? "Recommencer" : "Restart"}
                        title={isFr ? "Recommencer" : "Restart"}
                        className="flex size-[52px] cursor-pointer items-center justify-center rounded-full bg-surface text-muted transition-colors hover:bg-foreground/5 dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-white/10"
                      >
                        <RotateCcw className="size-[22px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePause(activeTimer)}
                        aria-label={activeTimer.isPaused ? t("timerResume") : t("timerPause")}
                        title={activeTimer.isPaused ? t("timerResume") : t("timerPause")}
                        className={`flex size-[72px] cursor-pointer items-center justify-center rounded-full text-white shadow-lg transition-colors ${
                          activeTimer.isPaused
                            ? "bg-primary shadow-primary/35 hover:bg-primary-dark"
                            : "bg-[#FFC107] shadow-[#FFC107]/35 hover:bg-[#F5B800]"
                        }`}
                      >
                        {activeTimer.isPaused ? (
                          <Play className="size-8 fill-current" />
                        ) : (
                          <Pause className="size-8 fill-current" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmStopId(activeTimer.id)}
                        aria-label={t("timerStop")}
                        title={t("timerStop")}
                        className="flex size-[52px] cursor-pointer items-center justify-center rounded-full bg-[#FF4444]/15 text-[#FF4444] transition-colors hover:bg-[#FF4444]/25"
                      >
                        <Square className="size-5 fill-current" />
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="mt-7 flex cursor-pointer items-center gap-2 rounded-2xl bg-surface px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 dark:bg-dark-surface"
                >
                  <CirclePlus className="size-5" />
                  {t("timerAddNew")}
                </button>
              </section>
            ) : (
              <section className="flex flex-col items-center pt-12 pb-4">
                <Timer className="size-16 text-muted dark:text-dark-muted" />
                <p className="mt-3 text-base text-muted dark:text-dark-muted">{t("timerNoActive")}</p>
                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="mt-5 cursor-pointer rounded-2xl bg-primary px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  {t("timerCreateNew")}
                </button>
              </section>
            )}
          </div>

          {/* Liste des minuteurs (en bas sur téléphone, à droite sur grand écran) */}
          {timerList && <div className="lg:hidden">{timerList}</div>}
        </div>

        {hasSide && (
          <aside className="hidden space-y-6 lg:sticky lg:top-6 lg:block">
            {recipeBanners}
            {timerList}
          </aside>
        )}
      </div>

      {/* Confirmation : arrêter le minuteur affiché */}
      <AlertDialog open={confirmStopId !== null} onOpenChange={(open) => !open && setConfirmStopId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("timerStopConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("timerStopConfirmMsg")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmStopId) stopLocalTimer(confirmStopId)
                setConfirmStopId(null)
              }}
            >
              {t("timerStop")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation : tout arrêter */}
      <AlertDialog open={confirmStopAll} onOpenChange={setConfirmStopAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("timerStopAllTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("timerStopAllMsg")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                stopAllKitchenTimers()
                setActiveTimerId(null)
                setShowPicker(true)
                setConfirmStopAll(false)
              }}
            >
              {t("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
