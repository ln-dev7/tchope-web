"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ShieldCheck, ArrowRightCircle, FileText } from "lucide-react"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useAiConsentStore } from "@/stores/ai-consent"
import { setAiConsentHandler } from "@/lib/ai/consent"

/**
 * Consentement IA global (comme AiConsentProvider sur mobile) : la fenêtre
 * s'ouvre au premier appel à l'IA, quel que soit l'écran (chat, recherche IA,
 * planning, Live), et l'appel attend la réponse.
 */
export function AiConsentProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const setAiConsent = useAiConsentStore((s) => s.setAiConsent)
  const [open, setOpen] = useState(false)
  const resolverRef = useRef<((v: boolean) => void) | null>(null)
  const pendingRef = useRef<Promise<boolean> | null>(null)

  const ensureConsent = useCallback((): Promise<boolean> => {
    if (useAiConsentStore.getState().aiConsent) return Promise.resolve(true)
    // Deux appels IA en même temps : une seule fenêtre, la même réponse pour les deux.
    if (pendingRef.current) return pendingRef.current
    pendingRef.current = new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
      setOpen(true)
    })
    return pendingRef.current
  }, [])

  useEffect(() => {
    setAiConsentHandler(ensureConsent)
    return () => {
      setAiConsentHandler(null)
      // Sortie de l'app pendant la demande : l'appel en attente est simplement refusé.
      resolverRef.current?.(false)
      resolverRef.current = null
      pendingRef.current = null
    }
  }, [ensureConsent])

  const finish = useCallback(
    (agreed: boolean) => {
      if (agreed) setAiConsent(true)
      setOpen(false)
      resolverRef.current?.(agreed)
      resolverRef.current = null
      pendingRef.current = null
    },
    [setAiConsent]
  )

  return (
    <>
      {children}
      <AiConsentDialog open={open} onAgree={() => finish(true)} onCancel={() => finish(false)} t={t} locale={locale} />
    </>
  )
}

export function AiConsentDialog({
  open,
  onAgree,
  onCancel,
  t,
  locale,
}: {
  open: boolean
  onAgree: () => void
  onCancel: () => void
  t: ReturnType<typeof useAppTranslations>["t"]
  locale: string
}) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <AlertDialogPrimitive.Content
          onEscapeKeyDown={onCancel}
          className="fixed inset-x-0 bottom-0 z-[60] max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-background p-6 pb-8 shadow-xl data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl dark:bg-dark"
        >
          <div className="flex flex-col items-center">
            <div className="flex size-15 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">
              <ShieldCheck className="size-7" />
            </div>
            <AlertDialogPrimitive.Title className="mt-3 text-center text-xl font-extrabold text-foreground dark:text-white">
              {t("aiConsentTitle")}
            </AlertDialogPrimitive.Title>
          </div>
          <AlertDialogPrimitive.Description className="mt-3 text-sm leading-relaxed text-muted dark:text-dark-muted">
            {t("aiConsentBody")}
          </AlertDialogPrimitive.Description>
          <ul className="mt-3.5 space-y-2.5">
            {t("aiConsentData")
              .split("\n")
              .filter(Boolean)
              .map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm font-semibold text-foreground dark:text-white">
                  <ArrowRightCircle className="mt-0.5 size-4.5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
          </ul>
          <p className="mt-4 text-[13px] leading-relaxed text-muted dark:text-dark-muted">{t("aiConsentProvider")}</p>
          <Link
            href={`/${locale}/privacy`}
            target="_blank"
            className="mt-3.5 inline-flex items-center gap-1.5 text-[13px] font-bold text-primary underline"
          >
            <FileText className="size-4" />
            {t("aiConsentPrivacy")}
          </Link>
          <AlertDialogPrimitive.Action
            onClick={onAgree}
            className="mt-6 w-full cursor-pointer rounded-2xl bg-primary py-3.5 text-[15px] font-extrabold text-white transition-colors hover:bg-primary-dark"
          >
            {t("aiConsentAgree")}
          </AlertDialogPrimitive.Action>
          <AlertDialogPrimitive.Cancel
            onClick={onCancel}
            className="mt-2 w-full cursor-pointer py-2 text-sm text-muted dark:text-dark-muted"
          >
            {t("cancel")}
          </AlertDialogPrimitive.Cancel>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}
