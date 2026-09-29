"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  Carrot,
  CloudOff,
  Info,
  Loader2,
  MessageCircle,
  Plus,
  PlusCircle,
  Search,
  ShoppingCart,
  Sparkles,
  SquarePen,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useLocalizedRecipes } from "@/hooks/use-localized-recipes"
import { RecipeCard } from "@/components/recipe-card"
import { searchByIngredients, isValidIngredient, getMissingIngredients } from "@/lib/ingredient-matcher"
import { AiConsentError, AiHttpError, TCHOPAI_MODEL, callClaude } from "@/lib/ai/client"
import { useOnlineStatus } from "@/components/tchop-ai/use-online-status"
import { useGoBack } from "@/components/tchop-ai/use-go-back"
import { focusRing, focusRingPrimary, roundButton } from "@/components/tchop-ai/styles"
import type { Recipe } from "@/types/recipe"

type SearchResult = {
  id: string
  match: number
  reason: string
}

type Mode = "ingredients" | "free"

// ── AI search by ingredients (identique à tchope/app/ai-recipes.tsx) ─────

async function searchIngredientsAI(
  recipes: Recipe[],
  userIngredients: string[],
  isFr: boolean,
): Promise<SearchResult[]> {
  const recipeIndex = recipes
    .map((r) => `${r.id}|${r.name}|${r.ingredients.map((i) => i.name).join(', ')}`)
    .join('\n');

  const systemPrompt = `You are a Cameroonian cooking ingredient matcher.
You will receive a list of recipes (format: id|name|ingredients) and user's available ingredients.
For each recipe, determine which of its ingredients the user HAS, using semantic matching:
- "poulet" matches "cuisses de poulet", "ailes de poulet", "poulet entier", etc.
- "tomate" matches "tomates cerises", "tomates fraîches", etc.
- "haricots blancs" matches "Haricots blancs (Koki / Cornilles)", "haricots de cornille", "niébé", etc.
- "piment" matches "piment rouge", "piment habanero", "piment jaune", etc.
- Be generous with matching: if the user's ingredient is a core component of a recipe ingredient, it's a match.

IMPORTANT - Classify each recipe ingredient as:
- "base": the main/essential ingredient(s) that define the dish (e.g. haricots for Koki, ndolé leaves for Ndolé)
- "secondary": supporting ingredients (e.g. huile de palme, feuilles de bananier)
- "generic": common pantry items everyone has (sel, poivre, eau, huile de friture, cube maggi) - EXCLUDE these from counts

Return ONLY a valid JSON array (no markdown):
[{"id":"recipe-id","matchedBase":["ingredient1"],"matchedSecondary":["ingredient2"],"totalBase":1,"totalSecondary":3,"reason":"${isFr ? 'Courte explication en français' : 'Short explanation in English'}"}]
- "matchedBase": base ingredients the user has
- "matchedSecondary": secondary ingredients the user has
- "totalBase": total base ingredients in recipe (excluding generic)
- "totalSecondary": total secondary ingredients in recipe (excluding generic)
- "reason": what key ingredients are missing, or "all main ingredients available" if they have the base
- Include ALL recipes where at least 1 base ingredient matches
- Return at most 15 results
- If nothing matches, return []`;

  const text = await callClaude({
    model: TCHOPAI_MODEL,
    max_tokens: 2048,
    system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: `RECIPES:\n${recipeIndex}\n\nMY INGREDIENTS:\n${userIngredients.join(', ')}` }],
  });

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Invalid response');

  type Raw = { id: string; matchedBase: string[]; matchedSecondary: string[]; totalBase: number; totalSecondary: number; reason: string };
  const parsed: Raw[] = JSON.parse(jsonMatch[0]);

  const BW = 0.6, SW = 0.4;
  return parsed
    .map((r) => {
      const bm = r.matchedBase?.length ?? 0, bt = Math.max(r.totalBase ?? 1, 1);
      const sm = r.matchedSecondary?.length ?? 0, st = Math.max(r.totalSecondary ?? 1, 1);
      return { id: r.id, match: Math.round((bm / bt * BW + sm / st * SW) * 100), reason: r.reason };
    })
    .filter((r) => r.match >= 15)
    .sort((a, b) => b.match - a.match)
    .slice(0, 10);
}

// ── AI free-text search (identique à tchope/app/ai-recipes.tsx) ──────────

