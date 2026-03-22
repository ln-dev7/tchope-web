import { create } from "zustand"
import { persist } from "zustand/middleware"

type FavoritesStore = {
  favorites: string[]
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  clearAll: () => void
}

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        })),
      isFavorite: (id) => get().favorites.includes(id),
      clearAll: () => set({ favorites: [] }),
    }),
    { name: "tchope_favorites" }
  )
)
