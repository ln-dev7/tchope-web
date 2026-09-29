/**
 * Helpers partagés par les minuteurs, le mode cuisine et la page minuteur
 * (mêmes fonctions que context/TimerContext.tsx, app/cooking-mode.tsx et
 * app/timer.tsx sur mobile).
 */

/** 65 → "01:05", 3725 → "1:02:05". */
export function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds))
  const h = Math.floor(safe / 3600)
  const m = Math.floor((safe % 3600) / 60)
  const s = safe % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

/** Durée lisible pour un bouton : "1h30", "2h", "15 min", "45s". */
export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0 && m > 0) return `${h}h${m.toString().padStart(2, "0")}`
  if (h > 0) return `${h}h`
  if (m > 0) return `${m} min`
  return `${s}s`
}

/**
 * Détecte une durée dans le texte d'une étape (même détection que le mobile) :
 * « 1 heure et 30 minutes », « 2h », « 15 min », « 30 secondes »…
 */
export function parseTimeFromStep(step: string): number | null {
  const lower = step.toLowerCase()
  const hourMatch = lower.match(
    /(\d+)\s*(?:h(?:eures?)?|hours?)(?:\s*(?:et\s*)?(\d+)\s*(?:min(?:utes?)?)?)?/
  )
  if (hourMatch) {
    let seconds = parseInt(hourMatch[1], 10) * 3600
    if (hourMatch[2]) seconds += parseInt(hourMatch[2], 10) * 60
    return seconds
  }
  const minMatch = lower.match(/(\d+)\s*(?:min(?:utes?)?)/)
  if (minMatch) return parseInt(minMatch[1], 10) * 60
  const secMatch = lower.match(/(\d+)\s*(?:sec(?:ondes?|onds?)?)/)
  if (secMatch) return parseInt(secMatch[1], 10)
  return null
}

export function truncateName(name: string, maxLength = 20): string {
  if (name.length <= maxLength) return name
  return name.slice(0, maxLength) + "..."
}

/** Même identifiant que le mobile : un minuteur par étape (ou « global ») et par recette. */
export function makeTimerId(recipeId: string, stepIndex?: number): string {
  return `${recipeId}-${stepIndex ?? "global"}`
}

/** Secondes restantes d'un minuteur en cours, calculées à partir de l'heure de fin. */
export function remainingFromEndTime(endTime: number, now: number): number {
  return Math.max(0, Math.round((endTime - now) / 1000))
}

/** Couleurs des cartes de minuteur (codées en dur sur mobile). */
export const TIMER_COLORS = {
  running: "#914700",
  paused: "#6B5B00",
  done: "#0A6A1D",
} as const

export function timerColor(state: { isRunning: boolean; isPaused: boolean; isDone: boolean }): string {
  if (state.isDone) return TIMER_COLORS.done
  if (state.isPaused) return TIMER_COLORS.paused
  return TIMER_COLORS.running
}

/** Lien vers le mode cuisine (avec l'étape du minuteur si elle est connue). */
export function cookingModeHref(locale: string, recipeId: string, stepIndex?: number): string {
  const stepParam = stepIndex != null ? `&step=${stepIndex}` : ""
  return `/${locale}/app/cooking-mode?id=${encodeURIComponent(recipeId)}${stepParam}`
}
