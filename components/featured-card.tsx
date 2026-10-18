"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import { RecipeImage } from "@/components/recipe-image"
import { useFavorites } from "@/stores/favorites"
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
    <article className="app-recipe-card relative overflow-hidden rounded-3xl bg-surface dark:bg-dark-surface">
      <Link
        href={`/${locale}/app/recipe/${recipe.id}`}
        className="group block w-full cursor-pointer"
      >
        <div className="relative h-[180px] w-full overflow-hidden sm:h-[200px]">
          <RecipeImage
            recipeId={recipe.id}
            category={recipe.category}
            alt={recipe.name}
            fill
            className="transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 right-16 left-3 flex flex-wrap gap-1.5">
            {recipe.tags?.map((tag) => (
              <span
                key={tag}
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold text-white ${
                  tag === "CHEF'S CHOICE" ? "bg-secondary" : "bg-primary"
                }`}
              >
                {locale === "fr"
                  ? ({
                      "CHEF'S CHOICE": "Choix du chef",
                      "Sunday Feast": "Repas du dimanche",
                      POPULAR: "Populaire",
                      POPULAIRE: "Populaire",
                    }[tag] ?? tag)
                  : ({ POPULAIRE: "Popular", "CHEF'S CHOICE": "Chef’s choice" }[
                      tag
                    ] ?? tag)}
              </span>
            ))}
          </div>
        </div>
        <div className="p-4">
          <h3 className="app-featured-title text-foreground dark:text-white">
            {recipe.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted dark:text-dark-muted">
            {recipe.description}
          </p>
        </div>
      </Link>
      <button
        aria-label={
          locale === "fr"
            ? fav
              ? "Retirer des favoris"
              : "Ajouter aux favoris"
            : fav
              ? "Remove from favourites"
              : "Add to favourites"
        }
        aria-pressed={fav}
        onClick={() => {
          toggleFavorite(recipe.id)
          toast.success(
            locale === "fr"
              ? fav
                ? "Retiré des favoris"
                : "Ajouté aux favoris"
              : fav
                ? "Removed from favourites"
                : "Added to favourites"
          )
        }}
        className="absolute top-3 right-3 flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/90 dark:bg-dark/80"
      >
        <Heart
          className={`size-5 ${fav ? "fill-red-500 text-red-500" : "text-foreground/60 dark:text-white/60"}`}
        />
      </button>
    </article>
  )
}
