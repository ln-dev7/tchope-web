"use client"

import { useCallback, useMemo } from "react"
import { CalendarDays } from "lucide-react"
import { toast } from "sonner"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useLocalizedRecipes } from "@/hooks/use-localized-recipes"
import { StoreBanner } from "@/components/store-banner"
import { buildRecipeMap, getShoppingItemCount } from "@/lib/shopping"
import { exportMealPlanPDF } from "@/lib/export-plan"
import { toDateKey, useMealPlanner, type MealPlan } from "@/stores/meal-planner"
import { useStoreHydrated } from "@/components/planner/use-store-hydrated"
import { formatDate, type Lang } from "@/components/planner/planner-utils"
import { useAppOnly } from "@/components/app-only"
import { DaySection } from "@/components/planner/day-section"
import { GenerateForm } from "@/components/planner/generate-form"
import { AdjustPanel } from "@/components/planner/adjust-panel"
import { PlanActions } from "@/components/planner/plan-actions"
import { SavedPlans } from "@/components/planner/saved-plans"

export default function PlannerPage() {
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const isFr = locale === "fr"
  const lang: Lang = isFr ? "fr" : "en"
  const recipes = useLocalizedRecipes(locale)
  const { openAppOnly } = useAppOnly()

  const hydrated = useStoreHydrated(useMealPlanner.persist)
  const currentPlan = useMealPlanner((s) => s.currentPlan)
  const savedPlans = useMealPlanner((s) => s.savedPlans)
  const savePlan = useMealPlanner((s) => s.savePlan)
  const deleteSavedPlan = useMealPlanner((s) => s.deleteSavedPlan)
  const reusePlan = useMealPlanner((s) => s.reusePlan)
  const resetPlan = useMealPlanner((s) => s.resetPlan)
  const swapMeal = useMealPlanner((s) => s.swapMeal)

  const recipeMap = useMemo(() => buildRecipeMap(recipes), [recipes])
  const shoppingCount = useMemo(() => getShoppingItemCount(currentPlan, recipeMap), [currentPlan, recipeMap])
  const sortedDays = useMemo(() => (currentPlan ? Object.keys(currentPlan.days).sort() : []), [currentPlan])
  const todayKey = useMemo(() => (hydrated ? toDateKey(new Date()) : ""), [hydrated])

  // ── Échanger un repas (recette au hasard, comme le mobile) ──
  const handleSwap = useCallback(
    (date: string, mealIndex: number) => {
      const current = useMealPlanner.getState().currentPlan?.days[date]?.meals[mealIndex]?.recipeId
      const allIds = recipes.map((r) => r.id).filter((id) => id !== current)
      const randomId = allIds[Math.floor(Math.random() * allIds.length)]
      if (randomId) swapMeal(date, mealIndex, randomId)
    },
    [recipes, swapMeal]
  )

  const handleSave = useCallback(() => {
    savePlan()
    toast.success(t("plannerSaved"))
  }, [savePlan, t])

  const handleReset = useCallback(() => {
    resetPlan()
  }, [resetPlan])

  const handleDeleteSaved = useCallback(
    (planId: string) => {
      deleteSavedPlan(planId)
      toast.success(t("plannerPlanDeleted"))
    },
    [deleteSavedPlan, t]
  )

  const handleReuse = useCallback(
    (plan: MealPlan) => {
      reusePlan(plan)
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
    [reusePlan]
  )

  // Appel direct dans le clic (l'export ouvre un onglet sur iOS).
  const handleExportPdf = useCallback(() => {
    if (!currentPlan) return
    exportMealPlanPDF({
      plan: currentPlan,
      recipeMap,
      lang,
      title: t("pdfTitle"),
      shoppingListTitle: t("pdfShoppingList"),
    })
      .then(() => toast.success(t("plannerExportSuccess")))
      .catch(() => toast.error(t("plannerExportError")))
  }, [currentPlan, recipeMap, lang, t])

  const recipeHref = useCallback((recipeId: string) => `/${locale}/app/recipe/${recipeId}`, [locale])

  return (
    <div className="space-y-6 pb-4">
      <StoreBanner />

      <h1 className="text-2xl font-extrabold tracking-tight text-foreground dark:text-white">{t("plannerTitle")}</h1>

      {!hydrated ? (
        <PlannerSkeleton />
      ) : currentPlan ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-8">
          {/* Jours */}
          <div className="min-w-0 space-y-5">
            <div className="flex items-center gap-2 rounded-2xl bg-primary/8 p-3.5 dark:bg-primary/15">
              <CalendarDays className="size-[18px] shrink-0 text-primary" />
              <p className="text-[13px] font-semibold text-primary">
                {formatDate(currentPlan.startDate, lang)} → {formatDate(currentPlan.endDate, lang)}
              </p>
            </div>

            {sortedDays.map((date) => {
              const day = currentPlan.days[date]
              if (!day) return null
              return (
                <DaySection
                  key={date}
                  date={date}
                  day={day}
                  lang={lang}
                  isToday={date === todayKey}
                  todayLabel={t("today")}
                  swapLabel={t("plannerSwap")}
                  recipeMap={recipeMap}
                  recipeHref={recipeHref}
                  onSwap={handleSwap}
                />
              )
            })}
          </div>

          {/* Ajuster + actions (colonne collante sur desktop) */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
            <div className="order-1 lg:order-2">
              <AdjustPanel onOpen={openAppOnly} t={t} />
            </div>
            <div className="order-2 lg:order-1">
              <PlanActions
                shoppingHref={`/${locale}/app/shopping-list`}
                shoppingCount={shoppingCount}
                onSave={handleSave}
                onExport={handleExportPdf}
                onReset={handleReset}
                t={t}
              />
            </div>
          </aside>
        </div>
      ) : (
        <GenerateForm onSubmit={openAppOnly} t={t} />
      )}

      {hydrated && (
        <SavedPlans plans={savedPlans} lang={lang} t={t} onReuse={handleReuse} onDelete={handleDeleteSaved} />
      )}
    </div>
  )
}

function PlannerSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-hidden="true">
      <div className="h-12 rounded-2xl bg-primary/8 dark:bg-primary/15" />
      {[0, 1].map((i) => (
        <div key={i}>
          <div className="mb-2.5 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-foreground/5 dark:bg-white/5" />
            <div className="h-4 w-36 rounded-full bg-foreground/5 dark:bg-white/5" />
          </div>
          <div className="ml-[52px] space-y-2">
            <div className="h-20 rounded-2xl bg-foreground/5 dark:bg-white/5" />
            <div className="h-20 rounded-2xl bg-foreground/5 dark:bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  )
}
