"use client"

import { useState, useMemo, useCallback, useSyncExternalStore } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Link2,
  Copy,
  Heart,
  Clock,
  ChefHat,
  Users,
  Lightbulb,
  Youtube,
  ChevronRight,
  Pencil,
  Share2,
  Minus,
  Plus,
  Mic,
  CirclePlay,
  Timer,
} from "lucide-react"
import { toast } from "sonner"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useLocalizedRecipes } from "@/hooks/use-localized-recipes"
import { useFavorites } from "@/stores/favorites"
import { useUserRecipes } from "@/stores/user-recipes"
import { RecipeImage } from "@/components/recipe-image"
import { StoreBanner } from "@/components/store-banner"
import { getRecipeImage } from "@/constants/images"
import {
  getRecipeVideos,
  getRecipeVideosEn,
} from "@/constants/videos"
import { scaleQuantity } from "@/lib/quantity"
import { useTimerStore } from "@/stores/timers"
import type { UserRecipe } from "@/types/recipe"

const noopSubscribe = () => () => {}
const NO_USER_RECIPES: UserRecipe[] = []

export default function RecipeDetail() {
  const params = useParams()
  const router = useRouter()
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const recipes = useLocalizedRecipes(locale)
  // Favoris et recettes créées vivent dans le localStorage : ignorés au rendu serveur et
  // à l'hydratation (sinon le cœur et les recettes perso diffèrent : erreur d'hydratation #418).
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false)
  const { isFavorite, toggleFavorite } = useFavorites()
  const { userRecipes: storedUserRecipes } = useUserRecipes()
  const userRecipes = isClient ? storedUserRecipes : NO_USER_RECIPES
  const [activeTab, setActiveTab] = useState<"ingredients" | "steps">("ingredients")
  const [servings, setServings] = useState<number | null>(null)
  // Seulement « y a-t-il un minuteur de recette ? » : pas d'abonnement à l'horloge (pas de rendu 4 fois par seconde).
  const hasRecipeTimers = useTimerStore((s) => s.recipeTimers.length > 0)
  const isTimerRunning = isClient && hasRecipeTimers

  const recipeId = params.id as string

  const recipe = useMemo(() => {
    return (
      recipes.find((r) => r.id === recipeId) ||
      userRecipes.find((r) => r.id === recipeId)
    )
  }, [recipes, userRecipes, recipeId])

  const videos = useMemo(() => {
    if (!recipeId) return null
    const fr = getRecipeVideos(recipeId)
    const en = getRecipeVideosEn(recipeId)
    return fr ?? en ?? null
  }, [recipeId])

  // Portions ajustables, quantités recalculées (comme la fiche recette mobile)
  const currentServings = servings ?? recipe?.servings ?? 1
  const portionRatio = recipe ? currentServings / recipe.servings : 1
  const scaledIngredients = useMemo(() => {
    if (!recipe) return []
    return recipe.ingredients.map((ing) => ({
      name: ing.name,
      quantity: scaleQuantity(ing.quantity, portionRatio),
    }))
  }, [recipe, portionRatio])

  const adjustServings = useCallback(
    (delta: number) => {
      setServings((prev) => Math.max(1, (prev ?? recipe?.servings ?? 1) + delta))
    },
    [recipe?.servings]
  )

  // JSON-LD
  const jsonLd = recipe
    ? {
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: recipe.name,
        description: recipe.description,
        prepTime: `PT${recipe.duration}M`,
        recipeCategory: recipe.category,
        recipeCuisine: "Cameroonian",
        recipeYield: `${recipe.servings} portions`,
        image: getRecipeImage(recipe.id, recipe.category),
        recipeIngredient: recipe.ingredients.map((i) => `${i.quantity} ${i.name}`),
        recipeInstructions: recipe.steps.map((step, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          text: step,
        })),
      }
    : null

  if (!recipe) {
    // Avant l'hydratation, une recette créée par l'utilisateur n'est pas encore lue : rien à afficher.
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted dark:text-dark-muted">
        {isClient ? (locale === "fr" ? "Recette introuvable" : "Recipe not found") : null}
      </div>
    )
  }

  const isUserCreated = userRecipes.some((r) => r.id === recipe.id)
  const fav = isClient && isFavorite(recipe.id)

  const difficultyLabel =
    recipe.difficulty === "Easy"
      ? t("easy")
      : recipe.difficulty === "Medium"
        ? t("medium")
        : t("hard")

  const difficultyColor =
    recipe.difficulty === "Easy"
      ? "bg-secondary text-white"
      : recipe.difficulty === "Medium"
        ? "bg-primary text-white"
        : "bg-red-600 text-white"

  function buildRecipeText(): string {
    const r = recipe!
    let text = `🍽️ ${r.name}\n`
    text += `📍 ${r.region} | ⏱️ ${r.duration} min | 👥 ${r.servings} pers.\n\n`
    if (r.description) text += `📝 ${r.description}\n\n`
    text += `🛒 INGRÉDIENTS\n`
    r.ingredients.forEach((ing) => {
      text += `  • ${ing.name} — ${ing.quantity}\n`
    })
    text += `\n👨‍🍳 PRÉPARATION\n`
    r.steps.forEach((step, i) => {
      text += `  ${i + 1}. ${step}\n`
    })
    if (r.tips) text += `\n💡 ASTUCE DU CHEF\n${r.tips}\n`
    if (videos && videos.length > 0) {
      text += `\n🎥 VIDÉOS\n`
      videos.forEach((v) => {
        text += `  ▶ ${v.title}\n    https://youtube.com/watch?v=${v.id}\n`
      })
    }
    text += `\n— Partagé via Tchopé 🇨🇲 by https://tchope.lndev.me`
    return text
  }

  // Partage natif (téléphone) : la recette en texte + le lien ; sinon, comme avant, copie du lien ou de la recette.
  async function handleShare() {
    const url = `${window.location.origin}/${locale}/app/recipe/${recipe!.id}`
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(isUserCreated ? { title: recipe!.name, text: buildRecipeText() } : { title: recipe!.name, text: buildRecipeText(), url })
        toast.success(locale === "fr" ? "Recette partagée" : "Recipe shared")
        return
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return
      }
    }
    if (isUserCreated) handleCopyRecipe()
    else handleCopyLink()
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/${locale}/app/recipe/${recipe!.id}`
    navigator.clipboard.writeText(url)
    toast.success(locale === "fr" ? "Lien copié !" : "Link copied!")
  }

  function handleCopyRecipe() {
    let text = `🍽️ ${recipe!.name}\n`
    text += `📍 ${recipe!.region} | ⏱️ ${recipe!.duration} min | 👥 ${recipe!.servings} pers.\n\n`
    if (recipe!.description) text += `📝 ${recipe!.description}\n\n`
    text += `🛒 INGRÉDIENTS\n`
    recipe!.ingredients.forEach((ing) => {
      text += `  • ${ing.name} — ${ing.quantity}\n`
    })
    text += `\n👨‍🍳 PRÉPARATION\n`
    recipe!.steps.forEach((step, i) => {
      text += `  ${i + 1}. ${step}\n`
    })
    if (recipe!.tips) {
      text += `\n💡 ASTUCE DU CHEF\n${recipe!.tips}\n`
    }
    text += `\n— Partagé via Tchopé 🇨🇲 by https://tchope.lndev.me`
    navigator.clipboard.writeText(text)
    toast.success(locale === "fr" ? "Recette copiée !" : "Recipe copied!")
  }

  return (
    <div className="-mx-4 -mt-6 md:-mx-6">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Hero image */}
      <div className="relative aspect-4/3 w-full overflow-hidden sm:aspect-video md:aspect-2/1 md:max-h-[400px] rounded-bl-3xl rounded-br-3xl">
        <RecipeImage
          recipeId={recipe.id}
          category={recipe.category}
          alt={recipe.name}
          fill
          imageUri={"imageUri" in recipe ? (recipe.imageUri as string) : undefined}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            aria-label={locale === "fr" ? "Retour" : "Back"}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={isUserCreated ? handleCopyRecipe : handleCopyLink}
              aria-label={isUserCreated ? (locale === "fr" ? "Copier la recette" : "Copy recipe") : (locale === "fr" ? "Copier le lien" : "Copy link")}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
            >
              {isUserCreated ? <Copy className="size-5" /> : <Link2 className="size-5" />}
            </button>
            <button
              onClick={handleShare}
              aria-label={t("share")}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
            >
              <Share2 className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-5 px-4 pt-5 pb-8 md:px-6">
        <StoreBanner />

        {/* Title & Actions */}
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-extrabold text-foreground sm:text-2xl dark:text-white">
            {recipe.name}
          </h1>
          <div className="mt-0.5 flex shrink-0 items-center gap-2">
            {isUserCreated && (
              <Link
                href={`/${locale}/app/add-recipe?edit=${recipe.id}`}
                aria-label={t("editRecipe")}
                className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
              >
                <Pencil className="size-4" />
              </Link>
            )}
            <button
              onClick={() => {
                toggleFavorite(recipe.id)
                toast.success(
                  fav
                    ? locale === "fr" ? "Retiré des favoris" : "Removed from favorites"
                    : locale === "fr" ? "Ajouté aux favoris" : "Added to favorites"
                )
              }}
              aria-label={t("favorites")}
              className="cursor-pointer"
            >
              <Heart
                className={`size-6 ${fav ? "fill-red-500 text-red-500" : "text-muted dark:text-dark-muted"}`}
              />
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="flex flex-col items-center rounded-2xl bg-surface p-3 dark:bg-dark-surface">
            <Clock className="size-5 text-primary" />
            <span className="mt-1 text-sm font-bold text-foreground dark:text-white">
              {recipe.duration} min
            </span>
            <span className="text-[10px] text-muted dark:text-dark-muted">
              {t("prepTime")}
            </span>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-surface p-3 dark:bg-dark-surface">
            <ChefHat className="size-5 text-primary" />
            <span className={`mt-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${difficultyColor}`}>
              {difficultyLabel}
            </span>
            <span className="mt-0.5 text-[10px] text-muted dark:text-dark-muted">
              {t("difficulty")}
            </span>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-surface p-3 dark:bg-dark-surface">
            <Users className="size-5 text-primary" />
            <div className="mt-1 flex items-center gap-2">
              <button
                onClick={() => adjustServings(-1)}
                disabled={currentServings <= 1}
                aria-label={locale === "fr" ? "Une portion de moins" : "One serving less"}
                className="flex size-6 cursor-pointer items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark disabled:cursor-default disabled:bg-foreground/10 disabled:text-muted dark:disabled:bg-white/10 dark:disabled:text-dark-muted"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="min-w-5 text-center text-sm font-bold text-foreground tabular-nums dark:text-white" aria-live="polite">
                {currentServings}
              </span>
              <button
                onClick={() => adjustServings(1)}
                aria-label={locale === "fr" ? "Une portion de plus" : "One serving more"}
                className="flex size-6 cursor-pointer items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <span className="text-[10px] text-muted dark:text-dark-muted">
              {t("portions")}
            </span>
          </div>
        </div>

        {/* Actions : TchopAI Live et mode cuisine (comme sur mobile) */}
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/app/live-cooking?id=${encodeURIComponent(recipe.id)}`)}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[20px] border-[1.5px] border-[#A855F7]/20 bg-[#A855F7]/[0.08] py-3.5 text-sm font-bold text-[#A855F7] transition-colors hover:bg-[#A855F7]/[0.12] dark:border-[#A855F7]/30 dark:bg-[#A855F7]/[0.12]"
          >
            <Mic className="size-[18px]" />
            {t("startLiveCooking")}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/app/cooking-mode?id=${encodeURIComponent(recipe.id)}`)}
            disabled={isTimerRunning}
            className={`flex w-full items-center justify-center gap-2 rounded-[20px] py-3.5 text-sm font-bold transition-colors ${
              isTimerRunning
                ? "cursor-default bg-surface text-muted dark:bg-dark-surface dark:text-dark-muted"
                : "cursor-pointer bg-primary text-white hover:bg-primary-dark"
            }`}
          >
            {isTimerRunning ? <Timer className="size-[18px]" /> : <CirclePlay className="size-[18px]" />}
            {isTimerRunning ? "Timer..." : t("startCooking")}
          </button>
        </div>

        {/* Video button */}
        {videos && videos.length > 0 && (
          <Link
            href={`/${locale}/app/recipe/${recipe.id}/videos`}
            className="flex cursor-pointer items-center justify-between rounded-2xl bg-red-500/10 px-4 py-3 transition-colors hover:bg-red-500/15 dark:bg-red-500/15"
          >
            <div className="flex items-center gap-3">
              <Youtube className="size-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                {t("videoRecipe")} ({videos.length})
              </span>
            </div>
            <ChevronRight className="size-4 text-red-600 dark:text-red-400" />
          </Link>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          {(["ingredients", "steps"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "bg-surface text-muted dark:bg-dark-surface dark:text-dark-muted"
              }`}
            >
              {t(tab)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "ingredients" ? (
          <div>
            <p className="mb-3 text-xs font-medium text-muted dark:text-dark-muted">
              {t("shoppingList")} — {scaledIngredients.length} {t("items")}
            </p>
            <div className="space-y-2">
              {scaledIngredients.map((ing, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 dark:bg-dark-surface"
                >
                  <span className="text-sm font-medium text-foreground dark:text-white">
                    {ing.name}
                  </span>
                  <span className="text-sm text-muted dark:text-dark-muted">
                    {ing.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {recipe.steps.map((step, i) => (
              <div key={i} className="flex gap-3 sm:gap-4">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white sm:size-8">
                  {i + 1}
                </div>
                <p className="pt-0.5 text-sm leading-relaxed text-foreground dark:text-white/90">
                  {step}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        {recipe.tips && (
          <div className="rounded-2xl bg-secondary/10 p-4 dark:bg-secondary/20">
            <div className="mb-2 flex items-center gap-2 font-bold text-secondary dark:text-green-400">
              <Lightbulb className="size-4" />
              {t("chefTips")}
            </div>
            <p className="text-sm leading-relaxed text-foreground/80 dark:text-white/70">
              {recipe.tips}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
