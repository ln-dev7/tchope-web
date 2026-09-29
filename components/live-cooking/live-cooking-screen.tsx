"use client"

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react"
import { toast } from "sonner"
import { Camera, CloudOff, Keyboard, Loader2, Mic, MicOff, RotateCw, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useLiveCooking } from "@/hooks/use-live-cooking"
import { isSpeechRecognitionAvailable, type SpeechErrorCode } from "@/hooks/use-speech-recognition"
import { useImageQuota } from "@/stores/image-quota"
import { imageFileToBase64Jpeg } from "@/lib/ai/client"
import type { Locale } from "@/lib/i18n"
import type { Recipe } from "@/types/recipe"

import { VoiceOrb } from "./voice-orb"
import { LiveCookingHeader } from "./live-cooking-header"
import { LiveSubtitles } from "./live-subtitles"
import { LiveCookingControls } from "./live-cooking-controls"
import { LiveStepCard } from "./live-step-card"
import { CameraPreview } from "./camera-preview"
import { LiveHistorySheet, LiveInfoDialog, PhotoCaptureDialog, PhotoSourceSheet } from "./live-dialogs"
import { cameraErrorMessage, captureVideoFrame, useCamera } from "./camera"
import { useWakeLock } from "./use-wake-lock"

type Props = {
  recipe: Recipe
  initialStep?: number
  locale: Locale
  onClose: () => void
}

type MicPermission = "checking" | "granted" | "denied_can_ask" | "denied_permanently"

/** Pourquoi on est en mode clavier (message affiché), null = choix de l'utilisateur. */
type TextReason = "insecure" | "unsupported" | "denied" | "no-mic" | null

function detectSupport() {
  if (typeof window === "undefined") return { secure: true, recognition: false }
  return { secure: window.isSecureContext, recognition: isSpeechRecognitionAvailable() }
}

function textReasonMessage(reason: Exclude<TextReason, null>, isFr: boolean): string {
  const tail = isFr
    ? "Écris ta question : TchopAI te répond à voix haute."
    : "Type your question: TchopAI answers out loud."
  switch (reason) {
    case "insecure":
      return isFr
        ? `La reconnaissance vocale et la caméra nécessitent une connexion sécurisée (https). ${tail}`
        : `Voice recognition and the camera require a secure connection (https). ${tail}`
    case "unsupported":
      return isFr
        ? `Ce navigateur ne propose pas la reconnaissance vocale (essaie Chrome, Edge ou Safari). ${tail}`
        : `This browser doesn't support voice recognition (try Chrome, Edge or Safari). ${tail}`
    case "denied":
      return isFr
        ? `Le micro est bloqué pour ce site. ${tail}`
        : `The microphone is blocked for this site. ${tail}`
    case "no-mic":
      return isFr ? `Aucun micro détecté. ${tail}` : `No microphone found. ${tail}`
  }
}

