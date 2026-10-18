"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

export function ScreenshotLightbox({
  src,
  alt,
  open,
  onClose,
}: {
  src: string
  alt: string
  open: boolean
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const { locale } = useLocale()
  useEffect(() => {
    const node = dialog.current
    if (open) node?.showModal()
    else node?.close()
    if (!open) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = overflow
      node?.close()
    }
  }, [open])
  return (
    <dialog
      ref={dialog}
      aria-label={alt}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 m-auto max-h-none max-w-none overflow-visible border-0 bg-transparent p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      <button
        onClick={onClose}
        aria-label={locale === "fr" ? "Fermer l’aperçu" : "Close preview"}
        className="absolute -top-3 -right-3 z-10 flex size-11 items-center justify-center rounded-full bg-white text-black shadow-lg"
      >
        <X className="size-6" />
      </button>
      {src && (
        <Image
          src={src}
          alt={alt}
          width={1206}
          height={2622}
          className="max-h-[85dvh] w-auto max-w-[85vw] rounded-2xl shadow-2xl"
        />
      )}
    </dialog>
  )
}
