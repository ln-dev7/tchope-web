"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useLocale } from "@/lib/locale-context"
import { AppOnlyPage } from "@/components/app-only"

/**
 * TchopAI Live n'est plus sur le site (17 oct. 2026) : l'ancienne adresse
 * (/app/live-cooking?id=<recipeId>) ouvre la fenêtre « dans l'app », puis revient à la recette.
 */
export default function LiveCookingPage() {
  return (
    <Suspense fallback={null}>
      <LiveCookingAppOnly />
    </Suspense>
  )
}

function LiveCookingAppOnly() {
  const { locale } = useLocale()
  const id = useSearchParams().get("id")
  const fallback = id ? `/${locale}/app/recipe/${encodeURIComponent(id)}` : `/${locale}/app`
  return <AppOnlyPage fallback={fallback} />
}
