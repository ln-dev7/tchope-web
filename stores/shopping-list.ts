import { create } from "zustand"
import { persist } from "zustand/middleware"

/**
 * Articles cochés de la liste de courses (« Déjà chez moi »), gardés dans le
 * navigateur pour le plan en cours : un nouveau plan repart d'une liste vierge.
 */
type ShoppingListStore = {
  planId: string | null
  checked: string[]
  toggle: (planId: string, key: string) => void
  clearChecked: () => void
}

export const EMPTY_CHECKED: string[] = []

export const useShoppingList = create<ShoppingListStore>()(
  persist(
    (set) => ({
      planId: null,
      checked: [],
      toggle: (planId, key) =>
        set((s) => {
          const current = s.planId === planId ? s.checked : []
          return {
            planId,
            checked: current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
          }
        }),
      clearChecked: () => set({ checked: [] }),
    }),
    { name: "tchope_shopping_list_checked" }
  )
)
