"use client"

import { Suspense, useEffect, useEffectEvent, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Mic,
  Minus,
  PartyPopper,
  Pencil,
  Plus,
  RotateCcw,
  Timer,
  Volume2,
  VolumeX,
} from "lucide-react"
import { toast } from "sonner"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useLocalizedRecipes } from "@/hooks/use-localized-recipes"
import { useUserRecipes } from "@/stores/user-recipes"
import { useTimers, type TimerEntry } from "@/stores/timers"
import { useIsClient } from "@/lib/timer-clock"
import { formatDuration, parseTimeFromStep } from "@/lib/timer-utils"
import { useWakeLock } from "@/lib/timer-wake-lock"
import { speechSupported, stopSpeaking, useCookingVoice, useSpeakOnChange } from "@/lib/cooking-voice"
import { RecipeImage } from "@/components/recipe-image"
import { RecipeTimerCard, RecipeTimerPill } from "@/components/timer/recipe-timer-card"
import type { Recipe, UserRecipe } from "@/types/recipe"

const SWIPE_MIN_DISTANCE = 60

function parseStepParam(stepParam: string | null, totalSteps: number): number {
  if (!stepParam || totalSteps <= 0) return 0
  const parsed = parseInt(stepParam, 10)
  if (Number.isNaN(parsed)) return 0
  return Math.min(Math.max(parsed, 0), totalSteps - 1)
}

export default function CookingModePage() {
  return (
    <Suspense fallback={<CookingBackdrop />}>
      <CookingModeLoader />
    </Suspense>
  )
}

/** Fond pendant le chargement (rendu serveur, hydratation). */
function CookingBackdrop() {
  return <div className="h-dvh bg-background dark:bg-dark" />
}

function CookingModeLoader() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id") ?? ""
  const stepParam = searchParams.get("step")
  const isClient = useIsClient()
  const { locale } = useLocale()
  const recipes = useLocalizedRecipes(locale)
  const userRecipes = useUserRecipes((s) => s.userRecipes)

  const recipe = useMemo<Recipe | UserRecipe | undefined>(
    () => recipes.find((r) => r.id === id) ?? userRecipes.find((r) => r.id === id),
    [recipes, userRecipes, id]
  )

  // Les recettes créées sont dans localStorage : on attend le client.
  if (!isClient) return <CookingBackdrop />
  if (!recipe || recipe.steps.length === 0) return <RecipeNotFound />
  return <CookingMode key={recipe.id} recipe={recipe} stepParam={stepParam} />
}

function RecipeNotFound() {
  const router = useRouter()
  const { locale } = useLocale()
  const isFr = locale === "fr"
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center dark:bg-dark">
      <p className="text-foreground dark:text-white">{isFr ? "Recette introuvable" : "Recipe not found"}</p>
      <button
        type="button"
        onClick={() => router.push(`/${locale}/app`)}
        className="cursor-pointer rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white"
      >
        {isFr ? "Retour à l'accueil" : "Back to home"}
      </button>
    </div>
  )
}

