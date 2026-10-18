"use client"

import { X, Smartphone } from "lucide-react"
import { useState, useSyncExternalStore } from "react"
import { useLocale } from "@/lib/locale-context"
import { storeLinks } from "@/lib/store-links"

const noopSubscribe = () => () => {}
const DISMISS_KEY = "tchope_banner_dismissed"

// sessionStorage lève une SecurityError quand le stockage du site est bloqué :
// sans try/catch, toute la page planterait.
function readDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1"
  } catch {
    return false
  }
}

// Côté serveur, la bannière est considérée comme fermée ; le client la montre
// après l'hydratation seulement si elle n'a pas été fermée dans cette session
// (évite l'erreur d'hydratation React #418).
function useDismissedThisSession() {
  return useSyncExternalStore(noopSubscribe, readDismissed, () => true)
}

export function StoreBanner() {
  const { locale } = useLocale()
  const storedDismissed = useDismissedThisSession()
  const [dismissedNow, setDismissedNow] = useState(false)
  const dismissed = storedDismissed || dismissedNow

  const hasStore = !!storeLinks.playStore || !!storeLinks.appStore
  if (!hasStore || dismissed) return null

  function dismiss() {
    setDismissedNow(true)
    try {
      sessionStorage.setItem(DISMISS_KEY, "1")
    } catch {
      // stockage bloqué : fermée pour cette page seulement
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-primary/10 p-2.5 sm:gap-3 sm:px-4 dark:bg-primary/15">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Smartphone className="size-4 shrink-0 text-primary" />
        <p className="text-xs font-medium text-foreground dark:text-white">
          {locale === "fr"
            ? "Tchopé sur iPhone, iPad et Android."
            : "Tchopé on iPhone, iPad and Android."}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <a
          href={`/${locale}/download`}
          className="flex min-h-11 shrink-0 cursor-pointer items-center rounded-full px-2 text-xs font-bold text-primary"
        >
          {locale === "fr" ? "Installer" : "Install"}
        </a>
        <button
          onClick={dismiss}
          aria-label={locale === "fr" ? "Fermer" : "Close"}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:text-foreground dark:text-white/40 dark:hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
