"use client"

/**
 * Caméra du navigateur pour TchopAI Live (remplace expo-camera) :
 * getUserMedia (caméra arrière de préférence) et capture d'une image de
 * l'aperçu en JPEG base64 réduit (1280 px max, qualité 0.7).
 */

import { useCallback, useEffect, useRef, useState } from "react"

export type CameraFacing = "environment" | "user"

/** "cancelled" : demande remplacée par une plus récente ou caméra arrêtée entre-temps (pas une erreur à afficher). */
export type CameraError = "denied" | "not-found" | "busy" | "insecure" | "unsupported" | "cancelled" | "unknown"

export type CameraResult = { ok: true } | { ok: false; error: CameraError }

function mapCameraError(error: unknown): CameraError {
  const name = (error as DOMException | undefined)?.name
  if (name === "NotAllowedError" || name === "SecurityError") return "denied"
  if (name === "NotFoundError" || name === "OverconstrainedError") return "not-found"
  if (name === "NotReadableError" || name === "AbortError") return "busy"
  return "unknown"
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop())
}

/** Image courante de la vidéo → JPEG base64 (sans le préfixe data:). */
export function captureVideoFrame(
  video: HTMLVideoElement,
  maxSide = 1280,
  quality = 0.7
): string | null {
  const width = video.videoWidth
  const height = video.videoHeight
  if (!width || !height) return null
  const scale = Math.min(1, maxSide / Math.max(width, height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext("2d")
  if (!ctx) return null
  try {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL("image/jpeg", quality)
    const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1)
    return base64 || null
  } catch {
    return null
  }
}

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facing, setFacing] = useState<CameraFacing>("environment")
  const [canFlip, setCanFlip] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const requestRef = useRef(0)

  const stop = useCallback(() => {
    requestRef.current++
    stopStream(streamRef.current)
    streamRef.current = null
    setStream(null)
  }, [])

  const start = useCallback(async (wanted: CameraFacing = "environment"): Promise<CameraResult> => {
    if (typeof window === "undefined") return { ok: false, error: "unsupported" }
    if (!window.isSecureContext) return { ok: false, error: "insecure" }
    if (!navigator.mediaDevices?.getUserMedia) return { ok: false, error: "unsupported" }

    const request = ++requestRef.current
    // Certains téléphones n'ouvrent pas deux caméras à la fois.
    stopStream(streamRef.current)
    streamRef.current = null

    try {
      const next = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: wanted },
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      })
      if (request !== requestRef.current) {
        stopStream(next)
        return { ok: false, error: "cancelled" }
      }
      streamRef.current = next
      setStream(next)
      setFacing(wanted)
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        setCanFlip(devices.filter((d) => d.kind === "videoinput").length > 1)
      } catch {
        setCanFlip(false)
      }
      return { ok: true }
    } catch (error) {
      if (request !== requestRef.current) return { ok: false, error: "cancelled" }
      setStream(null)
      return { ok: false, error: mapCameraError(error) }
    }
  }, [])

  const flip = useCallback(async () => {
    const next: CameraFacing = facing === "environment" ? "user" : "environment"
    const result = await start(next)
    if (!result.ok && result.error !== "cancelled") await start(facing)
    return result
  }, [facing, start])

  // Arrêt de la caméra en quittant la page.
  useEffect(() => {
    const requests = requestRef
    const streams = streamRef
    return () => {
      requests.current++
      stopStream(streams.current)
      streams.current = null
    }
  }, [])

  return { stream, facing, canFlip, start, stop, flip }
}

/** Message affiché quand la caméra ne s'ouvre pas. */
export function cameraErrorMessage(
  error: CameraError,
  isFr: boolean,
  permissionText: string
): string {
  switch (error) {
    case "denied":
      return permissionText
    case "not-found":
      return isFr ? "Aucune caméra détectée sur cet appareil." : "No camera found on this device."
    case "busy":
      return isFr
        ? "La caméra est déjà utilisée par une autre application."
        : "The camera is already in use by another app."
    case "insecure":
      return isFr
        ? "La caméra nécessite une connexion sécurisée (https)."
        : "The camera requires a secure connection (https)."
    case "unsupported":
      return isFr
        ? "Ce navigateur ne permet pas d'utiliser la caméra."
        : "This browser can't use the camera."
    default:
      return isFr ? "Impossible d'ouvrir la caméra." : "Unable to open the camera."
  }
}
