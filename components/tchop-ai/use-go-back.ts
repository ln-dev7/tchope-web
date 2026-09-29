"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"

/**
 * Retour à l'écran précédent (router.back() comme les autres pages), avec
 * repli sur `fallback` quand la page a été ouverte directement (pas d'historique).
 */
export function useGoBack(fallback: string) {
  const router = useRouter()
  return useCallback(() => {
    if (window.history.length > 1) router.back()
    else router.push(fallback)
  }, [router, fallback])
}
