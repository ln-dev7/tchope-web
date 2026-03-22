"use client"

import { useState, useEffect, useCallback } from "react"

const FAVORITES_KEY = "tchope_favorites"

function loadFavorites(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(loadFavorites)

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }, [])

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  )

  const clearAll = useCallback(() => {
    setFavorites([])
    localStorage.removeItem(FAVORITES_KEY)
  }, [])

  return { favorites, toggleFavorite, isFavorite, clearAll }
}
