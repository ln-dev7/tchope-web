"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { RecipeImage } from "@/components/recipe-image"
import { useFavorites } from "@/hooks/use-favorites"
import type { Recipe } from "@/types/recipe"
import type { Locale } from "@/lib/i18n"

export function FeaturedCard({
  recipe,
  locale,
}: {
  recipe: Recipe
  locale: Locale
}) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const fav = isFavorite(recipe.id)

  return (
    <Link
      href={`/${locale}/app/recipe/${recipe.id}`}
      className="group block w-[280px] shrink-0 overflow-hidden rounded-2xl bg-surface shadow-sm transition-all hover:shadow-lg dark:bg-dark-surface"
    >
      <div className="relative h-[200px] w-full overflow-hidden">
        <RecipeImage
          recipeId={recipe.id}
          category={recipe.category}
          alt={recipe.name}
          fill
          className="transition-transform duration-300 group-hover:scale-105"
        />
        {/* Tags */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {recipe.tags?.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold text-white ${
                tag === "CHEF'S CHOICE"
                  ? "bg-secondary"
                  : "bg-primary"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        {/* Favorite */}
        <button
          onClick={(e) => {
            e.preventDefault()
            toggleFavorite(recipe.id)
          }}
          className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors dark:bg-dark/80"
        >
          <Heart
            className={`size-4 ${fav ? "fill-red-500 text-red-500" : "text-foreground/60 dark:text-white/60"}`}
          />
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-base font-bold text-foreground dark:text-white">
          {recipe.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted dark:text-dark-muted">
          {recipe.description}
        </p>
      </div>
    </Link>
  )
}
