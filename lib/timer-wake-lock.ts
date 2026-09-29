"use client"

import { useEffect } from "react"

/**
 * Garde l'écran allumé tant que `enabled` est vrai (équivalent web de
 * expo-keep-awake), avec la Wake Lock API quand le navigateur la propose.
 * Le verrou est libéré automatiquement quand l'onglet passe en arrière-plan :
 * on le redemande à son retour.
 */
export function useWakeLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return

    let sentinel: WakeLockSentinel | null = null
    let cancelled = false
    // Une seule demande à la fois (montage + retour au premier plan simultanés).
    let pending = false

    const acquire = async () => {
      if (cancelled || pending || document.visibilityState !== "visible") return
      if (sentinel && !sentinel.released) return
      pending = true
      try {
        const next = await navigator.wakeLock.request("screen")
        if (cancelled) {
          next.release().catch(() => {})
          return
        }
        sentinel = next
      } catch {
        // Refusé (économie d'énergie, onglet caché, iframe…) : on ignore.
      } finally {
        pending = false
      }
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void acquire()
    }

    void acquire()
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener("visibilitychange", onVisibilityChange)
      sentinel?.release().catch(() => {})
      sentinel = null
    }
  }, [enabled])
}
