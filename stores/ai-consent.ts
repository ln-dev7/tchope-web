import { create } from "zustand"
import { persist } from "zustand/middleware"

/** Consentement explicite avant tout envoi vers TchopAI (Anthropic), comme settings.aiConsent sur mobile. */
type AiConsentStore = {
  aiConsent: boolean
  setAiConsent: (value: boolean) => void
}

export const useAiConsentStore = create<AiConsentStore>()(
  persist(
    (set) => ({
      aiConsent: false,
      setAiConsent: (aiConsent) => set({ aiConsent }),
    }),
    { name: "tchope_ai_consent" }
  )
)
