"use client"

import { useMemo } from "react"
import { recipes as baseRecipes } from "@/data/recipes"
import { recipesEn } from "@/data/recipes-en"
import type { Recipe } from "@/types/recipe"
import { photosFirst } from "@/constants/images"
import type { Locale } from "@/lib/i18n"

export function useLocalizedRecipes(locale: Locale): Recipe[] {
  return useMemo(() => {
    // Les plats sans photo fiable passent toujours en fin de liste.
    if (locale === "fr") return photosFirst(baseRecipes)

    return photosFirst(baseRecipes).map((recipe) => {
      const en = recipesEn[recipe.id]
      if (!en) return recipe

      return {
        ...recipe,
        name: en.name ?? recipe.name,
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
