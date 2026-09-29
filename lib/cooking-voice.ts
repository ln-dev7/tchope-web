"use client"

import { useEffect } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Locale } from "@/lib/i18n"

/**
 * Lecture vocale du mode cuisine (expo-speech sur mobile → speechSynthesis).
 * La préférence est gardée comme sur mobile (clé tchope_voice_reading, activée
 * par défaut).
 */

type CookingVoiceStore = {
  enabled: boolean
  setEnabled: (value: boolean) => void
}

export const useCookingVoice = create<CookingVoiceStore>()(
  persist(
    (set) => ({
      enabled: true,
      setEnabled: (value) => set({ enabled: value }),
    }),
    { name: "tchope_voice_reading" }
  )
)

export function speechSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance !== "undefined"
  )
}

/** Incrémenté à chaque lecture / arrêt : une lecture en attente des voix devient caduque. */
let generation = 0

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  const normalized = (v: SpeechSynthesisVoice) => v.lang.replace("_", "-").toLowerCase()
  const exact = voices.filter((v) => normalized(v) === lang.toLowerCase())
  const sameLanguage = voices.filter((v) => normalized(v).startsWith(lang.slice(0, 2).toLowerCase()))
  const pool = exact.length > 0 ? exact : sameLanguage
  return (
    pool.find((v) => /natural|neural|premium|enhanced/i.test(v.name)) ??
    pool.find((v) => v.localService && v.default) ??
    pool.find((v) => v.default) ??
    pool[0] ??
    null
  )
}

/** Découpe en phrases : certains navigateurs coupent les énoncés trop longs. */
function splitIntoChunks(text: string): string[] {
  // Coupe seulement après une ponctuation suivie d'un espace : « 0.5 cm » reste entier.
  const sentences = text.replace(/([.!?;])\s+/g, "$1\n").split("\n")
  const chunks: string[] = []
  let current = ""
  for (const raw of sentences) {
    const sentence = raw.trim()
    if (!sentence) continue
    if (current && (current + " " + sentence).length > 220) {
      chunks.push(current)
      current = sentence
    } else {
      current = current ? `${current} ${sentence}` : sentence
    }
  }
  if (current) chunks.push(current)
  return chunks
}

export function stopSpeaking(): void {
  generation += 1
  if (speechSupported()) window.speechSynthesis.cancel()
}

/** Lit un texte avec une voix fr-FR ou en-US selon la langue du site. */
export function speakText(text: string, locale: Locale): void {
  if (!speechSupported() || !text.trim()) return
  const synth = window.speechSynthesis
  generation += 1
  const myGeneration = generation
  synth.cancel()

  const lang = locale === "fr" ? "fr-FR" : "en-US"
  let started = false
  const run = () => {
    if (started || myGeneration !== generation) return
    started = true
    const voice = pickVoice(lang)
    for (const chunk of splitIntoChunks(text)) {
      const utterance = new SpeechSynthesisUtterance(chunk)
      utterance.lang = lang
      if (voice) utterance.voice = voice
      utterance.rate = 0.9
      synth.speak(utterance)
    }
  }

  // Chrome charge la liste des voix en différé.
  if (synth.getVoices().length > 0) {
    run()
  } else {
    const onVoices = () => {
      synth.removeEventListener("voiceschanged", onVoices)
      run()
    }
    synth.addEventListener("voiceschanged", onVoices)
    setTimeout(() => {
      synth.removeEventListener("voiceschanged", onVoices)
      run()
    }, 600)
  }
}

function hasUserActivation(): boolean {
  const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } })
    .userActivation
  // Navigateurs sans l'API : on tente directement.
  return activation ? activation.hasBeenActive : true
}

/**
 * Lit `text` à chaque changement (étape suivante…) tant que `enabled` est vrai.
 * Les navigateurs refusent de parler avant la première interaction : dans ce
 * cas la lecture part au premier clic ou à la première touche.
 */
export function useSpeakOnChange(text: string | null, enabled: boolean, locale: Locale): void {
  useEffect(() => {
    if (!enabled || !text || !speechSupported()) return

    let cancelled = false
    const speakNow = () => {
      if (!cancelled) speakText(text, locale)
    }

    const events = ["pointerdown", "keydown"] as const
    const onFirstInteraction = () => {
      events.forEach((type) => window.removeEventListener(type, onFirstInteraction, true))
      speakNow()
    }

    if (hasUserActivation()) {
      speakNow()
    } else {
      events.forEach((type) => window.addEventListener(type, onFirstInteraction, true))
    }

    return () => {
      cancelled = true
      events.forEach((type) => window.removeEventListener(type, onFirstInteraction, true))
      stopSpeaking()
    }
  }, [text, enabled, locale])
}
