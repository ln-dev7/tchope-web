"use client"

import { Suspense, useRef, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Search as SearchIcon, X, Clock, Flame, RotateCcw } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useLocalizedRecipes } from "@/hooks/use-localized-recipes"
import { useSearch, type Filters } from "@/hooks/use-search"
import { RecipeCard } from "@/components/recipe-card"
import type { Spiciness } from "@/types/recipe"

const POPULAR_INGREDIENTS = ["Plantain", "Manioc", "Arachides"]

const DURATION_FILTERS: { key: Filters["duration"]; labelKey: string }[] = [
  { key: "under30", labelKey: "under30" },
  { key: "30to60", labelKey: "between30and60" },
  { key: "over60", labelKey: "over60" },
]

const SPICINESS_FILTERS: { key: Spiciness; labelKey: string }[] = [
  { key: "Mild", labelKey: "mild" },
  { key: "Medium", labelKey: "mediumSpice" },
  { key: "Extra Hot", labelKey: "extraHot" },
]

export default function SearchPageWrapper() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  )
}

function SearchPage() {
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const recipes = useLocalizedRecipes(locale)
  const { results, query, setQuery, filters, setFilters, reset } =
    useSearch(recipes)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchParams = useSearchParams()

  // Handle region filter from URL
  useEffect(() => {
    const region = searchParams.get("region")
    if (region) {
      setQuery(region)
    }
  }, [searchParams, setQuery])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const hasFilters = !!(query || filters.duration || filters.spiciness || filters.ingredient)

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted dark:text-dark-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-2xl border border-foreground/5 bg-surface py-3.5 pr-10 pl-11 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary/30 dark:border-white/5 dark:bg-dark-surface dark:text-white dark:placeholder:text-dark-muted"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-muted hover:text-foreground dark:text-dark-muted"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Duration filters */}
      <section>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground dark:text-white">
          <Clock className="size-4 text-primary" />
          {t("cookingTime")}
        </div>
        <div className="flex flex-wrap gap-2">
          {DURATION_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  duration: prev.duration === f.key ? undefined : f.key,
                }))
              }
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                filters.duration === f.key
                  ? "bg-primary text-white"
                  : "bg-surface text-foreground dark:bg-dark-surface dark:text-white"
              }`}
            >
              {t(f.labelKey as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>
      </section>

      {/* Spiciness filters */}
      <section>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground dark:text-white">
          <Flame className="size-4 text-primary" />
          {t("spicinessLevel")}
        </div>
        <div className="flex flex-wrap gap-2">
          {SPICINESS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  spiciness: prev.spiciness === f.key ? undefined : f.key,
                }))
              }
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                filters.spiciness === f.key
                  ? "bg-primary text-white"
                  : "bg-surface text-foreground dark:bg-dark-surface dark:text-white"
              }`}
            >
              {t(f.labelKey as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>
      </section>

      {/* Popular ingredients */}
      <section>
        <div className="mb-3 text-sm font-semibold text-foreground dark:text-white">
          {t("popularIngredients")}
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_INGREDIENTS.map((ing) => (
            <button
              key={ing}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  ingredient: prev.ingredient === ing ? undefined : ing,
                }))
              }
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                filters.ingredient === ing
                  ? "bg-primary text-white"
                  : "bg-surface text-foreground dark:bg-dark-surface dark:text-white"
              }`}
            >
              {ing}
            </button>
          ))}
        </div>
      </section>

      {/* Results */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground dark:text-white">
            {t("results")}
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">
              {results.length}
            </span>
          </div>
          {hasFilters && (
            <button
              onClick={reset}
              className="flex items-center gap-1 text-xs font-medium text-primary"
            >
              <RotateCcw className="size-3" />
              {t("reset")}
            </button>
          )}
        </div>

        {results.length > 0 ? (
          <div className="space-y-3">
            {results.map((r) => (
              <RecipeCard key={r.id} recipe={r} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-muted dark:text-dark-muted">
            {t("noResults")}
          </div>
        )}
      </section>
    </div>
  )
}
