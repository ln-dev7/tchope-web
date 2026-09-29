import { create } from "zustand"
import { persist } from "zustand/middleware"

/** Plan de repas (comme tchope/context/MealPlannerContext.tsx), dans le navigateur. */

export type MealSlot = {
  label: string // "Petit-déj", "Déjeuner", "Dîner"…
  recipeId: string
}

export type DayPlan = {
  meals: MealSlot[]
}

export type MealPlan = {
  id: string
  startDate: string
  endDate: string
  preferences: string
  days: Record<string, DayPlan> // clé = YYYY-MM-DD
  createdAt: string
}

type MealPlannerStore = {
  currentPlan: MealPlan | null
  savedPlans: MealPlan[]
  setCurrentPlan: (plan: MealPlan | null) => void
  savePlan: () => void
  deleteSavedPlan: (planId: string) => void
  reusePlan: (plan: MealPlan) => void
  resetPlan: () => void
  swapMeal: (date: string, mealIndex: number, newRecipeId: string) => void
  /** Retire le plan en cours s'il est terminé (appelé au chargement). */
  dropExpired: () => void
}

export function generatePlanId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/** Date locale au format YYYY-MM-DD. */
export function toDateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${m}-${day}`
}

export function isPlanExpired(plan: MealPlan): boolean {
  const end = new Date(plan.endDate + "T23:59:59.999")
  return new Date() > end
}

export const useMealPlanner = create<MealPlannerStore>()(
  persist(
    (set, get) => ({
      currentPlan: null,
      savedPlans: [],
      setCurrentPlan: (plan) => set({ currentPlan: plan }),
      savePlan: () => {
        const { currentPlan, savedPlans } = get()
        if (!currentPlan) return
        set({ savedPlans: [...savedPlans.filter((p) => p.id !== currentPlan.id), currentPlan] })
      },
      deleteSavedPlan: (planId) => set((s) => ({ savedPlans: s.savedPlans.filter((p) => p.id !== planId) })),
      reusePlan: (plan) => {
        const today = new Date()
        const dayKeys = Object.keys(plan.days).sort()
        const days: Record<string, DayPlan> = {}
        dayKeys.forEach((key, i) => {
          const d = new Date(today)
          d.setDate(d.getDate() + i)
          days[toDateKey(d)] = plan.days[key]
        })
        const end = new Date(today)
        end.setDate(end.getDate() + dayKeys.length - 1)
        set({
          currentPlan: {
            id: generatePlanId(),
            startDate: toDateKey(today),
            endDate: toDateKey(end),
            preferences: plan.preferences,
            days,
            createdAt: new Date().toISOString(),
          },
        })
      },
      resetPlan: () => set({ currentPlan: null }),
      swapMeal: (date, mealIndex, newRecipeId) => {
        const { currentPlan } = get()
        if (!currentPlan) return
        const day = currentPlan.days[date]
        if (!day || !day.meals[mealIndex]) return
        const meals = [...day.meals]
        meals[mealIndex] = { ...meals[mealIndex], recipeId: newRecipeId }
        set({ currentPlan: { ...currentPlan, days: { ...currentPlan.days, [date]: { meals } } } })
      },
      dropExpired: () => {
        const { currentPlan } = get()
        if (currentPlan && isPlanExpired(currentPlan)) set({ currentPlan: null })
      },
    }),
    {
      name: "tchope_meal_plan",
      onRehydrateStorage: () => (state) => state?.dropExpired(),
    }
  )
)
