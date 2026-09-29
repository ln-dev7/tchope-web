"use client"

/**
 * TchopAI Live (cuisiner avec l'IA à la voix), équivalent web de
 * tchope/hooks/useLiveCooking.ts : même prompt système, même modèle, même
 * max_tokens (256), même historique (15 messages), mêmes commandes vocales
 * d'étape. Voix : speechSynthesis ; écoute : use-speech-recognition.
 *
 * Adaptations web (voir le rapport) :
 * - la route /api/claude refuse plus de 2 photos par requête : seules les
 *   2 photos les plus récentes de l'historique sont envoyées, les plus
 *   anciennes sont remplacées par une mention texte ;
 * - un premier message « assistant » (après la coupe à 15 messages) n'est pas
 *   envoyé, l'API attendant un premier message utilisateur ;
 * - la commande d'étape est détectée une seule fois, sur la phrase complète ;
 * - possibilité de couper le son (la réponse reste affichée) ;
 * - saisie au clavier (`sendText`) quand la reconnaissance vocale manque.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import {
  AiConsentError,
  AiHttpError,
  TCHOPAI_MODEL,
  callClaudeLive,
  type MessageContent,
} from "@/lib/ai/client"
import { translations } from "@/constants/translations"
import {
  isMobileBrowser,
  useSpeechRecognition,
  type SpeechErrorCode,
} from "@/hooks/use-speech-recognition"
import type { Recipe } from "@/types/recipe"

export type LiveState = "idle" | "listening" | "thinking" | "speaking"

type Message = {
  role: "user" | "assistant"
  content: MessageContent
}

export type LiveMessage = Message

const MAX_HISTORY = 15
/** Limite de la route /api/claude (photos par requête). */
const MAX_IMAGES_PER_REQUEST = 2
const MUTE_STORAGE_KEY = "tchope_live_muted"

// Prompt système identique au mobile (tchope/hooks/useLiveCooking.ts).
function buildSystemPrompt(
  recipe: Recipe,
  currentStep: number,
  language: "fr" | "en",
): string {
  const stepsText = recipe.steps
    .map((s, i) => `${i + 1}. ${s}`)
    .join('\n');
  const ingredientsText = recipe.ingredients
    .map((ing) => `- ${ing.name}: ${ing.quantity}`)
    .join('\n');

  if (language === 'fr') {
    return `Tu es TchopAI Live, l'assistant vocal cuisine de Tchopé. Tu guides l'utilisateur en temps réel pendant la cuisine.

Recette : ${recipe.name}
Étape actuelle : ${currentStep + 1}/${recipe.steps.length} — "${recipe.steps[currentStep]}"
Ingrédients :
${ingredientsText}
Toutes les étapes :
${stepsText}
${recipe.tips ? `Astuces : ${recipe.tips}` : ''}
Portions : ${recipe.servings}

RÈGLES STRICTES :
1. Réponds en français, tutoie l'utilisateur
2. Réponds en 1-2 phrases MAX. L'utilisateur cuisine, il a pas le temps. Sois direct.
3. Ton chaleureux, direct et encourageant, comme un guide cuisine camerounais
4. Si l'utilisateur envoie une photo, analyse-la et donne un feedback précis sur ce que tu vois : cuisson, texture, couleur, quantité, etc.
5. Si l'utilisateur demande un substitut d'ingrédient, propose des alternatives camerounaises
6. Si l'utilisateur signale un problème (trop salé, brûlé, etc.), donne des solutions de rattrapage
7. Rappelle proactivement des choses importantes : "N'oublie pas de remuer régulièrement"
8. Si une question n'a rien à voir avec la cuisine, ramène poliment vers la recette
9. JAMAIS de formatage markdown, de listes à puces ou de numéros — tu PARLES, tu n'écris pas. Tes réponses seront lues à haute voix.
10. Utilise des expressions camerounaises naturellement : "c'est bon comme ça", "tu tchop ça", "c'est prêt hein"
11. INTERDIT d'utiliser des termes genrés ou familiers supposant le genre : "ma chère", "mon cher", "ma fille", "mon fils", "ma belle", "mon grand", "frère", "sœur", "frérot", "boss", "chef", "monsieur", "madame", "mademoiselle", "bro", "king", "queen". Tu ne connais PAS le genre de l'utilisateur. Dis simplement "tu" ou "toi", jamais de surnom genré.`;
  }

  return `You are TchopAI Live, the voice cooking assistant from Tchopé. You guide the user in real-time while they cook.

Recipe: ${recipe.name}
Current step: ${currentStep + 1}/${recipe.steps.length} — "${recipe.steps[currentStep]}"
Ingredients:
${ingredientsText}
All steps:
${stepsText}
${recipe.tips ? `Tips: ${recipe.tips}` : ''}
Servings: ${recipe.servings}

STRICT RULES:
1. Respond in English
2. Respond in 1-2 sentences MAX. The user is cooking, they don't have time. Be direct.
3. Warm, direct and encouraging tone, like a Cameroonian cooking guide
4. If the user sends a photo, analyze it and give precise feedback on what you see: cooking level, texture, color, quantity, etc.
5. If the user asks for an ingredient substitute, suggest Cameroonian alternatives
6. If the user reports a problem (too salty, burnt, etc.), give recovery solutions
7. Proactively remind important things: "Don't forget to stir regularly"
8. If a question has nothing to do with cooking, politely redirect to the recipe
9. NEVER use markdown formatting, bullet points or numbers — you SPEAK, you don't write. Your responses will be read aloud.
10. Use Cameroonian expressions naturally: "that's good like that", "you chop that", "it's ready oh"
11. NEVER use gendered or familiar terms that assume gender: "my dear", "sweetie", "son", "darling", "brother", "sister", "bro", "sis", "boss", "king", "queen", "sir", "ma'am", "miss", "man", "girl". You do NOT know the user's gender. Just use "you" directly, no gendered nicknames.`;
}

