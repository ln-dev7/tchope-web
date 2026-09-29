"use client"

import { useEffect, useEffectEvent, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useIsClient, useNow } from "@/lib/timer-clock"
import { cookingModeHref, formatTime } from "@/lib/timer-utils"
import { playTimerAlarm, stopTimerAlarm } from "@/lib/timer-sound"
import { showTimerNotification } from "@/lib/timer-notify"
import {
  isTimerDone,
  pickNearestTimer,
  useLiveKitchenTimers,
  useLiveRecipeTimers,
  useTimerStore,
  type KitchenTimer,
  type TimerEntry,
} from "@/stores/timers"
import { TimerWidget, type WidgetTimer } from "@/components/timer/timer-widget"

/** Au-delà, la fin a eu lieu pendant que le site était fermé : pas d'alarme ni de notification. */
const STALE_FINISH_MS = 60_000

/** Préfixe ajouté au titre de l'onglet (retiré avec cette expression). */
const TITLE_PREFIX_RE = /^(?:⏱|⏸|✅) [^·]* · /

type HostTimer = WidgetTimer & {
  kind: "recipe" | "kitchen"
  id: string
}

/**
 * Hôte global des minuteurs (rendu une fois dans components/app-shell.tsx) :
 * - constate la fin des minuteurs (même onglet en arrière-plan, grâce à l'heure de fin) ;
 * - alarme sonore, notification du navigateur (si acceptée) et toast ;
 * - widget flottant avec le minuteur qui finit le plus tôt ;
 * - temps restant dans le titre de l'onglet.
 */
