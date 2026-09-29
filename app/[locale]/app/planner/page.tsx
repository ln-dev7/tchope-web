"use client"

import { useCallback, useMemo, useState } from "react"
import { CalendarDays } from "lucide-react"
import { toast } from "sonner"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useLocalizedRecipes } from "@/hooks/use-localized-recipes"
import { StoreBanner } from "@/components/store-banner"
import { AiConsentError } from "@/lib/ai/client"
import { buildRecipeMap, getShoppingItemCount } from "@/lib/shopping"
import { exportMealPlanPDF } from "@/lib/export-plan"
import { generatePlanId, toDateKey, useMealPlanner, type MealPlan } from "@/stores/meal-planner"
import type { TranslationKey } from "@/constants/translations"
import { useStoreHydrated } from "@/components/planner/use-store-hydrated"
import { adjustMealPlanAI, formatDate, generateMealPlanAI, type Lang } from "@/components/planner/planner-utils"
import { DaySection } from "@/components/planner/day-section"
import { GenerateForm } from "@/components/planner/generate-form"
import { AdjustPanel } from "@/components/planner/adjust-panel"
import { PlanActions } from "@/components/planner/plan-actions"
import { SavedPlans } from "@/components/planner/saved-plans"

type ErrorKey = Extract<TranslationKey, "plannerError" | "plannerNoConnection">

function isOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false
}

export default function PlannerPage() {
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const isFr = locale === "fr"
  const lang: Lang = isFr ? "fr" : "en"
  const recipes = useLocalizedRecipes(locale)

  const hydrated = useStoreHydrated(useMealPlanner.persist)
  const currentPlan = useMealPlanner((s) => s.currentPlan)
  const savedPlans = useMealPlanner((s) => s.savedPlans)
  const setCurrentPlan = useMealPlanner((s) => s.setCurrentPlan)
  const savePlan = useMealPlanner((s) => s.savePlan)
  const deleteSavedPlan = useMealPlanner((s) => s.deleteSavedPlan)
  const reusePlan = useMealPlanner((s) => s.reusePlan)
  const resetPlan = useMealPlanner((s) => s.resetPlan)
  const swapMeal = useMealPlanner((s) => s.swapMeal)

  const [preferences, setPreferences] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<ErrorKey | null>(null)
  const [showAdjust, setShowAdjust] = useState(false)
  const [adjustText, setAdjustText] = useState("")
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [adjustError, setAdjustError] = useState<ErrorKey | null>(null)

  const recipeMap = useMemo(() => buildRecipeMap(recipes), [recipes])
  const shoppingCount = useMemo(() => getShoppingItemCount(currentPlan, recipeMap), [currentPlan, recipeMap])
  const sortedDays = useMemo(() => (currentPlan ? Object.keys(currentPlan.days).sort() : []), [currentPlan])
  const todayKey = useMemo(() => (hydrated ? toDateKey(new Date()) : ""), [hydrated])

  // ── Générer ──
  const handleGenerate = useCallback(async () => {
    if (isGenerating) return
    setGenerateError(null)
    if (isOffline()) {
      setGenerateError("plannerNoConnection")
      return
    }
    setIsGenerating(true)
    try {
      const today = new Date()
      const days: string[] = []
      for (let i = 0; i < 7; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() + i)
        days.push(toDateKey(d))
      }
      const result = await generateMealPlanAI(recipes, preferences, days, isFr)
      const plan: MealPlan = {
        id: generatePlanId(),
        startDate: days[0],
        endDate: days[6],
        preferences,
        days: result,
        createdAt: new Date().toISOString(),
      }
      setCurrentPlan(plan)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (error) {
      // Consentement IA refusé : on revient simplement à l'état précédent.
      if (!(error instanceof AiConsentError)) setGenerateError("plannerError")
    } finally {
      setIsGenerating(false)
    }
  }, [isGenerating, recipes, preferences, isFr, setCurrentPlan])

  // ── Ajuster ──
  const handleAdjust = useCallback(async () => {
    if (!currentPlan || !adjustText.trim() || isAdjusting) return
    setAdjustError(null)
    if (isOffline()) {
      setAdjustError("plannerNoConnection")
      return
    }
    setIsAdjusting(true)
    const plan = currentPlan
    try {
      const result = await adjustMealPlanAI(recipes, plan, adjustText, isFr)
      // Le plan a pu être réinitialisé ou remplacé pendant l'appel : on n'écrase rien.
      const latest = useMealPlanner.getState().currentPlan
      if (latest && latest.id === plan.id) {
        setCurrentPlan({ ...latest, days: result })
      }
      setAdjustText("")
      setShowAdjust(false)
    } catch (error) {
      if (!(error instanceof AiConsentError)) setAdjustError("plannerError")
    } finally {
      setIsAdjusting(false)
    }
  }, [currentPlan, adjustText, isAdjusting, recipes, isFr, setCurrentPlan])

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
    setShowAdjust(false)
    setAdjustText("")
    setAdjustError(null)
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
      setGenerateError(null)
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
              <AdjustPanel
                open={showAdjust}
                onToggle={() => setShowAdjust((v) => !v)}
                value={adjustText}
                onChange={setAdjustText}
                onSubmit={handleAdjust}
                isAdjusting={isAdjusting}
                errorMessage={adjustError ? t(adjustError) : null}
                onDismissError={() => setAdjustError(null)}
                isFr={isFr}
                t={t}
              />
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
        <GenerateForm
          value={preferences}
          onChange={setPreferences}
          onSubmit={handleGenerate}
          isGenerating={isGenerating}
          errorMessage={generateError ? t(generateError) : null}
          onDismissError={() => setGenerateError(null)}
          isFr={isFr}
          t={t}
        />
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