// ── Commandes vocales d'étape (mêmes mots-clés que le mobile) ───────────────

function detectStepCommand(text: string, currentStep: number, totalSteps: number): number | null {
  const lower = text.toLowerCase()
  // Next step
  if (
    lower.includes("étape suivante") ||
    lower.includes("next step") ||
    lower.includes("prochaine étape") ||
    lower.includes("step suivant")
  ) {
    if (currentStep < totalSteps - 1) {
      return currentStep + 1
    }
  }
  // Previous step
  if (
    lower.includes("étape précédente") ||
    lower.includes("previous step") ||
    lower.includes("step précédent") ||
    lower.includes("reviens") ||
    lower.includes("go back")
  ) {
    if (currentStep > 0) {
      return currentStep - 1
    }
  }
  // Repeat step
  if (
    lower.includes("répète") ||
    lower.includes("repeat") ||
    lower.includes("relis") ||
    lower.includes("encore")
  ) {
    return currentStep // same step triggers re-read
  }
  return null
}

// ── Requête envoyée à l'IA ──────────────────────────────────────────────────

function toRequestMessages(history: Message[], language: "fr" | "en") {
  let messages = history
  while (messages.length > 0 && messages[0].role !== "user") messages = messages.slice(1)

  let imageBudget = MAX_IMAGES_PER_REQUEST
  const out: Message[] = []
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (typeof m.content === "string") {
      out.unshift({ role: m.role, content: m.content })
      continue
    }
    const blocks = m.content.map((block) => {
      if (block.type !== "image") return block
      if (imageBudget > 0) {
        imageBudget--
        return block
      }
      return {
        type: "text" as const,
        text: language === "fr" ? "(photo envoyée plus tôt)" : "(photo sent earlier)",
      }
    })
    out.unshift({ role: m.role, content: blocks })
  }
  return out
}

