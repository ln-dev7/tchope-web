"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Share2,
  Heart,
  Clock,
  ChefHat,
  Users,
  Lightbulb,
  Youtube,
} from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useLocalizedRecipes } from "@/hooks/use-localized-recipes"
import { useFavorites } from "@/hooks/use-favorites"
import { useUserRecipes } from "@/hooks/use-user-recipes"
import { RecipeImage } from "@/components/recipe-image"
import { getRecipeImage } from "@/constants/images"
import {
  getRecipeVideos,
  getRecipeVideosEn,
} from "@/constants/videos"

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const recipes = useLocalizedRecipes(locale)
  const { isFavorite, toggleFavorite } = useFavorites()
  const { userRecipes } = useUserRecipes()
  const [activeTab, setActiveTab] = useState<"ingredients" | "steps">(
    "ingredients"
  )

  const recipeId = params.id as string

  const recipe = useMemo(() => {
    return (
      recipes.find((r) => r.id === recipeId) ||
      userRecipes.find((r) => r.id === recipeId)
    )
  }, [recipes, userRecipes, recipeId])

  const videos = useMemo(() => {
    if (!recipeId) return null
    return locale === "fr"
      ? getRecipeVideos(recipeId)
      : getRecipeVideosEn(recipeId) || getRecipeVideos(recipeId)
  }, [recipeId, locale])

  if (!recipe) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted dark:text-dark-muted">
        Recipe not found
      </div>
    )
  }

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.name,
    description: recipe.description,
    prepTime: `PT${recipe.duration}M`,
    recipeCategory: recipe.category,
    recipeCuisine: "Cameroonian",
    recipeYield: `${recipe.servings} portions`,
    image: getRecipeImage(recipe.id, recipe.category),
    recipeIngredient: recipe.ingredients.map(
      (i) => `${i.quantity} ${i.name}`
    ),
    recipeInstructions: recipe.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: step,
    })),
  }

  const fav = isFavorite(recipe.id)

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

  async function handleShare() {
    const text = `${recipe!.name}\n\n${recipe!.ingredients.map((i) => `• ${i.quantity} ${i.name}`).join("\n")}\n\n${recipe!.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`
    if (navigator.share) {
      await navigator.share({ title: recipe!.name, text })
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  return (
    <div className="-mx-4 -mt-6 md:-mx-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero image */}
      <div className="relative h-[300px] w-full overflow-hidden md:h-[350px]">
        <RecipeImage
          recipeId={recipe.id}
          category={recipe.category}
          alt={recipe.name}
          fill
          imageUri={
            "imageUri" in recipe ? (recipe.imageUri as string) : undefined
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Back & Share */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex size-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
          >
            <ArrowLeft className="size-5" />
          </button>
          <button
            onClick={handleShare}
            className="flex size-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
          >
            <Share2 className="size-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="-mt-8 rounded-t-3xl bg-background px-5 pt-6 pb-8 dark:bg-dark">
        {/* Title & Favorite */}
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-foreground dark:text-white">
            {recipe.name}
          </h1>
          <button
            onClick={() => toggleFavorite(recipe.id)}
            className="mt-1 shrink-0"
          >
            <Heart
              className={`size-6 ${fav ? "fill-red-500 text-red-500" : "text-muted dark:text-dark-muted"}`}
            />
          </button>
        </div>

        {/* Meta */}
        <div className="mt-4 grid grid-cols-3 gap-3">
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
            <span
              className={`mt-1 rounded-full px-2 py-0.5 text-xs font-bold ${difficultyColor}`}
            >
              {difficultyLabel}
            </span>
            <span className="mt-0.5 text-[10px] text-muted dark:text-dark-muted">
              {t("difficulty")}
            </span>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-surface p-3 dark:bg-dark-surface">
            <Users className="size-5 text-primary" />
            <span className="mt-1 text-sm font-bold text-foreground dark:text-white">
              {recipe.servings}
            </span>
            <span className="text-[10px] text-muted dark:text-dark-muted">
              {t("portions")}
            </span>
          </div>
        </div>

        {/* Video button */}
        {videos && videos.length > 0 && (
          <a
            href={`https://www.youtube.com/watch?v=${videos[0].id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-3 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/20 dark:text-red-400"
          >
            <Youtube className="size-5" />
            {t("videoRecipe")} ({videos.length})
          </a>
        )}

        {/* Tabs */}
        <div className="mt-6 flex gap-2">
          {(["ingredients", "steps"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
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
        <div className="mt-5">
          {activeTab === "ingredients" ? (
            <div>
              <p className="mb-3 text-xs font-medium text-muted dark:text-dark-muted">
                {t("shoppingList")} — {recipe.ingredients.length} {t("items")}
              </p>
              <div className="space-y-2.5">
                {recipe.ingredients.map((ing, i) => (
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
                <div key={i} className="flex gap-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {i + 1}
                  </div>
                  <p className="pt-1 text-sm leading-relaxed text-foreground dark:text-white/90">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        {recipe.tips && (
          <div className="mt-6 rounded-2xl bg-secondary/10 p-4 dark:bg-secondary/20">
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
