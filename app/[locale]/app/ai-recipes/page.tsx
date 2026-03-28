"use client"

import { useState, useMemo, useCallback } from "react"
import {
  Sparkles,
  Plus,
  X,
  Search,
  Loader2,
  MessageCircle,
  Apple,
  ShoppingCart,
  Info,
  SearchX,
  CloudOff,
  Pencil,
} from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useLocalizedRecipes } from "@/hooks/use-localized-recipes"
import { RecipeCard } from "@/components/recipe-card"
import {
  searchByIngredients,
  isValidIngredient,
  getMissingIngredients,
} from "@/lib/ingredient-matcher"
import type { Recipe } from "@/types/recipe"

type SearchResult = {
  id: string
  match: number
  reason: string
}

type Mode = "ingredients" | "free"

export default function AIRecipesPage() {
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const recipes = useLocalizedRecipes(locale)

  const [mode, setMode] = useState<Mode>("ingredients")
  const [input, setInput] = useState("")
  const [freeText, setFreeText] = useState("")
  const [ingredients, setIngredients] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usedFallback, setUsedFallback] = useState(false)
  const [freeInputFocused, setFreeInputFocused] = useState(false)

  const isFr = locale === "fr"

  const knownIngredients = useMemo(() => {
    const set = new Set<string>()
    recipes.forEach((r) =>
      r.ingredients.forEach((ing) => set.add(ing.name.toLowerCase().trim())),
    )
    return set
  }, [recipes])

  const suggestions = useMemo(() => {
    if (mode !== "ingredients") return []
    const cleaned = input.trim().toLowerCase()
    if (cleaned.length < 2) return []
    const matches: string[] = []
    for (const known of knownIngredients) {
      if (
        known.includes(cleaned) &&
        !ingredients.some((i) => i.toLowerCase() === known)
      ) {
        matches.push(known.charAt(0).toUpperCase() + known.slice(1))
      }
      if (matches.length >= 5) break
    }
    return matches
  }, [mode, input, knownIngredients, ingredients])

  const addIngredient = useCallback(
    (text?: string) => {
      const value = (text ?? input).trim()
      if (!value) return
      if (ingredients.some((i) => i.toLowerCase() === value.toLowerCase())) {
        setInput("")
        return
      }
      if (!isValidIngredient(value, knownIngredients)) {
        setError(t("aiInvalidIngredient"))
        return
      }
      setIngredients((prev) => [
        ...prev,
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
      ])
      setInput("")
      setError(null)
    },
    [input, ingredients, knownIngredients, t],
  )

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index))
  }

  const switchMode = (newMode: Mode) => {
    if (newMode === mode) return
    setMode(newMode)
    setResults(null)
    setError(null)
    setUsedFallback(false)
  }

  const buildRecipeIndex = (forMode: Mode) => {
    if (forMode === "ingredients") {
      return recipes
        .map(
          (r) =>
            `${r.id}|${r.name}|${r.ingredients.map((i) => i.name).join(", ")}`,
        )
        .join("\n")
    }
    return recipes
      .map(
        (r) =>
          `${r.id}|${r.name}|${r.category}|${r.duration}min|${r.difficulty}|${r.spiciness}|${r.servings}pers|${r.ingredients.map((i) => i.name).join(", ")}`,
      )
      .join("\n")
  }

  const handleSearchIngredients = async () => {
    if (ingredients.length === 0) return
    setLoading(true)
    setResults(null)
    setError(null)
    setUsedFallback(false)

    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "ingredients",
          recipeIndex: buildRecipeIndex("ingredients"),
          userIngredients: ingredients,
          isFr,
        }),
      })
      if (!res.ok) throw new Error("API error")
      const data = await res.json()
      setResults(data.results)
    } catch {
      const localResults = searchByIngredients(recipes, ingredients, isFr)
      setResults(
        localResults.map((r) => ({ id: r.id, match: r.match, reason: r.reason })),
      )
      setUsedFallback(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchFreeText = async () => {
    if (!freeText.trim()) return
    setLoading(true)
    setResults(null)
    setError(null)

    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "free",
          recipeIndex: buildRecipeIndex("free"),
          query: freeText.trim(),
          isFr,
        }),
      })
      if (!res.ok) throw new Error("API error")
      const data = await res.json()
      setResults(data.results)
    } catch {
      setError(t("aiError"))
    } finally {
      setLoading(false)
    }
  }

  const canSearch =
    mode === "ingredients"
      ? ingredients.length > 0
      : freeText.trim().length > 0
  const handleSearch =
    mode === "ingredients" ? handleSearchIngredients : handleSearchFreeText

  const matchedRecipes = useMemo(() => {
    if (!results) return []
    return results
      .map((r) => {
        const recipe = recipes.find((rec) => rec.id === r.id)
        if (!recipe) return null
        const missing =
          mode === "ingredients"
            ? getMissingIngredients(recipe, ingredients)
            : []
        return { recipe, match: r.match, reason: r.reason, missing }
      })
      .filter(Boolean) as {
      recipe: Recipe
      match: number
      reason: string
      missing: string[]
    }[]
  }, [results, recipes, mode, ingredients])

  return (
    <div className="space-y-5 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="flex-1 text-xl font-extrabold tracking-tight text-foreground dark:text-white">
          {t("aiTitle")}
        </h1>
        <div className="flex size-9 items-center justify-center rounded-full bg-purple-500/10">
          <Sparkles className="size-[18px] text-purple-500" />
        </div>
      </div>

      {/* Mode switcher */}
      <div className="flex rounded-full bg-foreground/5 p-1 dark:bg-white/5">
        <button
          onClick={() => switchMode("ingredients")}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full py-2.5 text-[13px] font-semibold transition-all ${
            mode === "ingredients"
              ? "bg-primary/10 text-primary ring-1 ring-primary/25 dark:bg-primary/20 dark:ring-primary/30"
              : "text-muted hover:text-foreground dark:text-dark-muted dark:hover:text-white"
          }`}
        >
          <Apple className="size-3.5" />
          {t("aiModeIngredients")}
        </button>
        <button
          onClick={() => switchMode("free")}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full py-2.5 text-[13px] font-semibold transition-all ${
            mode === "free"
              ? "bg-purple-500/10 text-purple-500 ring-1 ring-purple-500/25 dark:bg-purple-500/20 dark:text-purple-400 dark:ring-purple-500/30"
              : "text-muted hover:text-foreground dark:text-dark-muted dark:hover:text-white"
          }`}
        >
          <MessageCircle className="size-3.5" />
          {t("aiModeFree")}
        </button>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-muted dark:text-dark-muted">
        {mode === "ingredients" ? t("aiDescription") : t("aiFreeDescription")}
      </p>

      {/* ── Ingredients mode ── */}
      {mode === "ingredients" && (
        <>
          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 rounded-2xl bg-surface pr-1 pl-4 dark:bg-dark-surface">
              <Apple className="size-[18px] shrink-0 text-muted dark:text-dark-muted" />
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  setError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addIngredient()
                }}
                placeholder={t("aiInputPlaceholder")}
                className="min-w-0 flex-1 bg-transparent py-3.5 px-3 text-[15px] text-foreground outline-none placeholder:text-muted dark:text-white dark:placeholder:text-dark-muted"
              />
              <button
                onClick={() => addIngredient()}
                disabled={!input.trim()}
                className={`flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors ${
                  input.trim()
                    ? "bg-primary text-white"
                    : "text-muted dark:text-dark-muted"
                }`}
              >
                <Plus className="size-5" />
              </button>
            </div>

            {/* Autocomplete suggestions */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => addIngredient(s)}
                    className="flex cursor-pointer items-center gap-1 rounded-2xl bg-purple-500/8 px-3 py-1.5 text-[13px] font-medium text-purple-500 transition-colors hover:bg-purple-500/15 dark:bg-purple-500/12 dark:hover:bg-purple-500/20"
                  >
                    <Plus className="size-3.5" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ingredient chips */}
          {ingredients.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted dark:text-dark-muted">
                {t("aiYourIngredients")} ({ingredients.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ing, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 rounded-full bg-primary/8 py-2 pr-1.5 pl-3.5 dark:bg-primary/15"
                  >
                    <span className="text-sm font-medium text-primary">
                      {ing}
                    </span>
                    <button
                      onClick={() => removeIngredient(index)}
                      className="flex size-[22px] cursor-pointer items-center justify-center rounded-full bg-primary/15 transition-colors hover:bg-primary/25 dark:bg-primary/30"
                    >
                      <X className="size-3 text-primary" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Free text mode ── */}
      {mode === "free" && (
        <>
          {(() => {
            const collapsed =
              !freeInputFocused && results && results.length > 0
            return (
              <div
                className={`rounded-2xl bg-surface dark:bg-dark-surface ${
                  collapsed
                    ? "flex items-center gap-2 px-3 py-3"
                    : "p-4"
                }`}
              >
                {collapsed && (
                  <MessageCircle className="size-4 shrink-0 text-muted dark:text-dark-muted" />
                )}
                <textarea
                  value={freeText}
                  onChange={(e) => {
                    setFreeText(e.target.value)
                    setError(null)
                  }}
                  onFocus={() => setFreeInputFocused(true)}
                  onBlur={() => setFreeInputFocused(false)}
                  placeholder={collapsed ? "" : t("aiFreePlaceholder")}
                  rows={collapsed ? 1 : 4}
                  className={`w-full resize-none bg-transparent text-foreground outline-none placeholder:text-muted dark:text-white dark:placeholder:text-dark-muted ${
                    collapsed ? "text-sm" : "text-[15px] leading-relaxed"
                  }`}
                />
                {collapsed && (
                  <button
                    onClick={() => setFreeInputFocused(true)}
                    className="shrink-0 cursor-pointer"
                  >
                    <Pencil className="size-4 text-primary" />
                  </button>
                )}
              </div>
            )
          })()}
        </>
      )}

      {/* Error */}
      {error && (
        <p className="px-1 text-[13px] text-red-500">{error}</p>
      )}

      {/* Search button */}
      <button
        onClick={handleSearch}
        disabled={!canSearch || loading}
        className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold transition-colors ${
          canSearch && !loading
            ? "bg-purple-500 text-white hover:bg-purple-600"
            : "bg-surface text-muted dark:bg-dark-surface dark:text-dark-muted"
        }`}
      >
        {loading ? (
          <Loader2 className="size-[18px] animate-spin" />
        ) : (
          <Search className="size-[18px]" />
        )}
        {loading ? t("aiSearching") : t("aiSearch")}
      </button>

      {/* Fallback notice */}
      {usedFallback && results && results.length > 0 && (
        <div className="flex items-center gap-2 rounded-2xl bg-amber-500/8 px-3.5 py-2.5 dark:bg-amber-500/10">
          <Info className="size-4 shrink-0 text-amber-500" />
          <p className="text-xs text-muted dark:text-dark-muted">
            {t("aiFallback")}
          </p>
        </div>
      )}

      {/* Results */}
      {matchedRecipes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground dark:text-white">
            {t("aiResults")} ({matchedRecipes.length})
          </h2>
          {matchedRecipes.map(({ recipe, match, reason, missing }) => (
            <div key={recipe.id} className="space-y-2">
              <RecipeCard recipe={recipe} locale={locale} />
              <div className="space-y-1 px-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-xl px-2 py-0.5 text-xs font-bold ${
                      match >= 70
                        ? "bg-green-500/15 text-green-500"
                        : match >= 50
                          ? "bg-amber-500/15 text-amber-500"
                          : "bg-red-500/15 text-red-500"
                    }`}
                  >
                    {match}%
                  </span>
                  <span className="line-clamp-2 text-xs text-muted dark:text-dark-muted">
                    {reason}
                  </span>
                </div>
                {mode === "ingredients" && missing.length > 0 && (
                  <div className="flex items-start gap-1.5">
                    <ShoppingCart className="mt-0.5 size-3.5 shrink-0 text-muted/60 dark:text-dark-muted/60" />
                    <span className="line-clamp-3 text-xs text-muted/60 dark:text-dark-muted/60">
                      {isFr
                        ? `Il vous manque ${missing.length} ingredient${missing.length > 1 ? "s" : ""} : ${missing.join(", ")}`
                        : `Missing ${missing.length} ingredient${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {results && matchedRecipes.length === 0 && !loading && (
        <div className="flex flex-col items-center gap-3 py-10">
          <SearchX className="size-12 text-muted/40 dark:text-dark-muted/40" />
          <p className="text-base font-semibold text-muted dark:text-dark-muted">
            {t("aiNoResults")}
          </p>
          <p className="text-center text-sm text-muted/60 dark:text-dark-muted/60">
            {t("aiNoResultsHint")}
          </p>
        </div>
      )}
    </div>
  )
}