function CookingMode({ recipe, stepParam }: { recipe: Recipe | UserRecipe; stepParam: string | null }) {
  const router = useRouter()
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const isFr = locale === "fr"
  const reduceMotion = useReducedMotion()
  const { startTimer, pauseTimer, resumeTimer, stopTimer, stopAllTimers, getTimersForRecipe } = useTimers()
  const voiceEnabled = useCookingVoice((s) => s.enabled)
  const setVoiceEnabled = useCookingVoice((s) => s.setEnabled)
  const [canSpeak] = useState(speechSupported)

  const steps = recipe.steps
  const totalSteps = steps.length

  const [currentStep, setCurrentStep] = useState(() => parseStepParam(stepParam, totalSteps))
  const [direction, setDirection] = useState(0)
  const [finished, setFinished] = useState(false)
  const [customMinutes, setCustomMinutes] = useState(5)
  const [showCustomTimer, setShowCustomTimer] = useState<number | null>(null)

  // Nouveau lien ?step=… vers la même recette (widget, toast) : on saute à l'étape.
  const [appliedStepParam, setAppliedStepParam] = useState(stepParam)
  if (stepParam !== appliedStepParam) {
    setAppliedStepParam(stepParam)
    if (stepParam != null) {
      setCurrentStep(parseStepParam(stepParam, totalSteps))
      setFinished(false)
    }
  }

  const stepTimes = useMemo(() => steps.map(parseTimeFromStep), [steps])
  const recipeTimers = getTimersForRecipe(recipe.id)
  const hasTimers = recipeTimers.length > 0
  const stepHasTimer = (index: number) => recipeTimers.some((entry) => entry.stepIndex === index)

  // Écran allumé pendant la cuisine.
  useWakeLock(!finished)

  // Lecture vocale de l'étape (ou du message de fin).
  useSpeakOnChange(
    finished ? `${t("cookingComplete")} ${t("cookingCompleteMessage")}` : steps[currentStep],
    voiceEnabled && canSpeak,
    locale
  )

  // --- Navigation ---------------------------------------------------------------

  const goToStep = (index: number) => {
    if (index < 0 || index >= totalSteps || index === currentStep) return
    setDirection(index > currentStep ? 1 : -1)
    setCurrentStep(index)
  }
  const handlePrev = () => goToStep(currentStep - 1)
  const handleNext = () => goToStep(currentStep + 1)

  const goBack = () => {
    stopSpeaking()
    if (window.history.length > 1) router.back()
    else router.push(`/${locale}/app/recipe/${recipe.id}`)
  }

  const handleFinish = () => {
    stopSpeaking()
    stopAllTimers()
    setFinished(true)
  }

  const handleRestart = () => {
    setDirection(-1)
    setCurrentStep(0)
    setFinished(false)
  }

  const toggleVoice = () => {
    const next = !voiceEnabled
    setVoiceEnabled(next)
    if (!next) stopSpeaking()
    toast.success(next ? t("voiceReadingOn") : t("voiceReadingOff"))
  }

  // Clavier : ← → pour les étapes, Échap pour quitter.
  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
    const target = e.target as HTMLElement | null
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return
    if (e.key === "Escape") {
      e.preventDefault()
      goBack()
      return
    }
    if (finished) return
    if (e.key === "ArrowRight") {
      e.preventDefault()
      handleNext()
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      handlePrev()
    }
  })

  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKeyDown(e)
    window.addEventListener("keydown", listener)
    return () => window.removeEventListener("keydown", listener)
  }, [])

  // Balayage horizontal sur écran tactile (comme la liste paginée du mobile).
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) < SWIPE_MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return
    if (dx < 0) handleNext()
    else handlePrev()
  }

  // --- Minuteurs ------------------------------------------------------------------

  const timerLabel = (index: number) => `${recipe.name} — ${t("steps")} ${index + 1}`

  const startStepTimer = (index: number, seconds: number) => {
    startTimer(recipe.id, timerLabel(index), seconds, index)
    setShowCustomTimer(null)
  }

  const handlePauseResume = (entry: TimerEntry) => {
    if (entry.isPaused) resumeTimer(entry.id)
    else pauseTimer(entry.id)
  }

  const timerActions = {
    currentStep,
    onGoToStep: goToStep,
    onPauseResume: handlePauseResume,
    onStop: (entry: TimerEntry) => stopTimer(entry.id),
    t,
  }

  // --- Écran de fin ---------------------------------------------------------------

  if (finished) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center overflow-y-auto bg-background px-6 py-10 text-center dark:bg-dark">
        <motion.div
          initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="relative"
        >
          <div className="relative size-32 overflow-hidden rounded-[28px] shadow-lg shadow-black/10 sm:size-36">
            <RecipeImage
              recipeId={recipe.id}
              category={recipe.category}
              alt={recipe.name}
              fill
              imageUri={"imageUri" in recipe ? recipe.imageUri : undefined}
            />
          </div>
          <div className="absolute -right-3 -bottom-3 flex size-12 items-center justify-center rounded-full bg-secondary text-white ring-4 ring-background dark:ring-dark">
            <PartyPopper className="size-6" />
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="flex flex-col items-center"
        >
          <h1 className="mt-9 text-2xl font-extrabold text-foreground sm:text-3xl dark:text-white">
            {t("cookingComplete")}
          </h1>
          <p className="mt-2 max-w-sm text-muted dark:text-dark-muted">{t("cookingCompleteMessage")}</p>
          <p className="mt-1 text-sm font-semibold text-primary">{recipe.name}</p>

          <div className="mt-9 flex w-full max-w-sm flex-col-reverse gap-3 sm:w-[24rem] sm:flex-row">
            <button
              type="button"
              onClick={handleRestart}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[20px] bg-surface py-4 text-[15px] font-semibold text-foreground transition-colors hover:bg-foreground/5 dark:bg-dark-surface dark:text-white dark:hover:bg-white/10"
            >
              <RotateCcw className="size-[18px]" />
              {isFr ? "Recommencer" : "Start over"}
            </button>
            <button
              type="button"
              onClick={goBack}
              autoFocus
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[20px] bg-primary py-4 text-[15px] font-bold text-white transition-colors hover:bg-primary-dark"
            >
              <Check className="size-[18px]" />
              {t("timerClose")}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // --- Étapes ---------------------------------------------------------------------

  const progress = totalSteps > 0 ? (currentStep + 1) / totalSteps : 0
  const isLastStep = currentStep === totalSteps - 1
  const step = steps[currentStep]
  const detected = stepTimes[currentStep]

  const variants = {
    enter: (dir: number) => ({ x: reduceMotion ? 0 : dir * 48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: reduceMotion ? 0 : dir * -48, opacity: 0 }),
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background dark:bg-dark">
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
        {/* En-tête */}
        <header className="flex items-center gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 sm:gap-4 sm:px-6 md:pt-5">
          <button
            type="button"
            onClick={goBack}
            aria-label={isFr ? "Quitter le mode cuisine" : "Exit cooking mode"}
            title={isFr ? "Quitter (Échap)" : "Exit (Esc)"}
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-foreground/5 dark:bg-dark-surface dark:text-white dark:hover:bg-white/10"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold text-foreground dark:text-white">{recipe.name}</h1>
            <p className="text-[13px] text-muted dark:text-dark-muted">
              {t("steps")} {currentStep + 1} {t("stepOf")} {totalSteps}
            </p>
          </div>
          <Link
            href={`/${locale}/app/live-cooking?id=${encodeURIComponent(recipe.id)}&step=${currentStep}`}
            onClick={() => stopSpeaking()}
            className="flex h-9 shrink-0 items-center justify-center gap-1 rounded-full bg-[#A855F7]/12 px-3 text-xs font-bold text-[#A855F7] transition-colors hover:bg-[#A855F7]/20"
          >
            <Mic className="size-4" />
            Live
          </Link>
          {canSpeak && (
            <button
              type="button"
              onClick={toggleVoice}
              aria-pressed={voiceEnabled}
              aria-label={voiceEnabled ? t("voiceReadingOn") : t("voiceReadingOff")}
              title={voiceEnabled ? t("voiceReadingOn") : t("voiceReadingOff")}
              className={`flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors ${
                voiceEnabled
                  ? "bg-primary/10 text-primary hover:bg-primary/15 dark:bg-primary/20"
                  : "bg-surface text-muted hover:bg-foreground/5 dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-white/10"
              }`}
            >
              {voiceEnabled ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
            </button>
          )}
        </header>

        {/* Progression */}
        <div
          className="mx-4 h-1 overflow-hidden rounded-full bg-foreground/10 sm:mx-6 dark:bg-white/10"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuenow={currentStep + 1}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Points des étapes */}
        <div className="flex flex-wrap justify-center gap-x-1.5 px-4 py-2.5">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToStep(i)}
              aria-label={`${t("steps")} ${i + 1}`}
              aria-current={i === currentStep ? "step" : undefined}
              className="cursor-pointer py-1.5"
            >
              <span
                className={`block h-2 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? "w-6 bg-primary"
                    : i < currentStep
                      ? "w-2 bg-primary/40"
                      : "w-2 bg-foreground/15 dark:bg-white/15"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Minuteurs de la recette */}
        {hasTimers &&
          (recipeTimers.length === 1 ? (
            <div className="mx-4 mb-2 sm:mx-6">
              <RecipeTimerCard entry={recipeTimers[0]} {...timerActions} />
            </div>
          ) : (
            <div className="mb-2 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
              {recipeTimers.map((entry) => (
                <RecipeTimerPill key={entry.id} entry={entry} {...timerActions} />
              ))}
            </div>
          ))}

        {/* Étape courante */}
        <div className="relative min-h-0 flex-1 overflow-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <AnimatePresence initial={false} custom={direction}>
            <motion.section
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              aria-live="polite"
              className="absolute inset-0 overflow-y-auto overscroll-contain px-8 sm:px-12"
            >
              <div
                className={`flex min-h-full flex-col items-center pb-4 ${
                  hasTimers ? "justify-start pt-9" : "justify-center"
                }`}
              >
                <div className="mb-6 flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-[28px] font-extrabold text-white shadow-lg shadow-primary/25">
                  {currentStep + 1}
                </div>
                <p className="max-w-2xl text-center text-xl leading-8 font-medium text-foreground md:text-2xl md:leading-10 dark:text-white">
                  {step}
                </p>

                {/* Minuteur de l'étape (masqué si cette étape a déjà le sien) */}
                {!stepHasTimer(currentStep) &&
                  (showCustomTimer === currentStep ? (
                    <div className="mt-6 flex flex-col items-center gap-3">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setCustomMinutes((m) => Math.max(1, m - 1))}
                          aria-label="-1 min"
                          className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-foreground/5 dark:bg-dark-surface dark:text-white dark:hover:bg-white/10"
                        >
                          <Minus className="size-5" />
                        </button>
                        <span className="min-w-[70px] text-center text-2xl font-extrabold text-foreground tabular-nums dark:text-white">
                          {customMinutes} min
                        </span>
                        <button
                          type="button"
                          onClick={() => setCustomMinutes((m) => Math.min(180, m + 1))}
                          aria-label="+1 min"
                          className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-foreground/5 dark:bg-dark-surface dark:text-white dark:hover:bg-white/10"
                        >
                          <Plus className="size-5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => startStepTimer(currentStep, customMinutes * 60)}
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
                      >
                        <Timer className="size-[18px]" />
                        {t("startStepTimer")}
                      </button>
                    </div>
                  ) : detected != null ? (
                    <div className="mt-6 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => startStepTimer(currentStep, detected)}
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary/10 px-6 py-3.5 text-[15px] font-bold text-primary transition-colors hover:bg-primary/15 dark:bg-primary/20 dark:hover:bg-primary/25"
                      >
                        <Timer className="size-5" />
                        {t("startStepTimer")} ({formatDuration(detected)})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomTimer(currentStep)
                          setCustomMinutes(Math.max(1, Math.ceil(detected / 60)))
                        }}
                        aria-label={isFr ? "Modifier la durée" : "Edit duration"}
                        title={isFr ? "Modifier la durée" : "Edit duration"}
                        className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-surface text-muted transition-colors hover:bg-foreground/5 dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-white/10"
                      >
                        <Pencil className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomTimer(currentStep)
                        setCustomMinutes(5)
                      }}
                      className="mt-6 flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl bg-surface px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-foreground/5 dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-white/10"
                    >
                      <Timer className="size-[18px]" />
                      {t("addTimer")}
                    </button>
                  ))}
              </div>
            </motion.section>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 md:pb-5">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[20px] bg-surface py-4 text-[15px] font-semibold text-foreground transition-colors hover:bg-foreground/5 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-surface dark:bg-dark-surface dark:text-white dark:hover:bg-white/10 dark:disabled:hover:bg-dark-surface"
            >
              <ArrowLeft className="size-[18px]" />
              {t("previousStep")}
            </button>
            <button
              type="button"
              onClick={isLastStep ? handleFinish : handleNext}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[20px] py-4 text-[15px] font-bold text-white transition-colors ${
                isLastStep ? "bg-secondary hover:bg-secondary/90" : "bg-primary hover:bg-primary-dark"
              }`}
            >
              {isLastStep ? t("finishCooking") : t("nextStep")}
              {isLastStep ? <CircleCheck className="size-[18px]" /> : <ArrowRight className="size-[18px]" />}
            </button>
          </div>
          <p className="mt-3 hidden items-center justify-center gap-1.5 text-xs text-muted md:flex dark:text-dark-muted">
            <Kbd>←</Kbd>
            <Kbd>→</Kbd>
            <span>{isFr ? "étapes" : "steps"}</span>
            <span aria-hidden>·</span>
            <Kbd>{isFr ? "Échap" : "Esc"}</Kbd>
            <span>{isFr ? "quitter" : "exit"}</span>
          </p>
        </nav>
      </div>
    </div>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-6 items-center justify-center rounded-md border border-foreground/10 bg-surface px-1.5 py-0.5 font-sans text-[11px] font-semibold text-foreground dark:border-white/10 dark:bg-dark-surface dark:text-white">
      {children}
    </kbd>
  )
}
