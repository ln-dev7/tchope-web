"use client"

import { useCallback, useMemo, useState } from "react"
import {
  ArrowLeft,
  Carrot,
  Info,
  MessageCircle,
  Plus,
  PlusCircle,
  Search,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useLocalizedRecipes } from "@/hooks/use-localized-recipes"
import { RecipeCard } from "@/components/recipe-card"
import {
  searchByIngredients,
  isValidIngredient,
  getMissingIngredients,
} from "@/lib/ingredient-matcher"
import { useGoBack } from "@/hooks/use-go-back"
import { useAppOnly } from "@/components/app-only"
import { appOnlyText } from "@/lib/app-only-i18n"
import type { Recipe } from "@/types/recipe"

type SearchResult = {
  id: string
  match: number
  reason: string
}

/** Classes partagées (ex-components/tchop-ai/styles.ts). */
const focusRing =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
const focusRingPrimary =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
const roundButton =
  "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-foreground/5 dark:bg-dark-surface dark:text-white dark:hover:bg-white/10"

// ── Pastille de pourcentage ──────────────────────────────────────────────

function matchPillClass(match: number): string {
  if (match >= 70) return "bg-[#22C55E]/15 text-[#15803D] dark:text-[#22C55E]"
  if (match >= 50) return "bg-[#F59E42]/15 text-[#B45309] dark:text-[#F59E42]"
  return "bg-[#EF4444]/15 text-[#B91C1C] dark:text-[#EF4444]"
}

// ── Page ─────────────────────────────────────────────────────────────────

/**
 * « Cuisine avec ce que j'ai » (port de tchope/app/ai-recipes.tsx), sans IA sur le site : recherche
 * locale par ingrédients (comme l'app sans abonnement). La recherche par l'IA et la recherche libre
 * sont dans l'app : elles ouvrent la fenêtre « dans l'app » (components/app-only.tsx).
 */
