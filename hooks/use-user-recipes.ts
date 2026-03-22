"use client"

import { useState, useEffect, useCallback } from "react"
import type { UserRecipe } from "@/types/recipe"

const USER_RECIPES_KEY = "tchope_user_recipes"

function loadRecipes(): UserRecipe[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(USER_RECIPES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useUserRecipes() {
  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>(loadRecipes)

  useEffect(() => {
    localStorage.setItem(USER_RECIPES_KEY, JSON.stringify(userRecipes))
  }, [userRecipes])

  const addRecipe = useCallback((recipe: UserRecipe) => {
    setUserRecipes((prev) => [...prev, recipe])
  }, [])

  const deleteRecipe = useCallback((id: string) => {
    setUserRecipes((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setUserRecipes([])
    localStorage.removeItem(USER_RECIPES_KEY)
  }, [])

  return { userRecipes, addRecipe, deleteRecipe, clearAll }
}
