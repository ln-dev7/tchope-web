"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { QrCode, Sparkles, X } from "lucide-react"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"
import { useLocale } from "@/lib/locale-context"
import { appOnlyText } from "@/lib/app-only-i18n"
import { StoreBadges } from "@/components/store-badges"

/**
 * L'IA de Tchopé (TchopAI, photo, recherche intelligente, planning IA, TchopAI Live) n'est
 * plus servie sur le site (décision de LN, 17 oct. 2026, comme Travora) : elle fait partie
 * de Tchopé Pro, l'abonnement de l'app mobile. Chaque point d'entrée IA du site ouvre cette
 * fenêtre, qui renvoie vers les stores. Le site n'a plus aucune route /api d'IA.
 */

type Ctx = { openAppOnly: () => void }

const AppOnlyContext = createContext<Ctx>({ openAppOnly: () => {} })

export const useAppOnly = () => useContext(AppOnlyContext)

/** Données laissées par l'ancienne IA du site (conversations, consentement, quota photo, cache). */
const LEGACY_AI_KEYS = ["tchope_chat_history", "tchope_ai_consent", "tchope_image_quota"]

function dropLegacyAiData() {
  try {
    const toRemove = LEGACY_AI_KEYS.filter((key) => localStorage.getItem(key) !== null)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("ai_cache:")) toRemove.push(key)
    }
    toRemove.forEach((key) => localStorage.removeItem(key))
  } catch {
    // stockage bloqué : rien à effacer
  }
}

export function AppOnlyProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  useEffect(dropLegacyAiData, [])
  const openAppOnly = useCallback(() => setOpen(true), [])
  const value = useMemo(() => ({ openAppOnly }), [openAppOnly])
  return (
    <AppOnlyContext.Provider value={value}>
      {children}
      <AppOnlyDialog open={open} onClose={() => setOpen(false)} />
    </AppOnlyContext.Provider>
  )
}

export function AppOnlyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale } = useLocale()
  const tx = appOnlyText(locale)
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0"
        />
        <AlertDialogPrimitive.Content
          onEscapeKeyDown={onClose}
          className="fixed inset-x-0 bottom-0 z-[60] max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-background p-6 pb-8 shadow-xl data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl dark:bg-dark"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#A855F7]/12 text-[#A855F7] dark:bg-[#A855F7]/20">
              <Sparkles className="size-7 fill-[#A855F7]/20" />
            </div>
            <AlertDialogPrimitive.Cancel
              onClick={onClose}
              aria-label={tx.close}
              title={tx.close}
              className="-mt-1 -mr-1 flex size-9 cursor-pointer items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-foreground/5 dark:bg-dark-surface dark:text-white dark:hover:bg-white/10"
            >
              <X className="size-5" />
            </AlertDialogPrimitive.Cancel>
          </div>
          <AlertDialogPrimitive.Title className="mt-4 text-xl font-extrabold text-foreground dark:text-white">
            {tx.title}
          </AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-muted dark:text-dark-muted">
            {tx.body}
          </AlertDialogPrimitive.Description>
          <ul className="mt-4 space-y-2">
            {tx.features.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm font-semibold text-foreground dark:text-white">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-[#A855F7]" />
                  {item}
                </li>
              ))}
          </ul>
          <StoreBadges className="mt-6" />
          <Link
            href={`/${locale}/download`}
            onClick={onClose}
            className="mt-4 hidden items-center gap-1.5 text-[13px] font-bold text-primary underline sm:inline-flex"
          >
            <QrCode className="size-4" />
            {tx.qr}
          </Link>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}

/**
 * Ancienne page IA (/app/tchop-ai, /app/live-cooking) : la fenêtre s'ouvre à l'arrivée et sa
 * fermeture ramène à `fallback` (accueil de l'app, ou la recette pour TchopAI Live).
 */
export function AppOnlyPage({ fallback }: { fallback: string }) {
  const router = useRouter()
  // Le portail Radix ne rend rien côté serveur : la fenêtre apparaît au montage.
  const [open, setOpen] = useState(true)
  return (
    <AppOnlyDialog
      open={open}
      onClose={() => {
        setOpen(false)
        router.replace(fallback)
      }}
    />
  )
}
