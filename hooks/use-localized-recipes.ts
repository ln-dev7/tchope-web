"use client"

import { useMemo } from "react"
import { recipes as baseRecipes } from "@/data/recipes"
import { recipesEn } from "@/data/recipes-en"
import type { Recipe } from "@/types/recipe"
import type { Locale } from "@/lib/i18n"

export function useLocalizedRecipes(locale: Locale): Recipe[] {
  return useMemo(() => {
    if (locale === "fr") return baseRecipes

    return baseRecipes.map((recipe) => {
      const en = recipesEn[recipe.id]
      if (!en) return recipe

      return {
        ...recipe,
        description: en.description ?? recipe.description,
        ingredients: en.ingredients
          ? recipe.ingredients.map((ing, i) => ({
              name: en.ingredients![i]?.name ?? ing.name,
              quantity: en.ingredients![i]?.quantity ?? ing.quantity,
            }))
          : recipe.ingredients,
        steps: en.steps ?? recipe.steps,
        tips: en.tips !== undefined ? en.tips : recipe.tips,
      }
    })
  }, [locale])
}
