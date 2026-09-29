"use client"

/*
 * Pont entre le client IA (non-React) et la fenêtre de consentement, comme
 * tchope/utils/aiConsentBridge.ts : AiConsentProvider enregistre un handler qui
 * affiche la fenêtre ; callClaude/callClaudeLive appellent requestAiConsent()
 * avant tout envoi. Aucune donnée ne part vers l'IA sans accord explicite.
 */

import { useAiConsentStore } from "@/stores/ai-consent"

export class AiConsentError extends Error {
  constructor() {
    super("AI consent not granted")
    this.name = "AiConsentError"
  }
}

type Handler = () => Promise<boolean>
let handler: Handler | null = null

export function setAiConsentHandler(fn: Handler | null) {
  handler = fn
}

export async function requestAiConsent(): Promise<boolean> {
  if (useAiConsentStore.getState().aiConsent) return true
  if (handler) return handler()
  return false
}
