import type { MealPlan } from "@/stores/meal-planner"
import type { Recipe } from "@/types/recipe"

/**
 * Export PDF du plan de repas (comme tchope/utils/export-pdf.ts) : même HTML,
 * mais au lieu d'expo-print on ouvre la boîte d'impression du navigateur, où
 * l'on choisit « Enregistrer en PDF ».
 */

export type ExportOptions = {
  plan: MealPlan
  recipeMap: Record<string, Recipe>
  lang: "fr" | "en"
  title: string
  shoppingListTitle: string
}

const FULL_DAY_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const FULL_DAY_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function formatDate(dateStr: string, lang: "fr" | "en"): string {
  const d = new Date(dateStr + "T12:00:00")
  const names = lang === "fr" ? FULL_DAY_FR : FULL_DAY_EN
  const month = d.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { month: "long" })
  return `${names[d.getDay()]} ${d.getDate()} ${month}`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function buildShoppingList(plan: MealPlan, recipeMap: Record<string, Recipe>): Map<string, string> {
  const ingredients = new Map<string, string>()
  for (const day of Object.values(plan.days)) {
    for (const meal of day.meals) {
      const recipe = recipeMap[meal.recipeId]
      if (!recipe) continue
      for (const ing of recipe.ingredients) {
        const key = ing.name.toLowerCase()
        if (!ingredients.has(key)) {
          ingredients.set(key, ing.name)
        }
      }
    }
  }
  return ingredients
}

