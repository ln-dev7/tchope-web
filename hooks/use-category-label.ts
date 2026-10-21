"use client"

import { useCallback } from "react"
import { translations } from "@/constants/translations"
import { CATEGORY_KEYS } from "@/constants/categories"
import { useLocale } from "@/lib/locale-context"
import type { Category } from "@/types/recipe"

/** Libellé traduit de la catégorie d'un plat (Plat, Sauce, Grillade…). */
export function useCategoryLabel() {
  const { locale } = useLocale()
  return useCallback(
    (category: Category) => translations[locale][CATEGORY_KEYS[category]],
    [locale]
  )
}
