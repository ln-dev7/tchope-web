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
    <div className="flex flex-col gap-3 rounded-2xl bg-primary/10 p-3 dark:bg-primary/15 sm:flex-row sm:items-center sm:px-4 sm:py-3">
      <div className="flex flex-1 items-center gap-3">
        <Smartphone className="size-5 shrink-0 text-primary" />
        <p className="text-xs font-medium text-foreground dark:text-white">
          {locale === "fr"
            ? "Tchopé est aussi disponible sur mobile, sur iPhone et Android !"
            : "Tchopé is also available on mobile, on iPhone and Android!"}
        </p>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <a
          href={`/${locale}#download`}
          className="shrink-0 cursor-pointer rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white"
        >
          {locale === "fr" ? "Installer" : "Install"}
        </a>
        <button
          onClick={dismiss}
          aria-label={locale === "fr" ? "Fermer" : "Close"}
          className="shrink-0 cursor-pointer rounded-full p-1 text-foreground/40 transition-colors hover:text-foreground dark:text-white/40 dark:hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
