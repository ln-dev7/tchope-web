"use client"

import { useSyncExternalStore } from "react"

/**
 * Horloge partagée des minuteurs : un seul intervalle pour toute l'app, qui ne
 * tourne que tant qu'un composant en a besoin (minuteur en cours affiché).
 * Les minuteurs stockent une heure de fin : l'horloge sert seulement à
 * rafraîchir l'affichage, le temps restant reste juste même si l'onglet a
 * été ralenti en arrière-plan.
 */

const TICK_MS = 250

let current = typeof window === "undefined" ? 0 : Date.now()
let intervalId: ReturnType<typeof setInterval> | null = null
const listeners = new Set<() => void>()

function emit() {
  current = Date.now()
  listeners.forEach((listener) => listener())
}

function subscribeClock(listener: () => void) {
  listeners.add(listener)
  if (intervalId === null) {
    intervalId = setInterval(emit, TICK_MS)
    document.addEventListener("visibilitychange", emit)
  }
  // Valeur fraîche immédiatement (l'horloge était peut-être arrêtée).
  queueMicrotask(emit)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
      document.removeEventListener("visibilitychange", emit)
    }
  }
}

function subscribeIdle() {
  return () => {}
}

function getClock() {
  return current
}

function getServerClock() {
  return 0
}

/**
 * Heure courante (ms), rafraîchie 4 fois par seconde tant que `active` est
 * vrai. Vaut 0 pendant le rendu serveur.
 */
export function useNow(active: boolean): number {
  return useSyncExternalStore(active ? subscribeClock : subscribeIdle, getClock, getServerClock)
}

function subscribeNothing() {
  return () => {}
}

/**
 * `false` pendant le rendu serveur et l'hydratation, `true` ensuite : évite
 * les écarts d'hydratation avec les données lues dans localStorage.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false
  )
}
