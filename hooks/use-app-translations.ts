"use client"

import { useCallback } from "react"
import {
  translations,
  type TranslationKey,
} from "@/constants/translations"
import type { Locale } from "@/lib/i18n"

export function useAppTranslations(locale: Locale) {
  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[locale][key]
    },
    [locale]
  )

  return { t }
}
