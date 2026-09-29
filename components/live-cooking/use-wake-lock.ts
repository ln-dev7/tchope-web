"use client"

import { useEffect } from "react"

/**
 * Garde l'écran allumé pendant la session (Wake Lock API, si disponible).
 * Le verrou tombe quand l'onglet passe en arrière-plan : on le reprend au retour.
 */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || !("wakeLock" in navigator)) return
    let sentinel: WakeLockSentinel | null = null
    let cancelled = false
    // Une seule demande à la fois (montage + retour au premier plan simultanés).
    let pending = false

    const request = async () => {
      if (cancelled || pending || document.visibilityState !== "visible") return
      if (sentinel && !sentinel.released) return
      pending = true
      try {
        const lock = await navigator.wakeLock.request("screen")
        if (cancelled) {
          lock.release().catch(() => {})
          return
        }
        sentinel = lock
      } catch {
        // refusé (économie d'énergie, iframe…) : sans conséquence
      } finally {
        pending = false
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible") void request()
    }

    void request()
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      cancelled = true
      document.removeEventListener("visibilitychange", onVisibility)
      sentinel?.release().catch(() => {})
      sentinel = null
    }
  }, [enabled])
}
