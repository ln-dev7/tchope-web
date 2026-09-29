"use client"

import { Camera, Images } from "lucide-react"
import { Dialog } from "radix-ui"
import { cn } from "@/lib/utils"
import { focusRingPrimary } from "./styles"

/**
 * Choix de la source de la photo (comme la feuille « Prendre une photo /
 * Choisir dans la galerie / Annuler » du mobile).
 */
export function PhotoSourceDialog({
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
    "flex w-full cursor-pointer items-center justify-center gap-2.5 py-4 text-base font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:-outline-offset-2"

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-4 bottom-[max(env(safe-area-inset-bottom),1rem)] z-50 mx-auto max-w-sm outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2"
        >
          <Dialog.Title className="sr-only">{isFr ? "Envoyer une photo" : "Send a photo"}</Dialog.Title>
          <div className="mb-2 overflow-hidden rounded-[20px] bg-white shadow-xl dark:bg-dark-surface">
            <button type="button" onClick={onCamera} className={cn(focusRingPrimary, option)}>
              <Camera className="size-5" />
              {isFr ? "Prendre une photo" : "Take a photo"}
            </button>
            <div className="h-px bg-[#EAE7E7] dark:bg-[#333333]" />
            <button type="button" onClick={onGallery} className={cn(focusRingPrimary, option)}>
              <Images className="size-5" />
              {isFr ? "Choisir dans la galerie" : "Choose from gallery"}
            </button>
          </div>
          <Dialog.Close
            className={cn(
              "w-full cursor-pointer rounded-[20px] bg-white py-4 text-base font-semibold text-muted shadow-xl transition-colors hover:bg-foreground/5 dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-white/5",
              focusRingPrimary
            )}
          >
            {isFr ? "Annuler" : "Cancel"}
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
