"use client"

import Link from "next/link"
import { Shuffle } from "lucide-react"
import { RecipeImage } from "@/components/recipe-image"
import type { Recipe } from "@/types/recipe"

/** Un repas du plan : ouvre la recette, bouton pour l'échanger (comme MealCard du mobile). */
export function MealCard({
  recipe,
  label,
  href,
  swapLabel,
  onSwap,
}: {
  recipe: Recipe | undefined
  label: string
  href: string
  swapLabel: string
  onSwap: () => void
}) {
  if (!recipe) return null

  return (
    <div className="group flex overflow-hidden rounded-2xl border border-foreground/5 bg-surface transition-shadow hover:shadow-md hover:shadow-foreground/5 dark:border-white/5 dark:bg-dark-surface dark:hover:shadow-black/30">
      <Link
        key={recipe.id}
        href={href}
        className="flex min-w-0 flex-1 animate-in items-center fade-in-0 duration-300 outline-none focus-visible:bg-primary/5"
      >
        <div className="relative size-20 shrink-0 overflow-hidden">
          <RecipeImage
            recipeId={recipe.id}
            category={recipe.category}
            alt={recipe.name}
            fill
            className="h-full w-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 flex-1 px-3 py-2">
          <p className="truncate text-[10px] font-semibold tracking-wide text-primary uppercase">{label}</p>
          <p className="mt-0.5 truncate text-sm font-bold text-foreground dark:text-white">{recipe.name}</p>
          <p className="mt-0.5 truncate text-[11px] text-muted dark:text-dark-muted">
            {recipe.region} · {recipe.duration} min
          </p>
        </div>
      </Link>
      <button
        type="button"
        onClick={onSwap}
        aria-label={`${swapLabel} — ${recipe.name}`}
        title={swapLabel}
        className="flex w-12 shrink-0 cursor-pointer items-center justify-center text-muted transition-colors outline-none hover:bg-primary/5 hover:text-primary focus-visible:bg-primary/10 focus-visible:text-primary active:scale-95 dark:text-dark-muted dark:hover:text-primary"
      >
        <Shuffle className="size-[18px]" />
      </button>
    </div>
  )
}
