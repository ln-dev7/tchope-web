import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserRecipe } from "@/types/recipe"

type UserRecipesStore = {
  userRecipes: UserRecipe[]
  addRecipe: (recipe: UserRecipe) => void
  deleteRecipe: (id: string) => void
  clearAll: () => void
}

export const useUserRecipes = create<UserRecipesStore>()(
  persist(
    (set) => ({
      userRecipes: [],
      addRecipe: (recipe) =>
        set((state) => ({ userRecipes: [...state.userRecipes, recipe] })),
      deleteRecipe: (id) =>
        set((state) => ({
          userRecipes: state.userRecipes.filter((r) => r.id !== id),
        })),
      clearAll: () => set({ userRecipes: [] }),
    }),
    { name: "tchope_user_recipes" }
  )
)
