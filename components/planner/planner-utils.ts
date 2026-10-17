/**
 * Dates du planificateur (reprises de tchope/app/(tabs)/planner.tsx). La génération et
 * l'ajustement par l'IA sont dans l'app (components/app-only.tsx).
 */

export type Lang = "fr" | "en"

const FULL_DAY_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const FULL_DAY_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const SHORT_DAY_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
const SHORT_DAY_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function formatDate(dateStr: string, lang: Lang): string {
  const d = new Date(dateStr + "T12:00:00")
  const names = lang === "fr" ? FULL_DAY_FR : FULL_DAY_EN
  const month = d.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { month: "short" })
  return `${names[d.getDay()]} ${d.getDate()} ${month}`
}

export function shortDay(dateStr: string, lang: Lang): string {
  const d = new Date(dateStr + "T12:00:00")
  return (lang === "fr" ? SHORT_DAY_FR : SHORT_DAY_EN)[d.getDay()]
}
