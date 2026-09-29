"use client"

/**
 * Reconnaissance vocale pour TchopAI Live, équivalent web de
 * tchope/hooks/useSpeechRecognition.ts (expo-speech-recognition) :
 * Web Speech API (`SpeechRecognition` ou `webkitSpeechRecognition`), écoute
 * continue avec résultats intermédiaires, chaque fin de phrase (résultat final)
 * est transmise à `onResult`.
 *
 * Différences imposées par le web :
 * - `stopListening()` renvoie une promesse résolue quand le navigateur a livré
 *   ses derniers résultats (événement `end`), pour ne pas perdre la fin de la
 *   phrase au relâchement du micro. Le texte encore « intermédiaire » à ce
 *   moment compte comme final.
 * - Le navigateur coupe parfois l'écoute tout seul (silence, limite de durée) :
 *   on relance tant que l'utilisateur tient le micro.
 * - Pas d'événement de volume : sur ordinateur on mesure le micro avec un
 *   AnalyserNode ; sur téléphone (deux captures du micro en même temps
 *   perturbent la reconnaissance) le niveau suit l'arrivée des résultats.
 */

import { useCallback, useEffect, useRef, useState } from "react"

export type SpeechLang = "fr-FR" | "en-US"

type SpeechState = "inactive" | "listening" | "error"

/** Erreurs qui arrêtent l'écoute (les silences et annulations sont ignorés). */
export type SpeechErrorCode =
  | "not-allowed"
  | "audio-capture"
  | "network"
  | "language-not-supported"
  | "unknown"

// Types minimaux de la Web Speech API (absents de lib.dom).
type WebSpeechAlternative = { transcript: string; confidence: number }
type WebSpeechResult = {
  readonly isFinal: boolean
  readonly length: number
  [index: number]: WebSpeechAlternative
}
type WebSpeechResultList = { readonly length: number; [index: number]: WebSpeechResult }
type WebSpeechResultEvent = Event & {
  readonly resultIndex: number
  readonly results: WebSpeechResultList
}
type WebSpeechErrorEvent = Event & { readonly error: string; readonly message?: string }

type WebSpeechRecognition = EventTarget & {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onstart: ((ev: Event) => void) | null
  onresult: ((ev: WebSpeechResultEvent) => void) | null
  onerror: ((ev: WebSpeechErrorEvent) => void) | null
  onend: ((ev: Event) => void) | null
  start(): void
  stop(): void
  abort(): void
}

type WebSpeechRecognitionCtor = new () => WebSpeechRecognition

function getRecognitionCtor(): WebSpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as {
    SpeechRecognition?: WebSpeechRecognitionCtor
    webkitSpeechRecognition?: WebSpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/** Le navigateur sait-il faire de la reconnaissance vocale ? (client seulement) */
export function isSpeechRecognitionAvailable(): boolean {
  return getRecognitionCtor() !== null
}

/** Téléphone ou tablette (iPadOS se présente comme un Mac tactile). */
export function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  return (
    /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
    (ua.includes("Macintosh") && navigator.maxTouchPoints > 1)
  )
}

function isAndroid(): boolean {
  return typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent)
}

/** État de la permission micro, sans rien demander. */
export async function queryMicrophonePermission(): Promise<PermissionState | "unknown"> {
  try {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return "unknown"
    const status = await navigator.permissions.query({ name: "microphone" as PermissionName })
    return status.state
  } catch {
    return "unknown"
  }
}

function mapError(code: string): SpeechErrorCode {
  if (code === "not-allowed" || code === "service-not-allowed") return "not-allowed"
  if (code === "audio-capture") return "audio-capture"
  if (code === "network") return "network"
  if (code === "language-not-supported") return "language-not-supported"
  return "unknown"
}

function detach(rec: WebSpeechRecognition) {
  rec.onstart = null
  rec.onresult = null
  rec.onerror = null
  rec.onend = null
}

function joinText(a: string, b: string): string {
  return `${a} ${b}`.trim()
}

type Meter = {
  token: number
  interval: ReturnType<typeof setInterval> | null
  stream: MediaStream | null
  ctx: AudioContext | null
  analyser: AnalyserNode | null
  data: Float32Array<ArrayBuffer> | null
  /** Niveau simulé (résultats reçus), décroît tout seul. */
  activity: number
}

const MAX_AUTO_RESTARTS = 20
const STOP_TIMEOUT_MS = 1500

