import { useCallback, useMemo } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { makeTimerId, remainingFromEndTime } from "@/lib/timer-utils"
import { useIsClient, useNow } from "@/lib/timer-clock"
import { primeTimerAudio, stopTimerAlarm } from "@/lib/timer-sound"
import { requestTimerNotificationPermission } from "@/lib/timer-notify"

/**
 * Minuteurs de l'app (équivalent de context/TimerContext.tsx sur mobile) :
 * - minuteurs de recette (mode cuisine), un par étape, id `${recipeId}-${stepIndex ?? 'global'}` ;
 * - minuteurs libres de la page Minuteur (état local de app/timer.tsx sur
 *   mobile, gardés ici pour survivre à un changement de page sur le web).
 *
 * Chaque minuteur en cours garde son heure de fin (`endTime`) : le temps
 * restant est recalculé à l'affichage, il reste donc juste quand l'onglet est
 * en arrière-plan ou après un rechargement (état persisté dans localStorage).
 */

// --- Types -----------------------------------------------------------------

export type TimerEntry = {
  id: string
  recipeId: string
  recipeName: string
  stepIndex?: number
  totalSeconds: number
  /** Secondes restantes (recalculées en direct par les hooks pour un minuteur en cours). */
  remainingSeconds: number
  isRunning: boolean
  isPaused: boolean
  endTime: number
  /** Heure à laquelle la fin a été constatée (alarme déjà déclenchée). */
  finishedAt?: number
}

export type KitchenTimer = {
  id: string
  label: string
  totalSeconds: number
  remainingSeconds: number
  isRunning: boolean
  isPaused: boolean
  endTime: number
  createdAt: number
  finishedAt?: number
}

/** Compatibilité avec le `timer` unique du mobile (minuteur affiché dans le widget). */
export type TimerState = {
  isRunning: boolean
  recipeId: string
  recipeName: string
  totalSeconds: number
  remainingSeconds: number
  stepIndex?: number
}

type TimerLike = Pick<TimerEntry, "totalSeconds" | "remainingSeconds" | "isRunning" | "isPaused">

/** Terminé = arrivé à zéro, ni en cours ni en pause (même règle que le mobile). */
export function isTimerDone(entry: TimerLike): boolean {
  return entry.totalSeconds > 0 && entry.remainingSeconds === 0 && !entry.isRunning && !entry.isPaused
}

type FinishedTimers = { recipe: TimerEntry[]; kitchen: KitchenTimer[] }

type TimersStore = {
  recipeTimers: TimerEntry[]
  kitchenTimers: KitchenTimer[]
  /** Préférences de la page Minuteur. */
  tickSound: boolean
  keepAwake: boolean
  /** La permission de notification a déjà été demandée une fois. */
  notificationAsked: boolean

  startTimer: (recipeId: string, recipeName: string, durationSeconds: number, stepIndex?: number) => void
  stopTimer: (timerId: string) => void
  pauseTimer: (timerId: string) => void
  resumeTimer: (timerId: string) => void
  stopAllTimers: () => void

  createKitchenTimer: (label: string, durationSeconds: number) => string
  pauseKitchenTimer: (id: string) => void
  resumeKitchenTimer: (id: string) => void
  stopKitchenTimer: (id: string) => void
  resetKitchenTimer: (id: string) => void
  addKitchenTime: (id: string, seconds: number) => void
  stopAllKitchenTimers: () => void

  setTickSound: (value: boolean) => void
  setKeepAwake: (value: boolean) => void

  /** Passe à « terminé » les minuteurs dont l'heure de fin est dépassée et les renvoie. */
  settleExpired: (now: number) => FinishedTimers
}

// --- Store -----------------------------------------------------------------

