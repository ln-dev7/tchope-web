"use client"

import { useCallback, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { useNotes } from "@/stores/notes"

const subscribeNothing = () => () => {}

/**
 * `false` pendant le rendu serveur et l'hydratation, `true` ensuite.
 * Les stores zustand persistés (localStorage) n'existent que dans le navigateur :
 * on attend ce signal avant d'afficher leur contenu pour éviter les écarts d'hydratation.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false
  )
}

const subscribeNotesHydration = (callback: () => void) =>
  useNotes.persist.onFinishHydration(callback)

/** Comme `useHydrated`, mais attend aussi que les notes aient été relues depuis localStorage. */
export function useNotesHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNotesHydration,
    () => useNotes.persist.hasHydrated(),
    () => false
  )
}

/** Retour à l'écran précédent (comme `router.back()` sur mobile), sinon vers `fallback`. */
export function useGoBack(fallback: string) {
  const router = useRouter()
  return useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back()
    else router.push(fallback)
  }, [router, fallback])
}
