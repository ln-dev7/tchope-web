"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { RecipeImage } from "@/components/recipe-image"
import type { Recipe, UserRecipe } from "@/types/recipe"
import type { Locale } from "@/lib/i18n"
import { focusRingPrimary } from "./styles"

/** Recette liée sous une réponse de TchopAI (comme MiniRecipeCard sur mobile). */
export function MiniRecipeCard({ recipe, locale }: { recipe: Recipe; locale: Locale }) {
  return (
    <Link
      href={`/${locale}/app/recipe/${recipe.id}`}
      className={cn(
        "group flex cursor-pointer items-center gap-2.5 rounded-2xl border border-[#E8E5E4] bg-white p-2 transition-colors hover:border-primary/30 dark:border-[#3A3A3A] dark:bg-[#2A2A2A] dark:hover:border-primary/40",
        focusRingPrimary
      )}
    >
      <div className="relative size-12 shrink-0 overflow-hidden rounded-xl [&_span]:text-2xl">
        <RecipeImage
          recipeId={recipe.id}
          category={recipe.category}
          alt={recipe.name}
          imageUri={(recipe as Partial<UserRecipe>).imageUri}
          fill
          className="size-full transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-foreground dark:text-white">{recipe.name}</p>
        <p className="truncate text-[11px] text-muted dark:text-dark-muted">
          {recipe.region} · {recipe.duration} min
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted dark:text-dark-muted" />
    </Link>
  )
}