export default function LiveCookingScreen({ recipe, initialStep = 0, locale, onClose }: Props) {
  const isFr = locale === "fr"
  const { t } = useAppTranslations(locale)

  // ── Reconnaissance vocale disponible ? Sinon, repli clavier ──────────────
  const [support] = useState(detectSupport)
  const voiceSupported = support.secure && support.recognition
  const [inputMode, setInputMode] = useState<"voice" | "text">(voiceSupported ? "voice" : "text")
  const [textReason, setTextReason] = useState<TextReason>(
    !support.secure ? "insecure" : !support.recognition ? "unsupported" : null
  )
  const [permissionState, setPermissionState] = useState<MicPermission>("checking")

  const handleSpeechError = useCallback(
    (code: SpeechErrorCode) => {
      switch (code) {
        case "not-allowed":
          setPermissionState("denied_can_ask")
          setInputMode("text")
          setTextReason("denied")
          break
        case "audio-capture":
          setInputMode("text")
          setTextReason("no-mic")
          break
        case "language-not-supported":
          setInputMode("text")
          setTextReason("unsupported")
          break
        case "network":
          toast.error(
            isFr
              ? "La reconnaissance vocale n'a pas pu joindre son service. Réessaie, ou écris ta question."
              : "Voice recognition couldn't reach its service. Try again, or type your question."
          )
          break
        default:
          toast.error(
            isFr
              ? "La reconnaissance vocale a rencontré un problème. Réessaie."
              : "Voice recognition ran into a problem. Try again."
          )
      }
    },
    [isFr]
  )

  const {
    liveState,
    currentStep,
    subtitle,
    userTranscript,
    volume,
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
  } = useLiveCooking(recipe, initialStep, isFr ? "fr" : "en", { onSpeechError: handleSpeechError })

  const imageQuota = useImageQuota()
  const [showSourceSheet, setShowSourceSheet] = useState(false)
  const [showCapture, setShowCapture] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showQuotaInfo, setShowQuotaInfo] = useState(false)
  const [alert, setAlert] = useState({ open: false, title: "", message: "" })
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Live Camera mode state
  const [mode, setMode] = useState<"audio" | "camera">("audio")
  const camera = useCamera()
  const { stop: stopCamera, start: startCamera, flip: flipCamera } = camera
  const videoRef = useRef<HTMLVideoElement>(null)

  // Check permissions on mount (sans rien demander : l'utilisateur appuie sur un bouton)
  useEffect(() => {
    if (!voiceSupported) return
    let cancelled = false
    let status: PermissionStatus | null = null
    const apply = (state: PermissionState | "unknown") => {
      if (cancelled) return
      setPermissionState((current) => {
        if (state === "granted") return "granted"
        if (state === "denied") return "denied_permanently"
        return current === "checking" ? "denied_can_ask" : current
      })
    }
    const onChange = () => {
      if (status) apply(status.state)
    }
    const query = async () => {
      if (!navigator.permissions?.query) throw new Error("Permissions API unavailable")
      return navigator.permissions.query({ name: "microphone" as PermissionName })
    }
    query()
      .then((result) => {
        status = result
        apply(result.state)
        result.addEventListener("change", onChange)
      })
      .catch(() => apply("unknown"))
    return () => {
      cancelled = true
      status?.removeEventListener("change", onChange)
    }
  }, [voiceSupported])

  const handleRequestPermissions = useCallback(async () => {
    const result = await requestPermissions()
    if (result.granted) {
      setPermissionState("granted")
    } else if (result.noMicrophone) {
      setInputMode("text")
      setTextReason("no-mic")
    } else if (!result.canAskAgain) {
      setPermissionState("denied_permanently")
    }
    // If canAskAgain but not granted, stay on denied_can_ask
  }, [requestPermissions])

  const switchToKeyboard = useCallback((reason: TextReason) => {
    setInputMode("text")
    setTextReason(reason)
  }, [])

  // Switch between audio and camera mode
  const handleModeSwitch = useCallback(async () => {
    if (mode === "camera") {
      setMode("audio")
      stopCamera()
      return
    }
    // Switching to camera — check permission
    const result = await startCamera("environment")
    if (!result.ok) {
      // Demande remplacée (double clic) ou caméra arrêtée entre-temps : rien à signaler.
      if (result.error === "cancelled") return
      setAlert({
        open: true,
        title: isFr ? "Permission caméra" : "Camera permission",
        message: cameraErrorMessage(result.error, isFr, t("cameraPermissionNeeded")),
      })
      return
    }
    setMode("camera")
  }, [mode, stopCamera, startCamera, isFr, t])

  // Pause camera when the tab goes to background
  useEffect(() => {
    if (mode !== "camera") return
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        setMode("audio")
        stopCamera()
      }
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [mode, stopCamera])

  /** Image de l'aperçu caméra si le quota le permet. */
  const grabCameraFrame = useCallback((): string | null => {
    if (mode !== "camera" || !imageQuota.canSend || !videoRef.current) return null
    return captureVideoFrame(videoRef.current)
  }, [mode, imageQuota.canSend])

  /** Après envoi en mode caméra : compte la photo, ou explique pourquoi il n'y en a pas. */
  const afterCameraSend = useCallback(
    (frame: string | null) => {
      if (mode !== "camera") return
      if (frame) imageQuota.increment()
      else if (!imageQuota.canSend) toast(t("imageQuotaReached"))
      else toast(t("errorPhotoCapture"))
    },
    [mode, imageQuota, t]
  )

  // Écoute lancée par un appui, et relâchement en cours (attente des derniers mots) :
  // un nouvel appui pendant cette attente effacerait la phrase précédente.
  const micSessionRef = useRef(false)
  const releasingRef = useRef(false)

  const handleMicPress = useCallback(() => {
    if (!isConnected || releasingRef.current) return
    micSessionRef.current = true
    startListening()
  }, [isConnected, startListening])

  const handleMicRelease = useCallback(async () => {
    if (!micSessionRef.current) return
    micSessionRef.current = false
    releasingRef.current = true
    try {
      // Stop speech recognition first (buffers the result, doesn't send yet)
      const stopped = stopListening()

      // In live camera mode, capture the photo at release
      const frame = grabCameraFrame()

      // Wait for the last words, then send the buffered speech result + photo (if any)
      await stopped
      const sent = flushResult(frame)
      if (sent) afterCameraSend(frame)
    } finally {
      releasingRef.current = false
    }
  }, [stopListening, grabCameraFrame, flushResult, afterCameraSend])

  const handleSubmitText = useCallback(
    (text: string) => {
      const frame = grabCameraFrame()
      const sent = sendText(text, frame)
      if (sent) afterCameraSend(frame)
      return sent
    },
    [grabCameraFrame, sendText, afterCameraSend]
  )

  const handlePhoto = useCallback(() => {
    if (!imageQuota.canSend) {
      setAlert({ open: true, title: isFr ? "Limite atteinte" : "Limit reached", message: t("imageQuotaReached") })
      return
    }
    setShowSourceSheet(true)
  }, [imageQuota.canSend, isFr, t])

  const submitPhoto = useCallback(
    (base64: string) => {
      if (!imageQuota.canSend) {
        setAlert({ open: true, title: isFr ? "Limite atteinte" : "Limit reached", message: t("imageQuotaReached") })
        return
      }
      imageQuota.increment()
      void sendPhoto(base64)
    },
    [imageQuota, isFr, t, sendPhoto]
  )

  const handleFileChosen = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ""
      if (!file) return
      setShowCapture(false)
      try {
        submitPhoto(await imageFileToBase64Jpeg(file))
      } catch {
        showMessage(t("errorPhotoLoad"))
      }
    },
    [submitPhoto, showMessage, t]
  )

  const handleEnd = useCallback(() => {
    endSession()
    stopCamera()
    onClose()
  }, [endSession, stopCamera, onClose])

  const inSession = inputMode === "text" || permissionState === "granted"
  useWakeLock(inSession)

  // Status text
  const statusText =
    liveState === "listening"
      ? t("listening")
      : liveState === "thinking"
        ? t("thinking")
        : liveState === "speaking"
          ? t("speaking")
          : ""

  // ── Micro pas encore autorisé ─────────────────────────────────────────────
  if (!inSession) {
    if (permissionState === "checking") {
      return (
        <div className="flex h-full items-center justify-center bg-background dark:bg-dark">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      )
    }
    const isPermanentlyDenied = permissionState === "denied_permanently"
    return (
      <div className="flex h-full flex-col items-center justify-center overflow-y-auto bg-background px-8 py-10 text-center dark:bg-dark">
        <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
          <Mic className="size-10 text-primary" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-foreground dark:text-white">
          {isFr ? "Autoriser le micro" : "Allow microphone"}
        </h1>
        <p className="mb-6 max-w-sm text-sm leading-5 text-muted dark:text-dark-muted">
          {isFr
            ? "TchopAI Live a besoin du micro et de la reconnaissance vocale pour vous guider en cuisine."
            : "TchopAI Live needs microphone and speech recognition to guide you while cooking."}
        </p>

        {isPermanentlyDenied ? (
          <>
            <p className="mb-4 max-w-sm text-[13px] leading-[18px] text-muted dark:text-dark-muted">
              {isFr
                ? "Vous avez refusé les permissions. Autorisez le micro depuis l'icône à gauche de l'adresse du site, puis rechargez la page."
                : "You denied permissions. Allow the microphone from the icon next to the site address, then reload the page."}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex cursor-pointer items-center gap-2 rounded-3xl bg-primary px-7 py-3.5 text-base font-bold text-white transition-colors hover:bg-primary-dark"
            >
              <RotateCw className="size-[18px]" />
              {isFr ? "Recharger la page" : "Reload the page"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleRequestPermissions}
            className="flex cursor-pointer items-center gap-2 rounded-3xl bg-primary px-7 py-3.5 text-base font-bold text-white transition-colors hover:bg-primary-dark"
          >
            <Mic className="size-[18px]" />
            {isFr ? "Autoriser" : "Authorize"}
          </button>
        )}

        <button
          type="button"
          onClick={() => switchToKeyboard(isPermanentlyDenied ? "denied" : null)}
          className="mt-3 flex cursor-pointer items-center gap-2 rounded-3xl px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <Keyboard className="size-4" />
          {isFr ? "Écrire mes questions au clavier" : "Type my questions instead"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 cursor-pointer px-4 py-2 text-sm text-muted transition-colors hover:text-foreground dark:text-dark-muted dark:hover:text-white"
        >
          {isFr ? "Annuler" : "Cancel"}
        </button>
      </div>
    )
  }

  const isIdle = liveState === "idle"
  const lowQuota = imageQuota.remaining <= 3
  const anyDialogOpen = showHistory || showSourceSheet || showCapture || showQuotaInfo || alert.open

  return (
    <div className="h-full overflow-hidden bg-background dark:bg-dark">
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
        {/* Header */}
        <LiveCookingHeader
          recipeName={recipe.name}
          isFr={isFr}
          isMuted={isMuted}
          onBack={handleEnd}
          onHistory={() => setShowHistory(true)}
          onToggleMute={() => setMuted(!isMuted)}
        />

        {/* Offline banner */}
        {!isConnected && (
          <div className="mx-4 mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-[#E74C3C]/[0.08] px-4 py-2.5 text-[13px] font-semibold text-[#C0392B] sm:mx-5 dark:bg-[#E74C3C]/15 dark:text-[#E74C3C]">
            <CloudOff className="size-3.5 shrink-0" />
            {t("liveCookingOffline")}
          </div>
        )}

        {/* Mode clavier imposé : pourquoi */}
        {inputMode === "text" && textReason && (
          <div className="mx-4 mt-3 flex items-start gap-2.5 rounded-xl bg-primary/10 px-3.5 py-2.5 text-[13px] leading-[18px] text-foreground sm:mx-5 dark:bg-primary/15 dark:text-white">
            <MicOff className="mt-px size-4 shrink-0 text-primary" />
            <p>{textReasonMessage(textReason, isFr)}</p>
          </div>
        )}

        {/* Current step */}
        <LiveStepCard
          steps={recipe.steps}
          currentStep={currentStep}
          isFr={isFr}
          stepOfLabel={t("stepOf")}
          previousLabel={t("previousStep")}
          nextLabel={t("nextStep")}
          disabled={liveState === "thinking" || liveState === "listening"}
          onGoToStep={goToStep}
          onSpeakStep={speakStep}
        />

        {/* Quota badge + Mode switch on same line — hidden while speaking/listening */}
        <div
          className={cn(
            "flex items-center justify-center gap-2.5 px-4 pt-3 transition-opacity duration-200",
            !isIdle && "pointer-events-none invisible opacity-0"
          )}
          aria-hidden={!isIdle}
        >
          {/* Photo quota badge — tap for info */}
          <button
            type="button"
            onClick={() => setShowQuotaInfo(true)}
            className={cn(
              "flex cursor-pointer items-center gap-1 rounded-2xl border bg-[#F3F0EF] px-2.5 py-1.5 text-[13px] font-bold transition-opacity hover:opacity-80 dark:bg-dark-surface",
              lowQuota
                ? "border-[#E74C3C] text-[#E74C3C]"
                : "border-foreground/10 text-muted dark:border-white/10 dark:text-dark-muted"
            )}
            aria-label={isFr ? "Quota de photos" : "Photo quota"}
          >
            <Camera className="size-[13px]" />
            {imageQuota.remaining}/{imageQuota.limit}
          </button>

          {/* Mode switch pill */}
          <button
            type="button"
            onClick={handleModeSwitch}
            aria-pressed={mode === "camera"}
            className={cn(
              "relative flex cursor-pointer items-center gap-1.5 rounded-[20px] border px-3.5 py-2 text-[13px] font-semibold transition-colors",
              mode === "camera"
                ? "border-primary bg-primary/[0.07] text-primary dark:bg-primary/15"
                : "border-foreground/10 bg-[#F3F0EF] text-muted hover:text-foreground dark:border-white/10 dark:bg-dark-surface dark:text-dark-muted dark:hover:text-white"
            )}
          >
            <Video className={cn("size-4", mode === "camera" && "fill-current")} />
            {mode === "camera" ? t("liveCameraMode") : t("audioOnlyMode")}
            {mode === "camera" && (
              <span className="absolute -top-1.5 -right-2 rounded-md bg-primary px-1 py-px text-[8px] font-extrabold text-white">
                BETA
              </span>
            )}
          </button>

          {/* Voix ↔ clavier */}
          {voiceSupported && (
            <button
              type="button"
              onClick={() => {
                if (inputMode === "voice") switchToKeyboard(null)
                else setInputMode("voice")
              }}
              aria-label={
                inputMode === "voice"
                  ? isFr
                    ? "Écrire au clavier"
                    : "Type instead"
                  : isFr
                    ? "Parler au micro"
                    : "Speak instead"
              }
              title={
                inputMode === "voice"
                  ? isFr
                    ? "Écrire au clavier"
                    : "Type instead"
                  : isFr
                    ? "Parler au micro"
                    : "Speak instead"
              }
              className="flex size-[34px] cursor-pointer items-center justify-center rounded-full border border-foreground/10 bg-[#F3F0EF] text-muted transition-colors hover:text-foreground dark:border-white/10 dark:bg-dark-surface dark:text-dark-muted dark:hover:text-white"
            >
              {inputMode === "voice" ? <Keyboard className="size-4" /> : <Mic className="size-4" />}
            </button>
          )}
        </div>

        {/* Center area: VoiceOrb or Camera Preview */}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 py-3">
          {mode === "audio" ? (
            <>
              <VoiceOrb
                state={liveState}
                volume={volume}
                className="size-[clamp(140px,28dvh,230px)]"
              />
              <p className="h-5 text-sm font-medium text-muted dark:text-dark-muted" aria-live="polite">
                {statusText}
              </p>
            </>
          ) : (
            <>
              <div className="relative min-h-0 w-full flex-1 [container-type:size]">
                <CameraPreview
                  videoRef={videoRef}
                  stream={camera.stream}
                  mirrored={camera.facing === "user"}
                  canFlip={camera.canFlip}
                  flipLabel={t("flipCamera")}
                  onFlip={() => void flipCamera()}
                  isThinking={liveState === "thinking"}
                />
              </div>
              <p className="mx-8 text-center text-xs text-muted dark:text-dark-muted">
                {inputMode === "voice"
                  ? t("cameraCaptureHint")
                  : isFr
                    ? "L'image est capturée automatiquement quand vous envoyez votre question"
                    : "The image is captured automatically when you send your question"}
              </p>
              <p className="-mt-2 h-5 text-sm font-medium text-muted dark:text-dark-muted" aria-live="polite">
                {statusText}
              </p>
            </>
          )}
        </div>

        {/* Subtitles */}
        <div className="mb-2 flex min-h-20 flex-col justify-center">
          <LiveSubtitles subtitle={subtitle} userTranscript={userTranscript} state={liveState} />
        </div>

        {/* Controls */}
        <div className="pt-1 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <LiveCookingControls
            state={liveState}
            mode={mode}
            inputMode={inputMode}
            isFr={isFr}
            shortcutEnabled={!anyDialogOpen}
            onMicPress={handleMicPress}
            onMicRelease={handleMicRelease}
            onSubmitText={handleSubmitText}
            onPhoto={handlePhoto}
            onEnd={handleEnd}
            holdLabel={t("holdToSpeak")}
            tapToStopLabel={t("tapToStop")}
            endLabel={t("endSession")}
            photoLabel={t("takePhotoForAI")}
            placeholder={t("tchopaiPlaceholder")}
          />
        </div>
      </div>

      {/* Photo : fichiers (galerie, et appareil photo natif en repli) */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChosen}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChosen}
      />

      {/* History */}
      <LiveHistorySheet open={showHistory} onOpenChange={setShowHistory} history={history} isFr={isFr} />

      {/* Photo source picker */}
      <PhotoSourceSheet
        open={showSourceSheet}
        onOpenChange={setShowSourceSheet}
        isFr={isFr}
        onCamera={() => {
          setShowSourceSheet(false)
          setShowCapture(true)
        }}
        onGallery={() => {
          setShowSourceSheet(false)
          galleryInputRef.current?.click()
        }}
      />

      {/* In-page camera */}
      <PhotoCaptureDialog
        open={showCapture}
        onOpenChange={setShowCapture}
        isFr={isFr}
        permissionText={t("errorPhotoPermission")}
        flipLabel={t("flipCamera")}
        onCapture={(base64) => {
          setShowCapture(false)
          submitPhoto(base64)
        }}
        onPickFile={() => cameraInputRef.current?.click()}
      />

      {/* Photo quota info */}
      <LiveInfoDialog
        open={showQuotaInfo}
        onOpenChange={setShowQuotaInfo}
        icon={<Camera className="size-7 fill-current" />}
        title={isFr ? "Quota de photos" : "Photo quota"}
        message={
          isFr
            ? `Tu peux envoyer ${imageQuota.limit} photos par jour pour que TchopAI analyse ta préparation en temps réel.\n\nIl te reste ${imageQuota.remaining} photo${imageQuota.remaining > 1 ? "s" : ""} aujourd'hui. Le compteur se réinitialise automatiquement chaque jour à minuit.`
            : `You can send ${imageQuota.limit} photos per day for TchopAI to analyze your cooking in real-time.\n\nYou have ${imageQuota.remaining} photo${imageQuota.remaining > 1 ? "s" : ""} remaining today. The counter resets automatically every day at midnight.`
        }
        buttonLabel={isFr ? "Compris" : "Got it"}
      />

      {/* Alerts (permission caméra, limite atteinte) */}
      <LiveInfoDialog
        open={alert.open}
        onOpenChange={(open) => setAlert((a) => ({ ...a, open }))}
        title={alert.title}
        message={alert.message}
        buttonLabel="OK"
      />
    </div>
  )
}
