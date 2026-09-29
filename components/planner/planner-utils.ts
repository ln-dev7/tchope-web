import { callClaude, TCHOPAI_MODEL } from "@/lib/ai/client"
import type { DayPlan, MealPlan, MealSlot } from "@/stores/meal-planner"
import type { Recipe } from "@/types/recipe"

/**
 * Dates et appels IA du planificateur, repris de tchope/app/(tabs)/planner.tsx
 * (mêmes prompts, même modèle, même lecture du JSON).
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

function buildRecipeIndex(recipes: Recipe[]): string {
  return recipes
    .map((r) => `${r.id}|${r.name}|${r.category}|${r.region}|${r.duration}min|${r.difficulty}|${r.spiciness}`)
    .join("\n")
}

/**
 * Lit le JSON renvoyé par l'IA (premier « { » au dernier « } ») et ne garde que
 * les jours bien formés, pour ne jamais casser l'affichage.
 */
function parsePlanDays(text: string): Record<string, DayPlan> {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("Invalid response")
  const raw = JSON.parse(jsonMatch[0]) as unknown
  if (!raw || typeof raw !== "object") throw new Error("Invalid response")

  const days: Record<string, DayPlan> = {}
  for (const [date, value] of Object.entries(raw as Record<string, unknown>)) {
    // Clé de jour invalide (« Monday », « 2026-13-45 »…) : formatDate afficherait « undefined NaN ».
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(date + "T12:00:00").getTime())) continue
    const meals = (value as { meals?: unknown } | null)?.meals
    if (!Array.isArray(meals)) continue
    const slots: MealSlot[] = meals
      .filter(
        (m): m is { label: unknown; recipeId: unknown } =>
          !!m && typeof m === "object" && typeof (m as { recipeId?: unknown }).recipeId === "string"
      )
      .map((m) => ({ label: typeof m.label === "string" ? m.label : "", recipeId: m.recipeId as string }))
    days[date] = { meals: slots }
  }
  if (Object.keys(days).length === 0) throw new Error("Invalid response")
  return days
}

// ── IA : générer le plan ──────────────────────────────────────────

export async function generateMealPlanAI(
  recipes: Recipe[],
  preferences: string,
  days: string[],
  isFr: boolean
): Promise<Record<string, DayPlan>> {
  const recipeList = buildRecipeIndex(recipes)
  const lang: Lang = isFr ? "fr" : "en"
  const dayLabels = days.map((d) => `${d} (${formatDate(d, lang)})`).join(", ")

  const systemPrompt = `You are a Cameroonian meal planner. Create a weekly meal plan using ONLY recipe IDs from the provided list.

CRITICAL: Respect the user's preferences for NUMBER OF MEALS per day. If they ask for 3 meals, give 3. If they ask for 2 on weekends, give 2 on weekends. Default is 2 (lunch + dinner) if not specified.

Meal labels to use (in ${isFr ? "French" : "English"}):
- Breakfast: "${isFr ? "Petit-déj" : "Breakfast"}"
- Lunch: "${isFr ? "Déjeuner" : "Lunch"}"
- Dinner: "${isFr ? "Dîner" : "Dinner"}"

Rules:
- Vary recipes: never repeat the same dish twice in the week
- Balance regions and categories
- Light meals for breakfast/lunch, heartier for dinner
- Match user preferences (regions, dietary needs, meal counts)

Days: ${dayLabels}

Return ONLY valid JSON (no markdown), format:
{
  "YYYY-MM-DD": { "meals": [{"label": "Déjeuner", "recipeId": "id"}, {"label": "Dîner", "recipeId": "id"}] },
  ...
}`

  const text = await callClaude({
    model: TCHOPAI_MODEL,
    max_tokens: 2048,
    system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: `Recipe list:\n${recipeList}\n\nPreferences: ${preferences || "No specific preferences. 2 meals per day (lunch + dinner), balanced and varied."}`,
      },
    ],
  })

  return parsePlanDays(text)
}

// ── IA : ajuster le plan ──────────────────────────────────────────

export async function adjustMealPlanAI(
  recipes: Recipe[],
  currentPlan: MealPlan,
  adjustmentRequest: string,
  isFr: boolean
): Promise<Record<string, DayPlan>> {
  const recipeList = buildRecipeIndex(recipes)
  const lang: Lang = isFr ? "fr" : "en"

  // Plan actuel, en texte, pour le contexte
  const currentPlanStr = Object.entries(currentPlan.days)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, day]) => {
      const meals = day.meals.map((m) => `${m.label}: ${m.recipeId}`).join(", ")
      return `${date} (${formatDate(date, lang)}): ${meals}`
    })
    .join("\n")

  const systemPrompt = `You are a Cameroonian meal planner. The user has an existing plan and wants to ADJUST it. Only change what the user asks for, keep everything else the same.

Meal labels (${isFr ? "French" : "English"}):
- "${isFr ? "Petit-déj" : "Breakfast"}", "${isFr ? "Déjeuner" : "Lunch"}", "${isFr ? "Dîner" : "Dinner"}"

You can: swap recipes, add meals to a day, remove meals from a day, change entire days.
Keep unchanged days exactly as they are.

Return the FULL updated plan as valid JSON (no markdown), same format:
{
  "YYYY-MM-DD": { "meals": [{"label": "...", "recipeId": "id"}, ...] },
  ...
}`

  const text = await callClaude({
    model: TCHOPAI_MODEL,
    max_tokens: 2048,
    system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: `Available recipes:\n${recipeList}\n\nCurrent plan:\n${currentPlanStr}\n\nAdjustment requested: ${adjustmentRequest}`,
      },
    ],
  })

  return parsePlanDays(text)
}
