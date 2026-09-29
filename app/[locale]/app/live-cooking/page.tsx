"use client"

import { Suspense, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2, SearchX } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useLocalizedRecipes } from "@/hooks/use-localized-recipes"
import { useUserRecipes } from "@/stores/user-recipes"
import { useTimerStore } from "@/stores/timers"
import { primeSpeechSynthesis } from "@/hooks/use-live-cooking"
import LiveCookingScreen from "@/components/live-cooking/live-cooking-screen"
import { LiveIntroScreen } from "@/components/live-cooking/live-intro-screen"

/**
 * TchopAI Live (équivalent de tchope/app/live-cooking.tsx) :
 * /app/live-cooking?id=<recipeId>&step=<index>. Écran plein écran (l'AppShell
 * ne met ni marges ni onglets sur cette route).
 */
export default function LiveCookingPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <LiveCookingRoute />
    </Suspense>
  )
}

const subscribeNothing = () => () => {}

/** false au rendu serveur et à l'hydratation, true ensuite. */
function useIsClient() {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false
  )
}

function FullScreenLoader() {
  return (
    <div className="flex h-full items-center justify-center bg-background dark:bg-dark">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  )
}

function LiveCookingRoute() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id") ?? ""
  const stepParam = searchParams.get("step")
  const router = useRouter()
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const isFr = locale === "fr"
  const recipes = useLocalizedRecipes(locale)
  const userRecipes = useUserRecipes((s) => s.userRecipes)
  const isClient = useIsClient()
  // Écran d'introduction (fonctionnement du mode Live) avant la session.
  const [started, setStarted] = useState(false)

  // Stop any active timer when launching Live cooking (comme sur mobile)
  useEffect(() => {
    const timers = useTimerStore.getState()
    if (timers.recipeTimers.length > 0) timers.stopAllTimers()
  }, [])

  const recipe = useMemo(
    () => recipes.find((r) => r.id === id) ?? userRecipes.find((r) => r.id === id),
    [recipes, userRecipes, id]
  )

  const initialStep = useMemo(() => {
    const parsed = stepParam ? parseInt(stepParam, 10) : 0
    const max = Math.max(0, (recipe?.steps.length ?? 1) - 1)
    return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), max) : 0
  }, [stepParam, recipe])

  const close = useCallback(() => {
    // Lien ouvert directement (pas d'historique) : retour aux recettes.
    if (window.history.length > 1) router.back()
    else router.push(`/${locale}/app`)
  }, [router, locale])

  // Les recettes de l'utilisateur sont dans le navigateur : on attend le client.
  if (!isClient) return <FullScreenLoader />

  if (!recipe) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-background px-8 text-center dark:bg-dark">
        <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-surface dark:bg-dark-surface">
          <SearchX className="size-8 text-muted dark:text-dark-muted" />
        </div>
        <h1 className="text-lg font-bold text-foreground dark:text-white">
          {isFr ? "Recette introuvable" : "Recipe not found"}
        </h1>
        <p className="max-w-xs text-sm text-muted dark:text-dark-muted">
          {isFr
            ? "Cette recette n'existe pas ou a été supprimée. Choisis une recette pour lancer TchopAI Live."
            : "This recipe doesn't exist or was deleted. Pick a recipe to start TchopAI Live."}
        </p>
        <button
          type="button"
          onClick={close}
          className="mt-3 flex cursor-pointer items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
        >
          <ArrowLeft className="size-4" />
          {isFr ? "Retour" : "Back"}
        </button>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="h-full bg-background dark:bg-dark">
        <LiveIntroScreen
          t={t}
          isFr={isFr}
          onClose={close}
          onStart={() => {
            // Geste de l'utilisateur : débloque la voix sur iOS.
            primeSpeechSynthesis()
            setStarted(true)
          }}
        />
      </div>
    )
  }

  return (
    <LiveCookingScreen
      key={recipe.id}
      recipe={recipe}
      initialStep={initialStep}
      locale={locale}
      onClose={close}
    />
  )
}