function errorMessage(error: unknown, language: "fr" | "en"): string {
  const tr = translations[language]
  if (error instanceof AiHttpError) {
    if (error.status === 429 || error.status === 503) return tr.errorServerBusy
    if (error.status >= 500) return tr.errorServerUnavailable
    return tr.errorAIResponse
  }
  if (error instanceof TypeError || (typeof navigator !== "undefined" && !navigator.onLine)) {
    return tr.errorNetwork
  }
  return tr.errorAIResponse
}

// ── Voix (speechSynthesis) ──────────────────────────────────────────────────

/** Voix « gadget » de macOS/iOS, à éviter. */
const NOVELTY_VOICES =
  /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley|junior|ralph|fred|kathy)\b/i

/** Meilleure voix disponible pour la langue (naturelle/neuronale d'abord). */
export function pickVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  const prefix = lang.slice(0, 2).toLowerCase()
  const wanted = lang.toLowerCase()
  let best: SpeechSynthesisVoice | null = null
  let bestScore = -Infinity
  for (const voice of voices) {
    const voiceLang = voice.lang.replace("_", "-").toLowerCase()
    if (!voiceLang.startsWith(prefix)) continue
    let score = 0
    if (voiceLang === wanted) score += 4
    if (/natural|neural|online/i.test(voice.name)) score += 6
    if (/premium|enhanced|amélioré/i.test(voice.name)) score += 5
    if (/google/i.test(voice.name)) score += 4
    if (voice.default) score += 1
    if (NOVELTY_VOICES.test(voice.name)) score -= 10
    if (score > bestScore) {
      best = voice
      bestScore = score
    }
  }
  return best
}

let speechPrimed = false

/**
 * À appeler dans un geste de l'utilisateur (bouton « Commencer ») : iOS
 * n'autorise ensuite la synthèse vocale hors geste qu'une fois débloquée.
 */
export function primeSpeechSynthesis() {
  if (speechPrimed || typeof window === "undefined" || !window.speechSynthesis) return
  try {
    const utterance = new SpeechSynthesisUtterance(" ")
    utterance.volume = 0
    window.speechSynthesis.speak(utterance)
    speechPrimed = true
  } catch {
    // synthèse indisponible
  }
}

function readMuted(): boolean {
  try {
    return typeof window !== "undefined" && localStorage.getItem(MUTE_STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

// ── Connexion (équivalent de useNetworkStatus) ──────────────────────────────

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback)
  window.addEventListener("offline", callback)
  return () => {
    window.removeEventListener("online", callback)
    window.removeEventListener("offline", callback)
  }
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true
  )
}

// ── Hook ────────────────────────────────────────────────────────────────────

type Options = {
  /** Erreur de reconnaissance vocale (micro refusé, absent, réseau…). */
  onSpeechError?: (code: SpeechErrorCode) => void
}