export function TimerHost() {
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const router = useRouter()
  const pathname = usePathname()
  const isClient = useIsClient()

  const recipeTimers = useLiveRecipeTimers()
  const kitchenTimers = useLiveKitchenTimers()
  const settleExpired = useTimerStore((s) => s.settleExpired)
  const stopTimer = useTimerStore((s) => s.stopTimer)
  const pauseTimer = useTimerStore((s) => s.pauseTimer)
  const resumeTimer = useTimerStore((s) => s.resumeTimer)
  const stopKitchenTimer = useTimerStore((s) => s.stopKitchenTimer)
  const pauseKitchenTimer = useTimerStore((s) => s.pauseKitchenTimer)
  const resumeKitchenTimer = useTimerStore((s) => s.resumeKitchenTimer)

  // Heures de fin telles qu'enregistrées (pour programmer la fin exacte).
  const storedRecipe = useTimerStore((s) => s.recipeTimers)
  const storedKitchen = useTimerStore((s) => s.kitchenTimers)

  const anyRunning = recipeTimers.some((e) => e.isRunning) || kitchenTimers.some((e) => e.isRunning)
  // Garde l'horloge partagée active : toutes les pages lisent une heure fraîche.
  const now = useNow(anyRunning)

  const isOnCookingMode = /\/app\/cooking-mode(\/|$)/.test(pathname)
  const isOnLiveCooking = /\/app\/live-cooking(\/|$)/.test(pathname)
  const isOnTimerPage = /\/app\/timer(\/|$)/.test(pathname)
  const isOnTchopAi = /\/app\/tchop-ai(\/|$)/.test(pathname)

  // --- Fin des minuteurs -----------------------------------------------------

  const announce = useEffectEvent((finished: { recipe: TimerEntry[]; kitchen: KitchenTimer[] }) => {
    const nowMs = Date.now()
    const all = [
      ...finished.recipe.map((e) => ({
        id: e.id,
        name: e.recipeName,
        endTime: e.endTime,
        href: cookingModeHref(locale, e.recipeId, e.stepIndex),
        kind: "recipe" as const,
        recipeId: e.recipeId,
      })),
      ...finished.kitchen.map((e) => ({
        id: e.id,
        name: e.label,
        endTime: e.endTime,
        href: `/${locale}/app/timer`,
        kind: "kitchen" as const,
        recipeId: undefined,
      })),
    ]
    if (all.length === 0) return

    const fresh = all.filter((e) => nowMs - e.endTime < STALE_FINISH_MS)
    if (fresh.length > 0) playTimerAlarm()

    const pageVisible = document.visibilityState === "visible" && document.hasFocus()

    for (const entry of all) {
      const message = `${entry.name} ${t("timerDone")}`

      if (!pageVisible && fresh.includes(entry)) {
        showTimerNotification({
          title: "Tchopé 🍳",
          body: message,
          tag: `tchope-timer-${entry.id}`,
          url: entry.href,
          onOpen: () => {
            stopTimerAlarm()
            router.push(entry.href)
          },
        })
      }

      // Déjà sous les yeux : pas de toast pour un minuteur libre sur la page Minuteur,
      // ni pour un minuteur de la recette ouverte en mode cuisine.
      const alreadyVisible =
        (entry.kind === "kitchen" && isOnTimerPage) ||
        (entry.kind === "recipe" &&
          isOnCookingMode &&
          new URLSearchParams(window.location.search).get("id") === entry.recipeId)
      if (alreadyVisible) continue

      toast.success("Tchopé", {
        id: `timer-done-${entry.id}`,
        description: message,
        duration: 15_000,
        closeButton: true,
        action: {
          label: entry.kind === "recipe" ? t("timerGoToRecipe") : t("timerPageTitle"),
          onClick: () => {
            stopTimerAlarm()
            router.push(entry.href)
          },
        },
      })
    }
  })

  const settle = useEffectEvent(() => {
    const finished = settleExpired(Date.now())
    if (finished.recipe.length > 0 || finished.kitchen.length > 0) announce(finished)
  })

  // À chaque battement de l'horloge (et au montage : minuteurs finis pendant l'absence).
  useEffect(() => {
    if (!isClient) return
    settle()
  }, [isClient, now])

  // Fin exacte du prochain minuteur, même si l'intervalle est ralenti en arrière-plan.
  const nextEnd = useMemo(() => {
    if (!isClient) return null
    const ends = [...storedRecipe, ...storedKitchen].filter((e) => e.isRunning).map((e) => e.endTime)
    return ends.length > 0 ? Math.min(...ends) : null
  }, [isClient, storedRecipe, storedKitchen])

  useEffect(() => {
    if (nextEnd === null) return
    const id = setTimeout(() => settle(), Math.max(0, nextEnd - Date.now()) + 20)
    return () => clearTimeout(id)
  }, [nextEnd])

  // Plusieurs onglets ouverts : on relit l'état quand un autre onglet le modifie.
  useEffect(() => {
    // Retour dans l'app après une visite du site : le store a pu manquer des
    // changements faits dans un autre onglet pendant que l'hôte était démonté.
    void useTimerStore.persist.rehydrate()
    const onStorage = (e: StorageEvent) => {
      if (e.key === useTimerStore.persist.getOptions().name) {
        void useTimerStore.persist.rehydrate()
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  // --- Minuteur mis en avant ---------------------------------------------------

  const all: HostTimer[] = useMemo(
    () => [
      ...recipeTimers.map((e) => ({
        key: `recipe:${e.id}`,
        kind: "recipe" as const,
        id: e.id,
        name: e.recipeName,
        href: cookingModeHref(locale, e.recipeId, e.stepIndex),
        totalSeconds: e.totalSeconds,
        remainingSeconds: e.remainingSeconds,
        isRunning: e.isRunning,
        isPaused: e.isPaused,
        isDone: isTimerDone(e),
      })),
      ...kitchenTimers.map((e) => ({
        key: `kitchen:${e.id}`,
        kind: "kitchen" as const,
        id: e.id,
        name: e.label,
        href: `/${locale}/app/timer`,
        totalSeconds: e.totalSeconds,
        remainingSeconds: e.remainingSeconds,
        isRunning: e.isRunning,
        isPaused: e.isPaused,
        isDone: isTimerDone(e),
      })),
    ],
    [recipeTimers, kitchenTimers, locale]
  )
  const featured = pickNearestTimer(all)

  // Le widget se réaffiche en grand quand un nouveau minuteur démarre (comme sur mobile).
  const [minimized, setMinimized] = useState(false)
  const startSignature = all
    .filter((e) => e.isRunning)
    .map((e) => e.key)
    .join("|")
  const [prevSignature, setPrevSignature] = useState(startSignature)
  if (startSignature !== prevSignature) {
    setPrevSignature(startSignature)
    const before = new Set(prevSignature.split("|"))
    if (startSignature.split("|").some((k) => k && !before.has(k))) setMinimized(false)
  }

  // --- Titre de l'onglet -------------------------------------------------------

  const titlePrefix = featured
    ? featured.isDone
      ? `✅ ${t("timerReady")} · `
      : `${featured.isPaused ? "⏸" : "⏱"} ${formatTime(featured.remainingSeconds)} · `
    : ""

  useEffect(() => {
    const apply = () => {
      const base = document.title.replace(TITLE_PREFIX_RE, "")
      const next = titlePrefix + base
      if (document.title !== next) document.title = next
    }
    apply()
    // Next.js remplace le titre à chaque navigation : on remet le préfixe.
    const observer = new MutationObserver(apply)
    observer.observe(document.head, { subtree: true, childList: true, characterData: true })
    return () => {
      observer.disconnect()
      document.title = document.title.replace(TITLE_PREFIX_RE, "")
    }
  }, [titlePrefix])

  // --- Rendu ------------------------------------------------------------------

  const showWidget = !!featured && !isOnCookingMode && !isOnLiveCooking && !isOnTimerPage
  if (!showWidget || !featured) return null

  const handlePauseResume = () => {
    if (featured.kind === "recipe") {
      if (featured.isPaused) resumeTimer(featured.id)
      else pauseTimer(featured.id)
    } else if (featured.isPaused) resumeKitchenTimer(featured.id)
    else pauseKitchenTimer(featured.id)
  }

  const handleStop = () => {
    if (featured.kind === "recipe") stopTimer(featured.id)
    else stopKitchenTimer(featured.id)
  }

  return (
    <TimerWidget
      timer={featured}
      otherCount={all.length - 1}
      minimized={minimized}
      onToggleMinimized={() => setMinimized((m) => !m)}
      onPauseResume={handlePauseResume}
      onStop={handleStop}
      raised={isOnTchopAi}
      labels={{
        ready: t("timerReady"),
        paused: t("timerPaused"),
        pause: t("timerPause"),
        resume: t("timerResume"),
        stop: t("timerStop"),
        close: t("timerClose"),
        open: featured.kind === "recipe" ? t("timerGoToRecipe") : t("timerPageTitle"),
        expand: locale === "fr" ? "Agrandir le minuteur" : "Expand timer",
        collapse: locale === "fr" ? "Réduire le minuteur" : "Collapse timer",
      }}
    />
  )
}