export function generateMealPlanHTML({ plan, recipeMap, lang, title, shoppingListTitle }: ExportOptions): string {
  const sortedDays = Object.keys(plan.days).sort()

  const daysHTML = sortedDays
    .map((date) => {
      const day = plan.days[date]
      if (!day) return ""
      const mealsHTML = day.meals
        .map((meal) => {
          const recipe = recipeMap[meal.recipeId]
          const name = recipe?.name ?? meal.recipeId
          const meta = recipe ? `${recipe.region} · ${recipe.duration} min` : ""
          return `
        <div class="meal">
          <span class="meal-label">${escapeHtml(meal.label)}</span>
          <span class="meal-name">${escapeHtml(name)}</span>
          <span class="meal-meta">${escapeHtml(meta)}</span>
        </div>`
        })
        .join("")

      return `
      <div class="day">
        <div class="day-header">${formatDate(date, lang)}</div>
        ${mealsHTML}
      </div>`
    })
    .join("")

  const shoppingMap = buildShoppingList(plan, recipeMap)
  const shoppingHTML = Array.from(shoppingMap.values())
    .sort((a, b) => a.localeCompare(b, lang))
    .map((name) => `<li>${escapeHtml(name)}</li>`)
    .join("")

  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)} · Tchopé</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, 'Helvetica Neue', sans-serif; color: #2F2F2E; padding: 40px; }
    h1 { font-size: 28px; font-weight: 800; margin-bottom: 4px; color: #914700; }
    .subtitle { font-size: 14px; color: #888; margin-bottom: 32px; }
    .day { margin-bottom: 24px; }
    .day-header { font-size: 16px; font-weight: 700; color: #914700; padding: 8px 0; border-bottom: 2px solid #F3E8DC; margin-bottom: 8px; }
    .meal { display: flex; align-items: baseline; gap: 12px; padding: 6px 0; }
    .meal-label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #914700; min-width: 70px; }
    .meal-name { font-size: 14px; font-weight: 600; color: #2F2F2E; }
    .meal-meta { font-size: 12px; color: #999; }
    h2 { font-size: 22px; font-weight: 700; color: #914700; margin-top: 40px; margin-bottom: 16px; page-break-before: always; }
    ul { list-style: none; columns: 2; column-gap: 32px; }
    li { font-size: 13px; padding: 4px 0; border-bottom: 1px solid #F3F0EF; }
    li::before { content: "☐ "; color: #914700; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #BBB; }
    /* Impression navigateur : pas d'en-têtes/pieds de page du navigateur, marges sur chaque page. */
    @page { size: A4; margin: 0; }
    @media print {
      body { -webkit-box-decoration-break: clone; box-decoration-break: clone; }
      .day { break-inside: avoid; }
      li { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="subtitle">${formatDate(plan.startDate, lang)} → ${formatDate(plan.endDate, lang)}</div>
  ${daysHTML}
  <h2>${escapeHtml(shoppingListTitle)}</h2>
  <ul>${shoppingHTML}</ul>
  <div class="footer">Tchopé 🇨🇲 — tchope.lndev.me</div>
</body>
</html>`
}

function isIOS(): boolean {
  const ua = navigator.userAgent
  return /iP(hone|ad|od)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
}

/** Iframe du dernier export, retirée au plus tard à l'export suivant. */
let printFrame: HTMLIFrameElement | null = null

/** Impression via une iframe cachée (desktop, Android). */
function printInIframe(html: string, docTitle: string): Promise<void> {
  return new Promise((resolve, reject) => {
    printFrame?.remove()
    const iframe = document.createElement("iframe")
    printFrame = iframe
    iframe.setAttribute("aria-hidden", "true")
    iframe.tabIndex = -1
    Object.assign(iframe.style, {
      position: "fixed",
      right: "0",
      bottom: "0",
      width: "0",
      height: "0",
      border: "0",
      opacity: "0",
      pointerEvents: "none",
    })

    const previousTitle = document.title
    let settled = false
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined
    const onFocus = () => finish()

    const finish = (error?: unknown) => {
      if (settled) return
      settled = true
      if (fallbackTimer) clearTimeout(fallbackTimer)
      window.removeEventListener("focus", onFocus)
      document.title = previousTitle
      // Certains navigateurs (mobiles, Safari) signalent la fin avant d'avoir fini de
      // préparer l'impression : on garde l'iframe un moment (ou jusqu'à l'export suivant).
      setTimeout(() => {
        iframe.remove()
        if (printFrame === iframe) printFrame = null
      }, 60_000)
      if (error) reject(error)
      else resolve()
    }

    iframe.onload = () => {
      const win = iframe.contentWindow
      if (!win) {
        finish(new Error("Print unavailable"))
        return
      }
      win.addEventListener("afterprint", () => finish(), { once: true })
      // Filet de sécurité si « afterprint » n'arrive jamais.
      fallbackTimer = setTimeout(() => finish(), 120_000)
      try {
        // Nom proposé pour le fichier PDF.
        document.title = docTitle
        win.focus()
        const startedAt = performance.now()
        win.print()
        // print() bloquant (la plupart des navigateurs desktop) : la boîte est fermée.
        if (performance.now() - startedAt > 500) finish()
        // Sinon, on attend « afterprint » ou le retour du focus sur la page.
        else window.addEventListener("focus", onFocus, { once: true })
      } catch (error) {
        finish(error)
      }
    }

    iframe.srcdoc = html
    document.body.appendChild(iframe)
  })
}

/**
 * iOS Safari imprime la page entière au lieu de l'iframe : on écrit le document
 * dans un nouvel onglet (ouvert pendant le clic) et on y lance l'impression.
 */
function printInNewWindow(html: string): Promise<void> {
  const win = window.open("", "_blank")
  if (!win) return Promise.reject(new Error("Popup blocked"))
  win.document.open()
  win.document.write(html)
  win.document.close()
  win.focus()
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        win.print()
        resolve()
      } catch (error) {
        reject(error)
      }
    }, 300)
  })
}

/**
 * Ouvre la boîte d'impression avec le plan et sa liste de courses. À appeler
 * directement dans le gestionnaire de clic (ouverture d'onglet sur iOS).
 */
export function exportMealPlanPDF(options: ExportOptions): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser only"))
  const html = generateMealPlanHTML(options)
  if (isIOS()) return printInNewWindow(html)
  return printInIframe(html, `${options.title} · Tchopé`)
}