export default function AiRecipesPage() {
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const recipes = useLocalizedRecipes(locale)
  const goBack = useGoBack(`/${locale}/app`)
  const isFr = locale === "fr"
  const { openAppOnly } = useAppOnly()
  const appOnly = appOnlyText(locale)

  const [input, setInput] = useState("")
  const [ingredients, setIngredients] = useState<string[]>([])
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const knownIngredients = useMemo(() => {
    const set = new Set<string>()
    recipes.forEach((r) =>
      r.ingredients.forEach((ing) => set.add(ing.name.toLowerCase().trim()))
    )
    return set
  }, [recipes])

  const suggestions = useMemo(() => {
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
  }, [input, knownIngredients, ingredients])

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
    [input, ingredients, knownIngredients, t]
  )

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSearch = () => {
    if (ingredients.length === 0) return
    setError(null)
    const localResults = searchByIngredients(recipes, ingredients, isFr)
    setResults(
      localResults.map((r) => ({ id: r.id, match: r.match, reason: r.reason }))
    )
  }

  const canSearch = ingredients.length > 0

  const matchedRecipes = useMemo(() => {
    if (!results) return []
    return results
      .map((r) => {
        const recipe = recipes.find((rec) => rec.id === r.id)
        if (!recipe) return null
        return {
          recipe,
          match: r.match,
          reason: r.reason,
          missing: getMissingIngredients(recipe, ingredients),
        }
      })
      .filter(Boolean) as {
      recipe: Recipe
      match: number
      reason: string
      missing: string[]
    }[]
  }, [results, recipes, ingredients])

  return (
    <div className="space-y-5 pb-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={goBack}
          aria-label={isFr ? "Retour" : "Back"}
          title={isFr ? "Retour" : "Back"}
          className={cn(roundButton, focusRingPrimary)}
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="min-w-0 flex-1 text-xl font-extrabold tracking-tight text-foreground dark:text-white">
          {t("aiTitle")}
        </h1>
        <div
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/15"
        >
          <Sparkles className="size-[18px] fill-primary/20 text-primary" />
        </div>
      </div>

      {/* Mode switcher */}
      <div
        role="group"
        aria-label={isFr ? "Mode de recherche" : "Search mode"}
        className="flex rounded-full bg-[#E4E2E1] p-1 dark:bg-[#3A3A3A]"
      >
        <button
          type="button"
          aria-pressed
          className={cn(
            "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-white py-2.5 text-[13px] font-bold text-primary shadow-sm transition-colors dark:bg-dark-surface",
            focusRingPrimary
          )}
        >
          <Carrot className="size-[15px]" />
          {t("aiModeIngredients")}
        </button>
        {/* Recherche libre par l'IA : dans l'app */}
        <button
          type="button"
          onClick={openAppOnly}
          aria-pressed={false}
          className={cn(
            "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full py-2.5 text-[13px] font-medium text-muted transition-colors hover:text-foreground dark:text-dark-muted dark:hover:text-white",
            focusRing
          )}
        >
          <MessageCircle className="size-[15px]" />
          {t("aiModeFree")}
        </button>
      </div>

      {/* Description */}
      <p className="text-sm leading-5 text-muted dark:text-dark-muted">
        {t("aiDescription")}
      </p>

      {/* ── Ingrédients ── */}
      <>
        <div className="space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              addIngredient()
            }}
            className="flex items-center rounded-[20px] bg-surface pr-1 pl-4 ring-primary/30 transition-shadow focus-within:ring-2 dark:bg-dark-surface"
          >
            <Carrot
              aria-hidden
              className="size-[18px] shrink-0 text-muted dark:text-dark-muted"
            />
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setError(null)
              }}
              placeholder={t("aiInputPlaceholder")}
              aria-label={t("aiInputPlaceholder")}
              aria-invalid={!!error}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="done"
              className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-base text-foreground outline-none placeholder:text-muted dark:text-white dark:placeholder:text-dark-muted"
            />
            <button
              type="submit"
              // Garde le focus (et le clavier du téléphone) dans le champ, comme keyboardShouldPersistTaps sur mobile.
              onMouseDown={(e) => e.preventDefault()}
              disabled={!input.trim()}
              aria-label={isFr ? "Ajouter l'ingrédient" : "Add ingredient"}
              title={isFr ? "Ajouter" : "Add"}
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
                input.trim()
                  ? "cursor-pointer bg-primary text-white hover:bg-primary-dark"
                  : "cursor-not-allowed bg-transparent text-muted dark:text-dark-muted",
                focusRingPrimary
              )}
            >
              <Plus className="size-5" />
            </button>
          </form>

          {/* Autocomplete */}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addIngredient(s)}
                  className={cn(
                    "flex cursor-pointer items-center gap-1 rounded-2xl bg-primary/8 px-3 py-1.5 text-[13px] font-medium text-primary transition-colors hover:bg-primary/15 dark:bg-primary/12 dark:hover:bg-primary/20",
                    focusRing
                  )}
                >
                  <PlusCircle className="size-3.5" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chips */}
        {ingredients.length > 0 && (
          <div className="space-y-3">
            <p className="text-[13px] font-semibold tracking-wider text-muted uppercase dark:text-dark-muted">
              {t("aiYourIngredients")} ({ingredients.length})
            </p>
            <ul className="flex flex-wrap gap-2">
              {ingredients.map((ing, index) => (
                <li
                  key={ing}
                  className="flex items-center gap-1.5 rounded-[20px] bg-primary/8 py-2 pr-1.5 pl-3.5 dark:bg-primary/15"
                >
                  <span className="text-sm font-medium text-primary">
                    {ing}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    aria-label={isFr ? `Retirer ${ing}` : `Remove ${ing}`}
                    className={cn(
                      "flex size-[22px] cursor-pointer items-center justify-center rounded-full bg-primary/15 text-primary transition-colors hover:bg-primary/25 dark:bg-primary/30 dark:hover:bg-primary/40",
                      focusRingPrimary
                    )}
                  >
                    <X className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </>

      {/* Error */}
      {error && (
        <p role="alert" className="px-1 text-[13px] text-[#E74C3C]">
          {error}
        </p>
      )}

      {/* Search button */}
      <button
        type="button"
        onClick={handleSearch}
        disabled={!canSearch}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-[20px] py-4 text-base font-bold transition-colors",
          canSearch
            ? "cursor-pointer bg-primary text-white hover:bg-primary-dark"
            : "cursor-not-allowed bg-surface text-muted dark:bg-dark-surface dark:text-dark-muted",
          focusRing
        )}
      >
        <Search className="size-[18px]" />
        {t("aiSearch")}
      </button>

      {/* Recherche locale : la recherche intelligente est dans l'app */}
      {results && (
        <div className="flex items-center gap-2 rounded-2xl bg-primary/8 px-3.5 py-2.5 dark:bg-primary/12">
          <Info className="size-4 shrink-0 text-primary" />
          <p className="flex-1 text-xs text-muted dark:text-dark-muted">
            {appOnly.localHint}
          </p>
          <button
            type="button"
            onClick={openAppOnly}
            className={cn(
              "shrink-0 cursor-pointer text-xs font-bold text-primary underline",
              focusRing
            )}
          >
            {appOnly.localCta}
          </button>
        </div>
      )}

      {/* Results */}
      {matchedRecipes.length > 0 && (
        <section aria-live="polite" className="space-y-4">
          <h2 className="text-xl font-bold text-foreground dark:text-white">
            {t("aiResults")} ({matchedRecipes.length})
          </h2>
          <ul className="space-y-4">
            {matchedRecipes.map(({ recipe, match, reason, missing }) => (
              <li key={recipe.id} className="space-y-2">
                <RecipeCard recipe={recipe} locale={locale} />
                <div className="space-y-1 px-2">
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        "shrink-0 rounded-xl px-2 py-[3px] text-xs font-bold",
                        matchPillClass(match)
                      )}
                    >
                      {match}%
                    </span>
                    <p className="line-clamp-2 flex-1 pt-[3px] text-xs text-muted dark:text-dark-muted">
                      {reason}
                    </p>
                  </div>
                  {missing.length > 0 && (
                    <div className="mt-0.5 flex items-start gap-1.5">
                      <ShoppingCart className="mt-px size-[13px] shrink-0 text-muted dark:text-dark-muted" />
                      <p className="line-clamp-3 flex-1 text-xs text-muted dark:text-dark-muted">
                        {isFr
                          ? `Il vous manque ${missing.length} ingrédient${missing.length > 1 ? "s" : ""} : ${missing.join(", ")}`
                          : `Missing ${missing.length} ingredient${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`}
                      </p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* No results */}
      {results && matchedRecipes.length === 0 && (
        <div
          role="status"
          className="flex flex-col items-center gap-3 py-10 text-center"
        >
          <Search
            className="size-12 text-muted dark:text-dark-muted"
            strokeWidth={1.5}
          />
          <p className="text-base font-semibold text-muted dark:text-dark-muted">
            {t("aiNoResults")}
          </p>
          <p className="text-sm text-muted dark:text-dark-muted">
            {t("aiNoResultsHint")}
          </p>
        </div>
      )}
    </div>
  )
}