async function searchFreeTextAI(
  recipes: Recipe[],
  query: string,
  isFr: boolean,
): Promise<SearchResult[]> {
  const recipeIndex = recipes
    .map((r) => `${r.id}|${r.name}|${r.category}|${r.duration}min|${r.difficulty}|${r.spiciness}|${r.servings}pers|${r.ingredients.map((i) => i.name).join(', ')}`)
    .join('\n');

  const systemPrompt = `You are a Cameroonian cooking assistant. You help users find recipes based on natural language requests.
You will receive a list of recipes (format: id|name|category|duration|difficulty|spiciness|servings|ingredients) and a user request in natural language.

The user may ask things like:
- "un plat épicé avec du poulet pour 6 personnes"
- "something quick with tomatoes and onions"
- "je veux un dessert facile"
- "j'ai du manioc et des arachides, qu'est-ce que je peux faire?"
- "un truc pour le dimanche en famille"

Analyze the request and find the best matching recipes considering:
- Mentioned ingredients
- Desired cuisine type/category
- Time constraints (quick, long, etc.)
- Difficulty level
- Number of servings
- Spiciness preferences
- General mood/occasion

Return ONLY a valid JSON array (no markdown):
[{"id":"recipe-id","match":85,"reason":"${isFr ? 'Courte explication en français de pourquoi cette recette correspond' : 'Short explanation in English of why this recipe matches'}"}]
- "match": relevance score 0-100 based on how well the recipe fits the request
- "reason": brief explanation of why this recipe was selected
- Return at most 10 results, sorted by relevance
- Only include recipes with match >= 30
- If nothing matches, return []`;

  const text = await callClaude({
    model: TCHOPAI_MODEL,
    max_tokens: 2048,
    system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: `RECIPES:\n${recipeIndex}\n\nREQUEST:\n${query}` }],
  });

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Invalid response');

  const parsed: SearchResult[] = JSON.parse(jsonMatch[0]);
  return parsed.filter((r) => r.match >= 30).sort((a, b) => b.match - a.match).slice(0, 10);
}

// ── Pastille de pourcentage ──────────────────────────────────────────────

function matchPillClass(match: number): string {
  if (match >= 70) return "bg-[#22C55E]/15 text-[#15803D] dark:text-[#22C55E]"
  if (match >= 50) return "bg-[#F59E42]/15 text-[#B45309] dark:text-[#F59E42]"
  return "bg-[#EF4444]/15 text-[#B91C1C] dark:text-[#EF4444]"
}

// ── Page ─────────────────────────────────────────────────────────────────

