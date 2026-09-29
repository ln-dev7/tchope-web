"use client"

import { useSyncExternalStore } from "react"

/** Connexion réseau du navigateur (équivalent de useNetworkStatus sur mobile). */
function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange)
  window.addEventListener("offline", onChange)
  return () => {
    window.removeEventListener("online", onChange)
    window.removeEventListener("offline", onChange)
  }
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true
  )
}

function noopSubscribe() {
  return () => {}
}

/**
 * Vrai une fois la page hydratée côté client. Sert à ne pas afficher de contenu
 * dépendant du localStorage (consentement IA…) pendant le rendu serveur.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
}