export function useSpeechRecognition(lang: SpeechLang) {
  const [state, setState] = useState<SpeechState>("inactive")
  const [transcript, setTranscript] = useState("")
  const [volume, setVolume] = useState(0)

  const recRef = useRef<WebSpeechRecognition | null>(null)
  const onResultRef = useRef<((text: string) => void) | null>(null)
  const onErrorRef = useRef<((code: SpeechErrorCode) => void) | null>(null)
  /** L'utilisateur tient toujours le micro : relancer si le navigateur coupe. */
  const wantedRef = useRef(false)
  const finalsRef = useRef("")
  const interimRef = useRef("")
  const restartsRef = useRef(0)
  const waitersRef = useRef<Array<() => void>>([])
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const meterRef = useRef<Meter>({
    token: 0,
    interval: null,
    stream: null,
    ctx: null,
    analyser: null,
    data: null,
    activity: 0,
  })

  // ── Niveau du micro ────────────────────────────────────────────────────────

  const stopMeter = useCallback(() => {
    const m = meterRef.current
    m.token++
    if (m.interval) clearInterval(m.interval)
    m.interval = null
    m.stream?.getTracks().forEach((track) => track.stop())
    m.stream = null
    m.ctx?.close().catch(() => {})
    m.ctx = null
    m.analyser = null
    m.data = null
    m.activity = 0
    setVolume(0)
  }, [])

  const startMeter = useCallback(() => {
    const m = meterRef.current
    if (m.interval) return
    const token = ++m.token
    m.activity = 0
    m.interval = setInterval(() => {
      let level = m.activity
      m.activity *= 0.65
      if (m.analyser && m.data) {
        m.analyser.getFloatTimeDomainData(m.data)
        let sum = 0
        for (let i = 0; i < m.data.length; i++) sum += m.data[i] * m.data[i]
        const rms = Math.sqrt(sum / m.data.length)
        const db = 20 * Math.log10(rms || 1e-8)
        level = Math.max(level, Math.min(1, Math.max(0, (db + 55) / 40)))
      }
      const rounded = Math.round(level * 20) / 20
      setVolume((prev) => (prev === rounded ? prev : rounded))
    }, 100)

    if (isMobileBrowser() || !navigator.mediaDevices?.getUserMedia) return
    navigator.mediaDevices
      .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      .then((stream) => {
        const AudioCtx =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (token !== m.token || !m.interval || !AudioCtx) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        const ctx = new AudioCtx()
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 1024
        ctx.createMediaStreamSource(stream).connect(analyser)
        ctx.resume().catch(() => {})
        m.stream = stream
        m.ctx = ctx
        m.analyser = analyser
        m.data = new Float32Array(analyser.fftSize)
      })
      .catch(() => {
        // Pas de mesure : le niveau simulé suffit.
      })
  }, [])

  // ── Résultats ──────────────────────────────────────────────────────────────

  const emitFinal = useCallback((raw: string) => {
    const text = raw.trim()
    if (!text) return
    const finals = finalsRef.current
    let added = text
    if (finals && text.toLowerCase().startsWith(finals.toLowerCase())) {
      // Chrome Android renvoie parfois toute la phrase depuis le début.
      added = text.slice(finals.length).trim()
      finalsRef.current = text
    } else if (finals && isAndroid() && finals.toLowerCase().endsWith(text.toLowerCase())) {
      // Doublon du même résultat final (Chrome Android).
      return
    } else {
      finalsRef.current = joinText(finals, text)
    }
    if (added) onResultRef.current?.(added)
  }, [])

  const resolveWaiters = useCallback(() => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current)
      stopTimerRef.current = null
    }
    const waiters = waitersRef.current
    waitersRef.current = []
    waiters.forEach((resolve) => resolve())
  }, [])

  /** Fin de session : le texte intermédiaire restant compte comme final. */
  const settle = useCallback(() => {
    if (interimRef.current) {
      emitFinal(interimRef.current)
      interimRef.current = ""
    }
    setState((s) => (s === "error" ? s : "inactive"))
    stopMeter()
    resolveWaiters()
  }, [emitFinal, stopMeter, resolveWaiters])

  const launch = useCallback((): boolean => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) return false
    const rec = new Ctor()
    rec.lang = lang
    rec.continuous = true
    rec.interimResults = true
    rec.maxAlternatives = 1

    rec.onstart = () => {
      if (recRef.current === rec) setState("listening")
    }
    rec.onresult = (event) => {
      if (recRef.current !== rec) return
      let interim = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0]?.transcript ?? ""
        if (result.isFinal) emitFinal(text)
        else interim += text
      }
      interimRef.current = interim.trim()
      meterRef.current.activity = 0.55 + Math.random() * 0.45
      const finals = finalsRef.current
      const current = interimRef.current
      // Chrome Android répète parfois le début de la phrase dans l'intermédiaire.
      setTranscript(
        finals && current.toLowerCase().startsWith(finals.toLowerCase())
          ? current
          : joinText(finals, current)
      )
    }
    rec.onerror = (event) => {
      if (recRef.current !== rec) return
      if (event.error === "no-speech" || event.error === "aborted") return
      wantedRef.current = false
      setState("error")
      onErrorRef.current?.(mapError(event.error))
    }
    rec.onend = () => {
      if (recRef.current !== rec) return
      if (wantedRef.current && restartsRef.current < MAX_AUTO_RESTARTS) {
        restartsRef.current++
        if (interimRef.current) {
          emitFinal(interimRef.current)
          interimRef.current = ""
        }
        try {
          rec.start()
          return
        } catch {
          // relance impossible : on termine la session
        }
      }
      recRef.current = null
      detach(rec)
      settle()
    }

    recRef.current = rec
    try {
      rec.start()
      return true
    } catch {
      recRef.current = null
      detach(rec)
      return false
    }
  }, [lang, emitFinal, settle])

  // ── API (mêmes noms que le hook mobile) ───────────────────────────────────

  const startListening = useCallback(
    (onResult: (text: string) => void, onError?: (code: SpeechErrorCode) => void) => {
      const previous = recRef.current
      if (previous) {
        recRef.current = null
        detach(previous)
        try {
          previous.abort()
        } catch {
          // déjà arrêtée
        }
      }
      resolveWaiters()
      onResultRef.current = onResult
      onErrorRef.current = onError ?? null
      finalsRef.current = ""
      interimRef.current = ""
      restartsRef.current = 0
      wantedRef.current = true
      setTranscript("")
      if (!launch()) {
        wantedRef.current = false
        setState("error")
        onError?.("unknown")
        return
      }
      startMeter()
    },
    [launch, startMeter, resolveWaiters]
  )

  /** Arrête l'écoute ; la promesse se résout une fois les derniers résultats reçus. */
  const stopListening = useCallback((): Promise<void> => {
    wantedRef.current = false
    const rec = recRef.current
    if (!rec) {
      settle()
      return Promise.resolve()
    }
    return new Promise<void>((resolve) => {
      waitersRef.current.push(resolve)
      if (!stopTimerRef.current) {
        stopTimerRef.current = setTimeout(() => {
          stopTimerRef.current = null
          const current = recRef.current
          recRef.current = null
          if (current) {
            detach(current)
            try {
              current.abort()
            } catch {
              // déjà arrêtée
            }
          }
          settle()
        }, STOP_TIMEOUT_MS)
      }
      try {
        rec.stop()
      } catch {
        recRef.current = null
        detach(rec)
        settle()
      }
    })
  }, [settle])

  /** Coupe tout sans rien transmettre. */
  const abortListening = useCallback(() => {
    wantedRef.current = false
    const rec = recRef.current
    recRef.current = null
    if (rec) {
      detach(rec)
      try {
        rec.abort()
      } catch {
        // déjà arrêtée
      }
    }
    interimRef.current = ""
    setState((s) => (s === "listening" ? "inactive" : s))
    stopMeter()
    resolveWaiters()
  }, [stopMeter, resolveWaiters])

  /** Demande l'accès au micro (fenêtre du navigateur). */
  const requestPermissions = useCallback(async (): Promise<{
    granted: boolean
    canAskAgain: boolean
    noMicrophone?: boolean
  }> => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return { granted: false, canAskAgain: false }
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      return { granted: true, canAskAgain: true }
    } catch (error) {
      const name = (error as DOMException | undefined)?.name
      if (name === "NotFoundError" || name === "OverconstrainedError") {
        return { granted: false, canAskAgain: false, noMicrophone: true }
      }
      const permission = await queryMicrophonePermission()
      return { granted: false, canAskAgain: permission !== "denied" }
    }
  }, [])

  const checkPermissions = useCallback(async () => {
    return (await queryMicrophonePermission()) === "granted"
  }, [])

  // Arrêt du micro en quittant la page.
  useEffect(() => {
    return () => abortListening()
  }, [abortListening])

  return {
    state,
    transcript,
    volume,
    startListening,
    stopListening,
    abortListening,
    requestPermissions,
    checkPermissions,
  }
}