export const useTimerStore = create<TimersStore>()(
  persist(
    (set, get) => {
      /** Pendant un clic : débloque le son et demande la permission de notifier (une fois). */
      const onUserStart = () => {
        primeTimerAudio()
        if (!get().notificationAsked) {
          requestTimerNotificationPermission()
          set({ notificationAsked: true })
        }
      }

      return {
        recipeTimers: [],
        kitchenTimers: [],
        tickSound: true,
        keepAwake: true,
        notificationAsked: false,

        // --- Minuteurs de recette ---

        startTimer: (recipeId, recipeName, durationSeconds, stepIndex) => {
          if (durationSeconds <= 0) return
          const id = makeTimerId(recipeId, stepIndex)
          const entry: TimerEntry = {
            id,
            recipeId,
            recipeName,
            stepIndex,
            totalSeconds: durationSeconds,
            remainingSeconds: durationSeconds,
            isRunning: true,
            isPaused: false,
            endTime: Date.now() + durationSeconds * 1000,
          }
          // Un minuteur existant avec le même id est remplacé (comme sur mobile).
          set((state) => {
            const exists = state.recipeTimers.some((t) => t.id === id)
            return {
              recipeTimers: exists
                ? state.recipeTimers.map((t) => (t.id === id ? entry : t))
                : [...state.recipeTimers, entry],
            }
          })
          onUserStart()
        },

        stopTimer: (timerId) => {
          set((state) => ({ recipeTimers: state.recipeTimers.filter((t) => t.id !== timerId) }))
          stopTimerAlarm()
        },

        pauseTimer: (timerId) =>
          set((state) => ({
            recipeTimers: state.recipeTimers.map((t) =>
              t.id === timerId && t.isRunning
                ? {
                    ...t,
                    isRunning: false,
                    isPaused: true,
                    remainingSeconds: remainingFromEndTime(t.endTime, Date.now()),
                  }
                : t
            ),
          })),

        resumeTimer: (timerId) => {
          set((state) => ({
            recipeTimers: state.recipeTimers.map((t) =>
              t.id === timerId && t.isPaused
                ? { ...t, isRunning: true, isPaused: false, endTime: Date.now() + t.remainingSeconds * 1000 }
                : t
            ),
          }))
          onUserStart()
        },

        stopAllTimers: () => {
          set({ recipeTimers: [] })
          stopTimerAlarm()
        },

        // --- Minuteurs libres (page Minuteur) ---

        createKitchenTimer: (label, durationSeconds) => {
          const now = Date.now()
          let id = now.toString()
          if (get().kitchenTimers.some((t) => t.id === id)) id = `${id}-${get().kitchenTimers.length}`
          const timer: KitchenTimer = {
            id,
            label,
            totalSeconds: durationSeconds,
            remainingSeconds: durationSeconds,
            isRunning: true,
            isPaused: false,
            endTime: now + durationSeconds * 1000,
            createdAt: now,
          }
          set((state) => ({ kitchenTimers: [...state.kitchenTimers, timer] }))
          onUserStart()
          return id
        },

        pauseKitchenTimer: (id) =>
          set((state) => ({
            kitchenTimers: state.kitchenTimers.map((t) =>
              t.id === id && t.isRunning
                ? {
                    ...t,
                    isRunning: false,
                    isPaused: true,
                    remainingSeconds: remainingFromEndTime(t.endTime, Date.now()),
                  }
                : t
            ),
          })),

        resumeKitchenTimer: (id) => {
          set((state) => ({
            kitchenTimers: state.kitchenTimers.map((t) =>
              t.id === id && t.isPaused
                ? { ...t, isRunning: true, isPaused: false, endTime: Date.now() + t.remainingSeconds * 1000 }
                : t
            ),
          }))
          onUserStart()
        },

        stopKitchenTimer: (id) => {
          set((state) => ({ kitchenTimers: state.kitchenTimers.filter((t) => t.id !== id) }))
          stopTimerAlarm()
        },

        resetKitchenTimer: (id) => {
          set((state) => ({
            kitchenTimers: state.kitchenTimers.map((t) =>
              t.id === id
                ? {
                    ...t,
                    isRunning: true,
                    isPaused: false,
                    remainingSeconds: t.totalSeconds,
                    endTime: Date.now() + t.totalSeconds * 1000,
                    finishedAt: undefined,
                  }
                : t
            ),
          }))
          stopTimerAlarm()
          onUserStart()
        },

        addKitchenTime: (id, seconds) =>
          set((state) => ({
            kitchenTimers: state.kitchenTimers.map((t) => {
              if (t.id !== id) return t
              const now = Date.now()
              const current = t.isRunning ? remainingFromEndTime(t.endTime, now) : t.remainingSeconds
              const newRemaining = Math.max(0, current + seconds)
              const newTotal = t.totalSeconds + seconds
              return {
                ...t,
                remainingSeconds: newRemaining,
                totalSeconds: newTotal > 0 ? newTotal : t.totalSeconds,
                endTime: t.isRunning ? now + newRemaining * 1000 : t.endTime,
              }
            }),
          })),

        stopAllKitchenTimers: () => {
          set({ kitchenTimers: [] })
          stopTimerAlarm()
        },

        setTickSound: (value) => set({ tickSound: value }),
        setKeepAwake: (value) => set({ keepAwake: value }),

        // --- Fin des minuteurs ---

        settleExpired: (now) => {
          const { recipeTimers, kitchenTimers } = get()
          const finishedRecipe: TimerEntry[] = []
          const finishedKitchen: KitchenTimer[] = []

          const nextRecipe = recipeTimers.map((t) => {
            if (!t.isRunning || t.endTime > now) return t
            const done: TimerEntry = { ...t, isRunning: false, isPaused: false, remainingSeconds: 0, finishedAt: now }
            finishedRecipe.push(done)
            return done
          })
          const nextKitchen = kitchenTimers.map((t) => {
            if (!t.isRunning || t.endTime > now) return t
            const done: KitchenTimer = { ...t, isRunning: false, isPaused: false, remainingSeconds: 0, finishedAt: now }
            finishedKitchen.push(done)
            return done
          })

          if (finishedRecipe.length > 0 || finishedKitchen.length > 0) {
            set({ recipeTimers: nextRecipe, kitchenTimers: nextKitchen })
          }
          return { recipe: finishedRecipe, kitchen: finishedKitchen }
        },
      }
    },
    {
      name: "tchope_timers",
      version: 1,
      partialize: (state) => ({
        recipeTimers: state.recipeTimers,
        kitchenTimers: state.kitchenTimers,
        tickSound: state.tickSound,
        keepAwake: state.keepAwake,
        notificationAsked: state.notificationAsked,
      }),
    }
  )
)