export function useLiveCooking(
  recipe: Recipe,
  initialStep: number,
  language: "fr" | "en",
  options: Options = {}
) {
  const [liveState, setLiveState] = useState<LiveState>("idle")
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [subtitle, setSubtitle] = useState("")
  const [history, setHistory] = useState<Message[]>([])
  const [isMuted, setIsMuted] = useState(readMuted)

  const historyRef = useRef<Message[]>([])
  const stepRef = useRef(initialStep)
  const isSpeakingRef = useRef(false)
  const mutedRef = useRef(isMuted)
  const stopSpeechRef = useRef<((how: "stopped" | "keep") => void) | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const mountedRef = useRef(true)
  const onSpeechErrorRef = useRef(options.onSpeechError)

  const isConnected = useOnlineStatus()
  const lang = language === "fr" ? "fr-FR" : "en-US"
  const speech = useSpeechRecognition(lang)
  const {
    startListening: startRecognition,
    stopListening: stopRecognition,
    abortListening,
    requestPermissions,
    checkPermissions,
  } = speech

  useEffect(() => {
    onSpeechErrorRef.current = options.onSpeechError
  }, [options.onSpeechError])

  // Liste des voix (chargée de façon asynchrone par Chrome).
  useEffect(() => {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined
    if (!synth) return
    const load = () => {
      voicesRef.current = synth.getVoices()
    }
    load()
    synth.addEventListener?.("voiceschanged", load)
    return () => synth.removeEventListener?.("voiceschanged", load)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      // Termine la lecture en cours : sinon une lecture différée (speak() lancé
      // 60 ms après cancel()) partirait après la sortie de la page.
      stopSpeechRef.current?.("stopped")
      stopSpeechRef.current = null
      try {
        window.speechSynthesis?.cancel()
      } catch {
        // rien à arrêter
      }
      abortListening()
    }
  }, [abortListening])

  const speakResponse = useCallback(
    (text: string) => {
      return new Promise<void>((resolve) => {
        const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined
        if (mutedRef.current || !synth || typeof SpeechSynthesisUtterance === "undefined") {
          // Son coupé (ou pas de synthèse) : la réponse reste affichée.
          setSubtitle(text)
          setLiveState("idle")
          resolve()
          return
        }

        // Jamais d'écoute pendant que TchopAI parle (il s'entendrait lui-même).
        abortListening()
        stopSpeechRef.current?.("stopped")

        isSpeakingRef.current = true
        setLiveState("speaking")
        setSubtitle(text)

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = lang
        utterance.rate = 0.95
        const voice = pickVoice(voicesRef.current.length ? voicesRef.current : synth.getVoices(), lang)
        if (voice) utterance.voice = voice
        // Garder une référence : Chrome perd parfois `onend` si l'objet est collecté.
        utteranceRef.current = utterance

        let settled = false
        let watchdog: ReturnType<typeof setTimeout> | null = null
        let keepAlive: ReturnType<typeof setInterval> | null = null

        /** done = fin normale ; stopped = coupé par une nouvelle action ;
         *  keep = son coupé ou lecture impossible : la réponse reste affichée. */
        const finish = (how: "done" | "stopped" | "keep") => {
          if (settled) return
          settled = true
          if (watchdog) clearTimeout(watchdog)
          if (keepAlive) clearInterval(keepAlive)
          if (stopSpeechRef.current === stop) stopSpeechRef.current = null
          if (utteranceRef.current === utterance) utteranceRef.current = null
          isSpeakingRef.current = false
          if (mountedRef.current) {
            if (how === "keep") {
              setLiveState("idle")
            } else {
              setSubtitle("")
              if (how === "done") setLiveState("idle")
            }
          }
          resolve()
        }
        const stop = (how: "stopped" | "keep") => finish(how)
        stopSpeechRef.current = stop

        utterance.onend = () => finish("done")
        utterance.onerror = (event) =>
          finish(event.error === "interrupted" || event.error === "canceled" ? "done" : "keep")

        // Filet de sécurité si le navigateur ne signale jamais la fin.
        watchdog = setTimeout(() => {
          synth.cancel()
          finish("keep")
        }, 8000 + text.length * 120)

        const speak = () => {
          if (settled) return
          synth.speak(utterance)
          // Chrome sur ordinateur interrompt les longues lectures (~15 s).
          if (!isMobileBrowser() && /Chrome\//.test(navigator.userAgent)) {
            keepAlive = setInterval(() => {
              if (synth.speaking && !synth.paused) {
                synth.pause()
                synth.resume()
              }
            }, 10000)
          }
        }

        if (synth.speaking || synth.pending) {
          synth.cancel()
          // Chrome ignore parfois un speak() lancé juste après cancel().
          setTimeout(speak, 60)
        } else {
          speak()
        }
      })
    },
    [lang, abortListening]
  )

  const interruptSpeaking = useCallback(() => {
    if (isSpeakingRef.current) {
      stopSpeechRef.current?.("stopped")
      window.speechSynthesis?.cancel()
      isSpeakingRef.current = false
    }
  }, [])

  const setMuted = useCallback((muted: boolean) => {
    mutedRef.current = muted
    setIsMuted(muted)
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, muted ? "1" : "0")
    } catch {
      // préférence non enregistrée
    }
    if (muted && isSpeakingRef.current) {
      stopSpeechRef.current?.("keep")
      window.speechSynthesis?.cancel()
      isSpeakingRef.current = false
    }
  }, [])

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < recipe.steps.length) {
        stepRef.current = step
        setCurrentStep(step)
      }
    },
    [recipe.steps.length]
  )

  // Store latest photo so user can talk about it after taking it
  const pendingPhotoRef = useRef<string | null>(null)

  const sendToAI = useCallback(
    async (userContent: MessageContent, promptStep: number) => {
      setLiveState("thinking")
      setSubtitle("")

      const userMessage: Message = { role: "user", content: userContent }
      historyRef.current.push(userMessage)

      // Trim history
      if (historyRef.current.length > MAX_HISTORY) {
        historyRef.current = historyRef.current.slice(-MAX_HISTORY)
      }
      setHistory([...historyRef.current])

      const systemPrompt = buildSystemPrompt(recipe, promptStep, language)

      try {
        const response = await callClaudeLive({
          model: TCHOPAI_MODEL,
          max_tokens: 256,
          system: [
            {
              type: "text",
              text: systemPrompt,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: toRequestMessages(historyRef.current, language),
        })
        if (!mountedRef.current) return
        if (!response.trim()) throw new Error("Empty response")

        const assistantMessage: Message = {
          role: "assistant",
          content: response,
        }
        historyRef.current.push(assistantMessage)
        setHistory([...historyRef.current])

        await speakResponse(response)
      } catch (error) {
        if (!mountedRef.current) return
        if (error instanceof AiConsentError) {
          // Consentement refusé : retour à l'état précédent, sans message.
          const index = historyRef.current.lastIndexOf(userMessage)
          if (index >= 0) historyRef.current.splice(index, 1)
          setHistory([...historyRef.current])
          setLiveState("idle")
          return
        }
        setSubtitle(errorMessage(error, language))
        setLiveState("idle")
      }
    },
    [recipe, language, speakResponse]
  )

  // Attach pending photo if user speaks right after taking one
  const sendWithOptionalPhoto = useCallback(
    async (userContent: string, imageBase64: string | undefined, promptStep: number) => {
      // If an image is provided directly (e.g. from live camera mode), use it
      if (imageBase64) {
        pendingPhotoRef.current = null
        await sendToAI(
          [
            { type: "text", text: userContent },
            {
              type: "image",
              source: { type: "base64", media_type: "image/jpeg", data: imageBase64 },
            },
          ],
          promptStep
        )
        return
      }

      // Otherwise, check for pending photo from manual capture
      const photo = pendingPhotoRef.current
      pendingPhotoRef.current = null
      if (photo) {
        await sendToAI(
          [
            { type: "text", text: userContent },
            {
              type: "image",
              source: { type: "base64", media_type: "image/jpeg", data: photo },
            },
          ],
          promptStep
        )
      } else {
        await sendToAI(userContent, promptStep)
      }
    },
    [sendToAI]
  )

  // Buffer: accumulate speech segments, only send when flushResult is called (on mic release)
  const pendingResultRef = useRef("")

  const handleSpeechResult = useCallback((text: string) => {
    // Accumulate segments (continuous mode sends isFinal per phrase)
    pendingResultRef.current = `${pendingResultRef.current} ${text}`.trim()
  }, [])

  const handleSpeechError = useCallback((code: SpeechErrorCode) => {
    setLiveState((s) => (s === "listening" ? "idle" : s))
    onSpeechErrorRef.current?.(code)
  }, [])

  /**
   * Envoie la phrase accumulée (+ photo du mode caméra éventuelle).
   * Renvoie false s'il n'y avait rien à envoyer.
   */
  const flushResult = useCallback(
    (imageBase64?: string | null): boolean => {
      const text = pendingResultRef.current.trim()
      pendingResultRef.current = ""

      // Page quittée pendant l'attente des derniers mots : rien à envoyer.
      if (!mountedRef.current) return false

      if (!text) {
        // No speech was captured — go back to idle
        setLiveState("idle")
        return false
      }

      // L'IA reçoit l'étape affichée au moment de la question : « étape
      // suivante » lui fait lire la suivante, que l'écran affiche aussi.
      const promptStep = stepRef.current
      const stepCmd = detectStepCommand(text, promptStep, recipe.steps.length)
      if (stepCmd !== null) goToStep(stepCmd)

      void sendWithOptionalPhoto(text, imageBase64 ?? undefined, promptStep)
      return true
    },
    [recipe.steps.length, goToStep, sendWithOptionalPhoto]
  )

  const startListening = useCallback(() => {
    if (!navigator.onLine) return
    interruptSpeaking()
    pendingResultRef.current = ""
    setLiveState("listening")
    startRecognition(handleSpeechResult, handleSpeechError)
  }, [interruptSpeaking, startRecognition, handleSpeechResult, handleSpeechError])

  /** Promesse résolue quand les derniers mots ont été reconnus. */
  const stopListening = useCallback(() => stopRecognition(), [stopRecognition])

  /** Question tapée au clavier (repli sans reconnaissance vocale). */
  const sendText = useCallback(
    (text: string, imageBase64?: string | null): boolean => {
      const clean = text.trim()
      if (!clean || !navigator.onLine) return false
      interruptSpeaking()
      pendingResultRef.current = clean
      return flushResult(imageBase64)
    },
    [interruptSpeaking, flushResult]
  )

  /** Photo prise ou choisie (bouton appareil photo), comme takePhoto sur mobile. */
  const sendPhoto = useCallback(
    async (base64: string) => {
      interruptSpeaking()

      // Store photo so next voice message includes it
      pendingPhotoRef.current = base64

      // Also send immediately with a generic prompt
      const prompt =
        language === "fr"
          ? "Regarde cette photo de ma préparation et dis-moi ce que tu en penses."
          : "Look at this photo of my preparation and tell me what you think."

      await sendToAI(
        [
          { type: "text", text: prompt },
          {
            type: "image",
            source: { type: "base64", media_type: "image/jpeg", data: base64 },
          },
        ],
        stepRef.current
      )
    },
    [language, interruptSpeaking, sendToAI]
  )

  /** Lit l'étape affichée à voix haute. */
  const speakStep = useCallback(() => {
    const step = stepRef.current
    const text = recipe.steps[step]
    if (!text) return
    interruptSpeaking()
    const label = language === "fr" ? "Étape" : "Step"
    void speakResponse(`${label} ${step + 1}. ${text}`)
  }, [recipe.steps, language, interruptSpeaking, speakResponse])

  /** Message affiché en sous-titre (erreurs photo, micro…). */
  const showMessage = useCallback((text: string) => {
    setSubtitle(text)
  }, [])

  const endSession = useCallback(() => {
    // Une phrase en attente (micro relâché juste avant) ne doit pas partir après la fin.
    pendingResultRef.current = ""
    stopSpeechRef.current?.("stopped")
    try {
      window.speechSynthesis?.cancel()
    } catch {
      // rien à arrêter
    }
    abortListening()
    historyRef.current = []
    setHistory([])
    setLiveState("idle")
    setSubtitle("")
  }, [abortListening])

  return {
    liveState,
    currentStep,
    totalSteps: recipe.steps.length,
    subtitle,
    userTranscript: liveState === "listening" ? speech.transcript : "",
    volume: speech.volume,
    isConnected,
    isMuted,
    history,
    startListening,
    stopListening,
    flushResult,
    sendText,
    sendPhoto,
    speakStep,
    showMessage,
    setMuted,
    endSession,
    goToStep,
    requestPermissions,
    checkPermissions,
  }
}
