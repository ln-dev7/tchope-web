"use client"

import Link from "next/link"
import { Clock, MapPin } from "lucide-react"
import { RecipeImage } from "@/components/recipe-image"
import type { Recipe } from "@/types/recipe"
import type { Locale } from "@/lib/i18n"

export function RecipeCard({
  recipe,
  locale,
}: {
  recipe: Recipe
  locale: Locale
}) {
  return (
    <Link
      href={`/${locale}/app/recipe/${recipe.id}`}
      className="group flex cursor-pointer gap-4 rounded-2xl bg-surface p-3 dark:bg-dark-surface"
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl">
        <RecipeImage
          recipeId={recipe.id}
          category={recipe.category}
          alt={recipe.name}
          fill
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <h3 className="truncate text-[15px] font-semibold text-foreground dark:text-white">
          {recipe.name}
        </h3>
        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted dark:text-dark-muted">
          <MapPin className="size-3" />
          {recipe.region}
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted dark:text-dark-muted">
          <Clock className="size-3" />
          {recipe.duration} min
        </div>
      </div>
    </Link>
  )
}
