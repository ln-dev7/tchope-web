"use client"

import { useCallback, useSyncExternalStore } from "react"

type PersistApi = {
  hasHydrated: () => boolean
  onFinishHydration: (fn: () => void) => () => void
}

/**
 * `true` une fois le store zustand relu depuis localStorage. Côté serveur et au
 * premier rendu d'hydratation, `false` : évite d'afficher l'écran vide puis le
 * plan (et les écarts d'hydratation React).
 */
export function useStoreHydrated(persistApi: PersistApi): boolean {
  const subscribe = useCallback((onChange: () => void) => persistApi.onFinishHydration(onChange), [persistApi])
  return useSyncExternalStore(
    subscribe,
    () => persistApi.hasHydrated(),
    () => false
  )
}
