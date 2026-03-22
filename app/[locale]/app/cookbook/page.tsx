"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Plus, Trash2, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useLocalizedRecipes } from "@/hooks/use-localized-recipes"
import { useFavorites } from "@/stores/favorites"
import { useUserRecipes } from "@/stores/user-recipes"
import { StoreBanner } from "@/components/store-banner"
import { RecipeCard } from "@/components/recipe-card"
import { RecipeImage } from "@/components/recipe-image"

export default function CookbookPage() {
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const recipes = useLocalizedRecipes(locale)
  const { favorites } = useFavorites()
  const { userRecipes, deleteRecipe } = useUserRecipes()
  const [tab, setTab] = useState<"favorites" | "myrecipes">("favorites")

  const favoriteRecipes = useMemo(
    () => recipes.filter((r) => favorites.includes(r.id)),
    [recipes, favorites]
  )

  return (
    <div className="space-y-5 pb-4">
      <StoreBanner />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-foreground dark:text-white">
          {t("myCookbook")}
        </h1>
        <Link
          href={`/${locale}/app/add-recipe`}
          className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-primary text-white"
        >
          <Plus className="size-5" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("favorites")}
          className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            tab === "favorites"
              ? "bg-primary text-white"
              : "bg-surface text-muted dark:bg-dark-surface dark:text-dark-muted"
          }`}
        >
          {t("favorites")} ({favoriteRecipes.length})
        </button>
        <button
          onClick={() => setTab("myrecipes")}
          className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            tab === "myrecipes"
              ? "bg-primary text-white"
              : "bg-surface text-muted dark:bg-dark-surface dark:text-dark-muted"
          }`}
        >
          {t("myRecipes")} ({userRecipes.length})
        </button>
      </div>

      {tab === "favorites" ? (
        favoriteRecipes.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {favoriteRecipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} locale={locale} />
            ))}
          </div>
        ) : (
          <EmptyState title={t("noFavorites")} subtitle={t("noFavoritesSubtitle")} />
        )
      ) : userRecipes.length > 0 ? (
        <div className="space-y-2">
          {userRecipes.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 rounded-2xl bg-surface p-3 dark:bg-dark-surface"
            >
              <Link
                href={`/${locale}/app/recipe/${r.id}`}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl sm:size-16">
                  <RecipeImage
                    recipeId={r.id}
                    category={r.category}
                    alt={r.name}
                    fill
                    imageUri={r.imageUri}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-foreground dark:text-white">
                    {r.name}
                  </h3>
                  <p className="text-xs text-muted dark:text-dark-muted">
                    {r.region} · {r.duration} min
                  </p>
                </div>
              </Link>
              <button
                onClick={() => {
                  deleteRecipe(r.id)
                  toast.success(t("recipeDeleted"))
                }}
                className="shrink-0 cursor-pointer rounded-lg p-2 text-red-500 transition-colors hover:bg-red-500/10"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title={t("noUserRecipes")} subtitle={t("noUserRecipesSubtitle")} />
      )}
    </div>
  )
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-surface dark:bg-dark-surface">
        <BookOpen className="size-7 text-muted dark:text-dark-muted" />
      </div>
      <h3 className="mt-4 text-base font-bold text-foreground dark:text-white">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted dark:text-dark-muted">{subtitle}</p>
    </div>
  )
}
