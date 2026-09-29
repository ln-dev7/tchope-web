import type { Recipe } from "@/types/recipe"
import type { MealPlan } from "@/stores/meal-planner"

/**
 * Liste de courses tirée du plan de la semaine
 * (comme tchope/app/shopping-list.tsx et tchope/utils/shopping.ts).
 */

export type ShoppingItem = {
  name: string
  quantity: string
  recipes: string[] // noms des recettes qui utilisent cet ingrédient
}

type PlanLike = { days: Record<string, { meals: { recipeId: string }[] }> } | null

export function buildRecipeMap(recipes: Recipe[]): Record<string, Recipe> {
  const map: Record<string, Recipe> = {}
  recipes.forEach((r) => {
    map[r.id] = r
  })
  return map
}

/**
 * Regroupe les ingrédients de toutes les recettes du plan : un article par nom
 * (sans tenir compte de la casse), quantités différentes mises bout à bout,
 * recettes concernées listées, tri alphabétique.
 */
export function buildShoppingList(plan: PlanLike, recipeMap: Record<string, Recipe>): ShoppingItem[] {
  if (!plan) return []

  const items: Record<string, ShoppingItem> = {}

  Object.values(plan.days).forEach((day) => {
    day.meals.forEach((meal) => {
      const recipe = recipeMap[meal.recipeId]
      if (!recipe) return

      recipe.ingredients.forEach((ing) => {
        const key = ing.name.toLowerCase().trim()
        if (items[key]) {
          if (!items[key].recipes.includes(recipe.name)) {
            items[key].recipes.push(recipe.name)
          }
          if (ing.quantity && !items[key].quantity.includes(ing.quantity)) {
            items[key].quantity += `, ${ing.quantity}`
          }
        } else {
          items[key] = {
            name: ing.name,
            quantity: ing.quantity || "",
            recipes: [recipe.name],
          }
        }
      })
    })
  })

  return Object.values(items).sort((a, b) => a.name.localeCompare(b.name))
}

/** Nombre d'articles distincts de la liste de courses d'un plan. */
export function getShoppingItemCount(plan: MealPlan | null, recipeMap: Record<string, Recipe>): number {
  if (!plan) return 0

  const uniqueItems = new Set<string>()

  Object.values(plan.days).forEach((day) => {
    day.meals.forEach((meal) => {
      const recipe = recipeMap[meal.recipeId]
      if (!recipe) return
      recipe.ingredients.forEach((ing) => {
        uniqueItems.add(ing.name.toLowerCase().trim())
      })
    })
  })

  return uniqueItems.size
}

/** Clé d'un article coché (comme le mobile : nom en minuscules). */
export function shoppingItemKey(item: Pick<ShoppingItem, "name">): string {
  return item.name.toLowerCase()
}

/** Texte copié / partagé : seulement les articles encore à acheter. */
export function formatShoppingListText(items: ShoppingItem[], checked: ReadonlySet<string>, title: string): string {
  const lines = items
    .filter((i) => !checked.has(shoppingItemKey(i)))
    .map((i) => `${i.quantity ? `${i.quantity} — ` : ""}${i.name}`)
  return `🛒 ${title} (Tchopé)\n\n${lines.map((l) => `• ${l}`).join("\n")}`
}
