"use client"

import { useEffect, useState, type RefObject } from "react"
import { Loader2, SwitchCamera } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>
  stream: MediaStream | null
  mirrored: boolean
  canFlip: boolean
  flipLabel: string
  onFlip: () => void
  isThinking: boolean
  className?: string
}

/**
 * Aperçu caméra (équivalent de CameraPreview.tsx). Le cadre prend le format
 * réel de la vidéo : ce qui est visible est exactement ce que l'IA recevra.
 * Le parent doit être un conteneur de taille (`[container-type:size]`).
 */
export function CameraPreview({
  videoRef,
  stream,
  mirrored,
  canFlip,
  flipLabel,
  onFlip,
  isThinking,
  className,
}: Props) {
  const [aspect, setAspect] = useState(3 / 4)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.srcObject = stream
    if (stream) video.play().catch(() => {})
  }, [stream, videoRef])

  const updateAspect = () => {
    const video = videoRef.current
    if (video?.videoWidth && video.videoHeight) {
      setAspect(video.videoWidth / video.videoHeight)
      setReady(true)
    }
  }

  return (
    <div
      className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[20px] border-2 border-[#E0E0E0] bg-black shadow-[0_8px_24px_-6px_rgba(0,0,0,0.25)] dark:border-white/10",
        className
      )}
      style={{ aspectRatio: aspect, width: `min(90cqw, ${(100 * aspect).toFixed(3)}cqh)` }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={updateAspect}
        onResize={updateAspect}
        className={cn("size-full object-cover", mirrored && "-scale-x-100")}
      />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-white/70" />
        </div>
      )}

      {canFlip && (
        <button
          type="button"
          onClick={onFlip}
          aria-label={flipLabel}
          title={flipLabel}
          className="absolute right-3 bottom-3 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <SwitchCamera className="size-5" />
        </button>
      )}

      {/* Thinking overlay */}
      {isThinking && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Loader2 className="size-9 animate-spin text-white" />
        </div>
      )}
    </div>
  )
}