/** « Cuisine avec ce que j'ai » (port de tchope/app/ai-recipes.tsx). */
export default function AiRecipesPage() {
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const recipes = useLocalizedRecipes(locale)
  const goBack = useGoBack(`/${locale}/app`)
  const isFr = locale === "fr"
  const isConnected = useOnlineStatus()
  const aiAvailable = isConnected

  const [mode, setMode] = useState<Mode>("ingredients")
  const [input, setInput] = useState("")
  const [freeText, setFreeText] = useState("")
  const [ingredients, setIngredients] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usedFallback, setUsedFallback] = useState(false)
  const [freeInputFocused, setFreeInputFocused] = useState(false)
  const freeInputRef = useRef<HTMLTextAreaElement>(null)
  // Numéro de la recherche en cours : changer de mode abandonne la recherche lancée
  // (sinon ses résultats arriveraient dans l'autre mode).
  const searchIdRef = useRef(0)

  const knownIngredients = useMemo(() => {
    const set = new Set<string>()
    recipes.forEach((r) => r.ingredients.forEach((ing) => set.add(ing.name.toLowerCase().trim())))
    return set
  }, [recipes])

  const suggestions = useMemo(() => {
    if (mode !== "ingredients") return []
    const cleaned = input.trim().toLowerCase()
    if (cleaned.length < 2) return []
    const matches: string[] = []
    for (const known of knownIngredients) {
      if (known.includes(cleaned) && !ingredients.some((i) => i.toLowerCase() === known)) {
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
      setIngredients((prev) => [...prev, value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()])
      setInput("")
      setError(null)
    },
    [input, ingredients, knownIngredients, t]
  )

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index))
  }

  const switchMode = (newMode: Mode) => {
    if (newMode === mode) return
    searchIdRef.current += 1
    setMode(newMode)
    setResults(null)
    setError(null)
    setUsedFallback(false)
    setLoading(false)
  }

  const runLocalSearch = () => {
    const localResults = searchByIngredients(recipes, ingredients, isFr)
    setResults(localResults.map((r) => ({ id: r.id, match: r.match, reason: r.reason })))
    setUsedFallback(true)
  }

  const handleSearchIngredients = async () => {
    if (ingredients.length === 0) return
    const searchId = ++searchIdRef.current
    setLoading(true)
    setResults(null)
    setError(null)
    setUsedFallback(false)

    // Hors ligne : directement la recherche locale
    if (!navigator.onLine) {
      runLocalSearch()
      setLoading(false)
      return
    }

    try {
      const aiResults = await searchIngredientsAI(recipes, ingredients, isFr)
      if (searchId !== searchIdRef.current) return
      setResults(aiResults)
    } catch (e) {
      if (searchId !== searchIdRef.current) return
      // Consentement refusé : on s'arrête sans rien afficher.
      if (!(e instanceof AiConsentError)) runLocalSearch()
    } finally {
      if (searchId === searchIdRef.current) setLoading(false)
    }
  }

  const runFreeTextSearch = async () => {
    const searchId = ++searchIdRef.current
    setLoading(true)
    setResults(null)
    setError(null)

    try {
      const aiResults = await searchFreeTextAI(recipes, freeText.trim(), isFr)
      if (searchId !== searchIdRef.current) return
      setResults(aiResults)
    } catch (e) {
      if (searchId !== searchIdRef.current || e instanceof AiConsentError) return
      setError(
        e instanceof AiHttpError && e.status === 429
          ? isFr
            ? "Trop de demandes, réessaie dans une minute"
            : "Too many requests, try again in a minute"
          : t("aiError")
      )
    } finally {
      if (searchId === searchIdRef.current) setLoading(false)
    }
  }

  const handleSearchFreeText = () => {
    freeInputRef.current?.blur()
    setFreeInputFocused(false)
    if (!freeText.trim()) return
    if (!aiAvailable || !navigator.onLine) {
      setError(t("aiFreeUnavailable"))
      return
    }
    runFreeTextSearch()
  }

  const canSearch = mode === "ingredients" ? ingredients.length > 0 : freeText.trim().length > 0
  const handleSearch = mode === "ingredients" ? handleSearchIngredients : handleSearchFreeText
  const searchEnabled = canSearch && !loading && (mode === "ingredients" || aiAvailable)

  const matchedRecipes = useMemo(() => {
    if (!results) return []
    return results
      .map((r) => {
        const recipe = recipes.find((rec) => rec.id === r.id)
        if (!recipe) return null
        const missing = mode === "ingredients" ? getMissingIngredients(recipe, ingredients) : []
        return { recipe, match: r.match, reason: r.reason, missing }
      })
      .filter(Boolean) as { recipe: Recipe; match: number; reason: string; missing: string[] }[]
  }, [results, recipes, mode, ingredients])

  // Le champ libre se replie quand il y a des résultats ; on le rouvre au clic sur « modifier ».
  // Contrairement au mobile, il ne se replie pas à la perte du focus mais au lancement de la
  // recherche : replié au mousedown, il décalait la page sous le pointeur et le clic sur
  // « Rechercher » ou sur une recette n'aboutissait pas.
  const collapsed = mode === "free" && !freeInputFocused && !!results && results.length > 0
  useEffect(() => {
    if (freeInputFocused) freeInputRef.current?.focus()
  }, [freeInputFocused])

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
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#A855F7]/10 dark:bg-[#A855F7]/15"
        >
          <Sparkles className="size-[18px] fill-[#A855F7]/20 text-[#A855F7]" />
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
          onClick={() => switchMode("ingredients")}
          aria-pressed={mode === "ingredients"}
          className={cn(
            "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full py-2.5 text-[13px] transition-colors",
            mode === "ingredients"
              ? "bg-white font-bold text-primary shadow-sm dark:bg-dark-surface"
              : "font-medium text-muted hover:text-foreground dark:text-dark-muted dark:hover:text-white",
            focusRingPrimary
          )}
        >
          <Carrot className="size-[15px]" />
          {t("aiModeIngredients")}
        </button>
        <button
          type="button"
          onClick={() => switchMode("free")}
          aria-pressed={mode === "free"}
          className={cn(
            "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full py-2.5 text-[13px] transition-colors",
            mode === "free"
              ? "bg-white font-bold text-[#A855F7] shadow-sm dark:bg-dark-surface"
              : "font-medium text-muted hover:text-foreground dark:text-dark-muted dark:hover:text-white",
            focusRing
          )}
        >
          <MessageCircle className="size-[15px]" />
          {t("aiModeFree")}
        </button>
      </div>

      {/* Description */}
      <p className="text-sm leading-5 text-muted dark:text-dark-muted">
        {mode === "ingredients" ? t("aiDescription") : t("aiFreeDescription")}
      </p>

      {/* ── Ingredients mode ── */}
      {mode === "ingredients" && (
        <>
          <div className="space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                addIngredient()
              }}
              className="flex items-center rounded-[20px] bg-surface pr-1 pl-4 ring-primary/30 transition-shadow focus-within:ring-2 dark:bg-dark-surface"
            >
              <Carrot aria-hidden className="size-[18px] shrink-0 text-muted dark:text-dark-muted" />
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
                      "flex cursor-pointer items-center gap-1 rounded-2xl bg-[#A855F7]/8 px-3 py-1.5 text-[13px] font-medium text-[#A855F7] transition-colors hover:bg-[#A855F7]/15 dark:bg-[#A855F7]/12 dark:hover:bg-[#A855F7]/20",
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
                    <span className="text-sm font-medium text-primary">{ing}</span>
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
      )}

      {/* ── Free text mode ── */}
      {mode === "free" && (
        <>
          {!aiAvailable && (
            <div className="flex items-center gap-2.5 rounded-[20px] border border-[#EF4444]/12 bg-[#EF4444]/6 p-4 dark:border-[#EF4444]/20 dark:bg-[#EF4444]/10">
              <CloudOff className="size-5 shrink-0 text-[#EF4444]" />
              <p className="flex-1 text-[13px] leading-[18px] text-muted dark:text-dark-muted">{t("aiFreeUnavailable")}</p>
            </div>
          )}
          {collapsed ? (
            <button
              type="button"
              onClick={() => setFreeInputFocused(true)}
              aria-label={isFr ? `Modifier la recherche : ${freeText}` : `Edit search: ${freeText}`}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2 rounded-[20px] bg-surface p-3 text-left transition-colors hover:bg-foreground/5 dark:bg-dark-surface dark:hover:bg-white/5",
                !aiAvailable && "opacity-50",
                focusRing
              )}
            >
              <MessageCircle className="size-4 shrink-0 text-muted dark:text-dark-muted" />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground dark:text-white">{freeText}</span>
              <SquarePen className="size-4 shrink-0 text-primary" />
            </button>
          ) : (
            <div
              className={cn(
                "rounded-[20px] bg-surface p-4 ring-[#A855F7]/40 transition-shadow focus-within:ring-2 dark:bg-dark-surface",
                !aiAvailable && "opacity-50"
              )}
            >
              <textarea
                ref={freeInputRef}
                value={freeText}
                onChange={(e) => {
                  setFreeText(e.target.value)
                  setError(null)
                }}
                onFocus={() => setFreeInputFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault()
                    if (searchEnabled) handleSearchFreeText()
                  }
                }}
                placeholder={t("aiFreePlaceholder")}
                aria-label={t("aiFreePlaceholder")}
                disabled={!aiAvailable}
                rows={4}
                enterKeyHint="search"
                className="block min-h-[100px] w-full resize-none bg-transparent text-base leading-6 text-foreground outline-none placeholder:text-muted disabled:cursor-not-allowed dark:text-white dark:placeholder:text-dark-muted"
              />
            </div>
          )}
        </>
      )}

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
        disabled={!canSearch || loading || (mode === "free" && !aiAvailable)}
        aria-busy={loading}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-[20px] py-4 text-base font-bold transition-colors",
          loading
            ? "cursor-wait bg-[#A855F7]/80 text-white"
            : searchEnabled
              ? "cursor-pointer bg-[#A855F7] text-white hover:bg-[#9333EA]"
              : "cursor-not-allowed bg-surface text-muted dark:bg-dark-surface dark:text-dark-muted",
          focusRing
        )}
      >
        {loading ? (
          <Loader2 className="size-[18px] animate-spin" />
        ) : mode === "free" ? (
          <Sparkles className="size-[18px]" />
        ) : (
          <Search className="size-[18px]" />
        )}
        {loading ? t("aiSearching") : t("aiSearch")}
      </button>

      {/* Fallback notice */}
      {usedFallback && results && results.length > 0 && (
        <div className="flex items-center gap-2 rounded-2xl bg-[#F59E42]/8 px-3.5 py-2.5 dark:bg-[#F59E42]/10">
          <Info className="size-4 shrink-0 text-[#F59E42]" />
          <p className="flex-1 text-xs text-muted dark:text-dark-muted">{t("aiFallback")}</p>
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
                    <span className={cn("shrink-0 rounded-xl px-2 py-[3px] text-xs font-bold", matchPillClass(match))}>
                      {match}%
                    </span>
                    <p className="line-clamp-2 flex-1 pt-[3px] text-xs text-muted dark:text-dark-muted">{reason}</p>
                  </div>
                  {mode === "ingredients" && missing.length > 0 && (
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
      {results && matchedRecipes.length === 0 && !loading && (
        <div role="status" className="flex flex-col items-center gap-3 py-10 text-center">
          <Search className="size-12 text-muted dark:text-dark-muted" strokeWidth={1.5} />
          <p className="text-base font-semibold text-muted dark:text-dark-muted">{t("aiNoResults")}</p>
          <p className="text-sm text-muted dark:text-dark-muted">{t("aiNoResultsHint")}</p>
        </div>
      )}
    </div>
  )
}