// --- Hooks -----------------------------------------------------------------

const EMPTY_RECIPE: TimerEntry[] = []
const EMPTY_KITCHEN: KitchenTimer[] = []

/** Valeur « en direct » d'un minuteur à l'instant `now`. */
function live<T extends TimerLike & { endTime: number }>(entry: T, now: number): T {
  if (!entry.isRunning) return entry
  const remaining = Math.min(entry.totalSeconds, remainingFromEndTime(entry.endTime, now))
  if (remaining <= 0) return { ...entry, remainingSeconds: 0, isRunning: false, isPaused: false }
  if (remaining === entry.remainingSeconds) return entry
  return { ...entry, remainingSeconds: remaining }
}

/** Minuteur mis en avant : celui qui finit le plus tôt. Priorité : en cours > en pause > terminé. */
export function pickNearestTimer<T extends TimerLike>(all: T[]): T | null {
  const running = all.filter((t) => t.isRunning).sort((a, b) => a.remainingSeconds - b.remainingSeconds)
  if (running.length > 0) return running[0]
  const paused = all.filter((t) => t.isPaused).sort((a, b) => a.remainingSeconds - b.remainingSeconds)
  if (paused.length > 0) return paused[0]
  const done = all.filter((t) => isTimerDone(t))
  if (done.length > 0) return done[0]
  return null
}

/** Minuteurs de recette avec leur temps restant en direct (vide pendant le rendu serveur). */
export function useLiveRecipeTimers(): TimerEntry[] {
  const isClient = useIsClient()
  const stored = useTimerStore((s) => s.recipeTimers)
  const source = isClient ? stored : EMPTY_RECIPE
  const now = useNow(source.some((t) => t.isRunning))
  return useMemo(() => source.map((t) => live(t, now)), [source, now])
}

/** Minuteurs libres de la page Minuteur, avec leur temps restant en direct. */
export function useLiveKitchenTimers(): KitchenTimer[] {
  const isClient = useIsClient()
  const stored = useTimerStore((s) => s.kitchenTimers)
  const source = isClient ? stored : EMPTY_KITCHEN
  const now = useNow(source.some((t) => t.isRunning))
  return useMemo(() => source.map((t) => live(t, now)), [source, now])
}

const emptyTimer: TimerState = { isRunning: false, recipeId: "", recipeName: "", totalSeconds: 0, remainingSeconds: 0 }

/**
 * Même API que `useTimer()` du mobile (context/TimerContext.tsx) :
 * timers, startTimer, stopTimer, pauseTimer, resumeTimer, stopAllTimers,
 * getTimersForRecipe, isTimerRunning, timer, isPaused.
 */
export function useTimers() {
  const list = useLiveRecipeTimers()
  const startTimer = useTimerStore((s) => s.startTimer)
  const stopTimer = useTimerStore((s) => s.stopTimer)
  const pauseTimer = useTimerStore((s) => s.pauseTimer)
  const resumeTimer = useTimerStore((s) => s.resumeTimer)
  const stopAllTimers = useTimerStore((s) => s.stopAllTimers)

  const timers = useMemo(() => new Map(list.map((t) => [t.id, t])), [list])

  const getTimersForRecipe = useCallback(
    (recipeId: string): TimerEntry[] => list.filter((t) => t.recipeId === recipeId),
    [list]
  )

  const widgetTimer = pickNearestTimer(list)
  const timer: TimerState = widgetTimer
    ? {
        isRunning: widgetTimer.isRunning,
        recipeId: widgetTimer.recipeId,
        recipeName: widgetTimer.recipeName,
        totalSeconds: widgetTimer.totalSeconds,
        remainingSeconds: widgetTimer.remainingSeconds,
        stepIndex: widgetTimer.stepIndex,
      }
    : emptyTimer

  return {
    timers,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    stopAllTimers,
    getTimersForRecipe,
    /** Vrai dès qu'un minuteur de recette existe (en cours, en pause ou terminé), comme sur mobile. */
    isTimerRunning: list.length > 0,
    timer,
    isPaused: widgetTimer?.isPaused ?? false,
  }
}
