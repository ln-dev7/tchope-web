"use client"

import { useCallback, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CalendarDays, Copy, Share2, ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useLocalizedRecipes } from "@/hooks/use-localized-recipes"
import { useMealPlanner } from "@/stores/meal-planner"
import { EMPTY_CHECKED, useShoppingList } from "@/stores/shopping-list"
import { buildRecipeMap, buildShoppingList, formatShoppingListText, shoppingItemKey } from "@/lib/shopping"
import { useStoreHydrated } from "@/components/planner/use-store-hydrated"
import { ShoppingItemRow } from "@/components/planner/shopping-item-row"
import { copyText } from "@/components/planner/clipboard"

export default function ShoppingListPage() {
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const isFr = locale === "fr"
  const router = useRouter()
  const recipes = useLocalizedRecipes(locale)

  const planHydrated = useStoreHydrated(useMealPlanner.persist)
  const listHydrated = useStoreHydrated(useShoppingList.persist)
  const hydrated = planHydrated && listHydrated

  const currentPlan = useMealPlanner((s) => s.currentPlan)
  const planId = currentPlan?.id ?? null
  const checkedList = useShoppingList((s) => (planId && s.planId === planId ? s.checked : EMPTY_CHECKED))
  const toggle = useShoppingList((s) => s.toggle)
  const clearChecked = useShoppingList((s) => s.clearChecked)

  const recipeMap = useMemo(() => buildRecipeMap(recipes), [recipes])
  const items = useMemo(() => buildShoppingList(currentPlan, recipeMap), [currentPlan, recipeMap])
  const checked = useMemo(() => new Set(checkedList), [checkedList])

  const uncheckedItems = useMemo(() => items.filter((i) => !checked.has(shoppingItemKey(i))), [items, checked])
  const checkedItems = useMemo(() => items.filter((i) => checked.has(shoppingItemKey(i))), [items, checked])

  const toggleItem = useCallback(
    (key: string) => {
      if (planId) toggle(planId, key)
    },
    [planId, toggle]
  )

  const listText = useCallback(
    () => formatShoppingListText(items, checked, t("shoppingListTitle")),
    [items, checked, t]
  )

  const copyList = useCallback(async () => {
    const ok = await copyText(listText())
    if (ok) toast.success(t("shoppingListCopied"))
    else toast.error(isFr ? "Impossible de copier la liste" : "Couldn't copy the list")
  }, [listText, t, isFr])

  // Partage natif si disponible, sinon copie dans le presse-papiers.
  const handleShare = useCallback(async () => {
    const text = listText()
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
      }
    }
    await copyList()
  }, [listText, copyList])

  function goBack() {
    if (window.history.length > 1) router.back()
    else router.push(`/${locale}/app/planner`)
  }

  return (
    <div className="space-y-5 pb-4">
      {/* En-tête */}
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          aria-label={isFr ? "Retour" : "Back"}
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface transition-colors hover:bg-foreground/5 dark:bg-dark-surface dark:hover:bg-white/10"
        >
          <ArrowLeft className="size-5 text-foreground dark:text-white" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-extrabold text-foreground dark:text-white">{t("shoppingListTitle")}</h1>
          <p className="mt-px text-xs text-muted dark:text-dark-muted">{t("shoppingListSubtitle")}</p>
        </div>
      </header>

      {!hydrated ? (
        <ShoppingListSkeleton />
      ) : (
        <>
          {/* Compteurs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center rounded-[14px] bg-primary/10 p-3 dark:bg-primary/15">
              <span className="text-[22px] font-extrabold text-primary tabular-nums">{uncheckedItems.length}</span>
              <span className="mt-0.5 text-[11px] font-semibold text-primary">{t("shoppingListUnchecked")}</span>
            </div>
            <div className="flex flex-col items-center rounded-[14px] bg-secondary/10 p-3 dark:bg-green-400/10">
              <span className="text-[22px] font-extrabold text-secondary tabular-nums dark:text-green-400">
                {checkedItems.length}
              </span>
              <span className="mt-0.5 text-[11px] font-semibold text-secondary dark:text-green-400">
                {t("shoppingListChecked")}
              </span>
            </div>
          </div>

          {/* Copier / partager */}
          {items.length > 0 && (
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={copyList}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-primary p-3.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
              >
                <Copy className="size-[18px]" />
                {t("shoppingListCopy")}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-foreground/10 bg-surface px-5 py-3.5 text-sm font-bold text-foreground transition-colors hover:bg-foreground/5 dark:border-white/10 dark:bg-dark-surface dark:text-white dark:hover:bg-white/5"
              >
                <Share2 className="size-[18px]" />
                {t("shoppingListShare")}
              </button>
            </div>
          )}

          {/* Liste vide */}
          {items.length === 0 && (
            <div className="flex flex-col items-center py-14 text-center">
              <ShoppingCart className="size-12 text-muted/70 dark:text-dark-muted/70" strokeWidth={1.5} />
              <p className="mt-3 text-[15px] text-muted dark:text-dark-muted">{t("shoppingListEmpty")}</p>
              {!currentPlan && (
                <Link
                  href={`/${locale}/app/planner`}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/15 dark:bg-primary/15 dark:hover:bg-primary/25"
                >
                  <CalendarDays className="size-4" />
                  {t("plannerCta")}
                </Link>
              )}
            </div>
          )}

          {/* À acheter */}
          {uncheckedItems.length > 0 && (
            <div className="grid gap-1.5 lg:grid-cols-2">
              {uncheckedItems.map((item) => {
                const key = shoppingItemKey(item)
                return <ShoppingItemRow key={key} item={item} checked={false} onToggle={() => toggleItem(key)} />
              })}
            </div>
          )}

          {/* Déjà chez moi */}
          {checkedItems.length > 0 && (
            <section className="pt-2">
              <div className="mb-2.5 flex items-center">
                <h2 className="flex-1 text-sm font-bold text-secondary dark:text-green-400">
                  {t("shoppingListChecked")} ({checkedItems.length})
                </h2>
                <button
                  type="button"
                  onClick={clearChecked}
                  className="cursor-pointer rounded-full px-2 py-1 text-xs font-semibold text-muted transition-colors hover:bg-foreground/5 hover:text-foreground dark:text-dark-muted dark:hover:bg-white/5 dark:hover:text-white"
                >
                  {t("shoppingListClearChecked")}
                </button>
              </div>
              <div className="grid gap-1.5 lg:grid-cols-2">
                {checkedItems.map((item) => {
                  const key = shoppingItemKey(item)
                  return <ShoppingItemRow key={key} item={item} checked onToggle={() => toggleItem(key)} />
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function ShoppingListSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3">
        <div className="h-[72px] rounded-[14px] bg-primary/10" />
        <div className="h-[72px] rounded-[14px] bg-secondary/10" />
      </div>
      <div className="grid gap-1.5 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[74px] rounded-[14px] bg-foreground/5 dark:bg-white/5" />
        ))}
      </div>
    </div>
  )
}
