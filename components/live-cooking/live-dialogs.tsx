"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { Dialog } from "radix-ui"
import { Camera, ImageIcon, Images, Loader2, SwitchCamera, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LiveMessage } from "@/hooks/use-live-cooking"
import { captureVideoFrame, cameraErrorMessage, useCamera } from "./camera"

const OVERLAY =
  "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"

const CLOSE_BUTTON =
  "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-foreground/5 dark:bg-dark-surface dark:text-white dark:hover:bg-white/10"

// ── Historique ──────────────────────────────────────────────────────────────

function messageText(message: LiveMessage, isFr: boolean): { text: string; hasPhoto: boolean } {
  if (typeof message.content === "string") return { text: message.content, hasPhoto: false }
  const hasPhoto = message.content.some((c) => c.type === "image")
  const textBlock = message.content.find((c) => c.type === "text")
  return {
    text: textBlock && textBlock.type === "text" ? textBlock.text : isFr ? "📷 Photo envoyée" : "📷 Photo sent",
    hasPhoto,
  }
}

export function LiveHistorySheet({
  open,
  onOpenChange,
  history,
  isFr,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  history: LiveMessage[]
  isFr: boolean
}) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: "end" })
  }, [open, history.length])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={OVERLAY} />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 flex h-[92dvh] flex-col rounded-t-3xl bg-background shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-10 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-10 sm:top-0 sm:left-auto sm:h-dvh sm:w-full sm:max-w-md sm:rounded-tr-none sm:rounded-bl-3xl sm:data-[state=open]:slide-in-from-right-10 sm:data-[state=closed]:slide-out-to-right-10 dark:bg-dark"
          aria-describedby={undefined}
        >
          <div className="flex items-center gap-3 border-b border-foreground/5 px-5 py-3 dark:border-white/5">
            <Dialog.Close className={CLOSE_BUTTON} aria-label={isFr ? "Fermer" : "Close"}>
              <X className="size-5" />
            </Dialog.Close>
            <Dialog.Title className="flex-1 text-[17px] font-bold text-foreground dark:text-white">
              {isFr ? "Historique" : "History"}
            </Dialog.Title>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-10">
            {history.length === 0 ? (
              <p className="mt-10 text-center text-sm text-muted dark:text-dark-muted">
                {isFr ? "Aucun message pour le moment" : "No messages yet"}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {history.map((message, i) => {
                  const isUser = message.role === "user"
                  const { text, hasPhoto } = messageText(message, isFr)
                  return (
                    <div
                      key={i}
                      className={cn(
                        "max-w-[82%] rounded-[18px] px-3.5 py-2.5 text-sm leading-5 whitespace-pre-wrap",
                        isUser
                          ? "self-end rounded-br-md bg-primary text-white"
                          : "self-start rounded-bl-md bg-[#F3F0EF] text-foreground dark:bg-[#2A2A2A] dark:text-white"
                      )}
                    >
                      {hasPhoto && (
                        <span className="mb-1 flex items-center gap-1 text-xs font-semibold opacity-80">
                          <ImageIcon className="size-3.5" />
                          Photo
                        </span>
                      )}
                      {text}
                    </div>
                  )
                })}
                <div ref={endRef} />
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ── Choix de la source photo ────────────────────────────────────────────────

export function PhotoSourceSheet({
  open,
  onOpenChange,
  isFr,
  onCamera,
  onGallery,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isFr: boolean
  onCamera: () => void
  onGallery: () => void
}) {
  const option =
    "flex w-full cursor-pointer items-center justify-center gap-2.5 py-4 text-base font-semibold text-primary transition-colors hover:bg-primary/5"
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={OVERLAY} />
        <Dialog.Content
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-6 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">{isFr ? "Envoyer une photo" : "Send a photo"}</Dialog.Title>
          <div className="mb-2 overflow-hidden rounded-[20px] bg-white dark:bg-[#252525]">
            <button type="button" onClick={onCamera} className={cn(option, "border-b border-foreground/10 dark:border-white/10")}>
              <Camera className="size-5" />
              {isFr ? "Prendre une photo" : "Take a photo"}
            </button>
            <button type="button" onClick={onGallery} className={option}>
              <Images className="size-5" />
              {isFr ? "Choisir dans la galerie" : "Choose from gallery"}
            </button>
          </div>
          <Dialog.Close className="w-full cursor-pointer rounded-[20px] bg-white py-4 text-base font-semibold text-muted transition-colors hover:bg-foreground/[0.03] dark:bg-[#252525] dark:text-dark-muted dark:hover:bg-white/5">
            {isFr ? "Annuler" : "Cancel"}
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ── Fenêtre d'information (quota, permissions, limite) ─────────────────────

export function LiveInfoDialog({
  open,
  onOpenChange,
  icon,
  title,
  message,
  buttonLabel,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  icon?: ReactNode
  title: string
  message: string
  buttonLabel: string
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={OVERLAY} />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-4rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center shadow-xl outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 dark:bg-[#252525]">
          {icon && (
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
              {icon}
            </div>
          )}
          <Dialog.Title className="text-[17px] font-bold text-foreground dark:text-white">{title}</Dialog.Title>
          <Dialog.Description className="text-sm leading-5 whitespace-pre-line text-muted dark:text-dark-muted">
            {message}
          </Dialog.Description>
          <Dialog.Close className="w-full cursor-pointer rounded-2xl bg-primary px-6 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-primary-dark">
            {buttonLabel}
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ── Prise de photo dans la page (caméra du navigateur) ─────────────────────

export function PhotoCaptureDialog({
  open,
  onOpenChange,
  isFr,
  permissionText,
  flipLabel,
  onCapture,
  onPickFile,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isFr: boolean
  permissionText: string
  flipLabel: string
  onCapture: (base64: string) => void
  /** Repli : sélecteur de fichier (appareil photo natif sur téléphone). */
  onPickFile: () => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={cn(OVERLAY, "bg-black/80")} />
        <Dialog.Content
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 p-4 outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">{isFr ? "Prendre une photo" : "Take a photo"}</Dialog.Title>
          {open && (
            <CaptureBody
              isFr={isFr}
              permissionText={permissionText}
              flipLabel={flipLabel}
              onCapture={onCapture}
              onPickFile={onPickFile}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function CaptureBody({
  isFr,
  permissionText,
  flipLabel,
  onCapture,
  onPickFile,
}: {
  isFr: boolean
  permissionText: string
  flipLabel: string
  onCapture: (base64: string) => void
  onPickFile: () => void
}) {
  const { stream, facing, canFlip, start, flip } = useCamera()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    start("environment").then((result) => {
      if (!cancelled && !result.ok && result.error !== "cancelled") {
        setError(cameraErrorMessage(result.error, isFr, permissionText))
      }
    })
    return () => {
      cancelled = true
    }
  }, [start, isFr, permissionText])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.srcObject = stream
    if (stream) video.play().catch(() => {})
  }, [stream])

  const shoot = () => {
    const video = videoRef.current
    const base64 = video ? captureVideoFrame(video) : null
    if (base64) onCapture(base64)
    else setError(isFr ? "La capture photo a échoué. Réessaie." : "Photo capture failed. Try again.")
  }

  return (
    <>
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-black">
        {error ? (
          <div className="flex aspect-[3/4] flex-col items-center justify-center gap-4 p-6 text-center sm:aspect-[4/3]">
            <Camera className="size-10 text-white/60" />
            <p className="text-sm leading-5 text-white/80">{error}</p>
            <button
              type="button"
              onClick={onPickFile}
              className="cursor-pointer rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-foreground"
            >
              {isFr ? "Choisir une image" : "Choose an image"}
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedData={() => setReady(true)}
              className={cn(
                "max-h-[70dvh] w-full object-contain",
                facing === "user" && "-scale-x-100",
                !ready && "aspect-[3/4] sm:aspect-[4/3]"
              )}
            />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="size-8 animate-spin text-white/70" />
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-8">
        <Dialog.Close
          className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          aria-label={isFr ? "Annuler" : "Cancel"}
        >
          <X className="size-6" />
        </Dialog.Close>
        <button
          type="button"
          onClick={shoot}
          disabled={!!error || !ready}
          aria-label={isFr ? "Prendre la photo" : "Take the photo"}
          className="flex size-[72px] cursor-pointer items-center justify-center rounded-full border-4 border-white/80 bg-white/10 transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="size-14 rounded-full bg-white" />
        </button>
        <button
          type="button"
          onClick={() => void flip()}
          disabled={!canFlip || !!error}
          aria-label={flipLabel}
          title={flipLabel}
          className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 disabled:invisible"
        >
          <SwitchCamera className="size-6" />
        </button>
      </div>
    </>
  )
}
