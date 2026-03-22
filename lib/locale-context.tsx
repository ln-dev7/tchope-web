"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { type Dictionary, type Locale, getDictionary } from "./i18n"

type LocaleContextType = {
  locale: Locale
  t: Dictionary
  switchLocale: () => void
}

const LocaleContext = createContext<LocaleContextType | null>(null)

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const t = getDictionary(locale)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  function switchLocale() {
    const targetLocale = locale === "fr" ? "en" : "fr"
    // Replace /fr or /en at the start of the path
    const newPath = pathname.replace(`/${locale}`, `/${targetLocale}`)
    router.push(newPath)
  }

  return (
    <LocaleContext value={{ locale, t, switchLocale }}>
      {children}
    </LocaleContext>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }
  return context
}
