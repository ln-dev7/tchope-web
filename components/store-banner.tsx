"use client"

import { X, Smartphone } from "lucide-react"
import { useState } from "react"
import { useLocale } from "@/lib/locale-context"
import { storeLinks } from "@/lib/store-links"

function isDismissed() {
  if (typeof window === "undefined") return true
  return sessionStorage.getItem("tchope_banner_dismissed") === "1"
}

export function StoreBanner() {
  const { locale } = useLocale()
  const [dismissed, setDismissed] = useState(isDismissed)

  const hasStore = !!storeLinks.playStore || !!storeLinks.appStore
  if (!hasStore || dismissed) return null

  function dismiss() {
    setDismissed(true)
    sessionStorage.setItem("tchope_banner_dismissed", "1")
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-primary/10 p-3 dark:bg-primary/15 sm:flex-row sm:items-center sm:px-4 sm:py-3">
      <div className="flex flex-1 items-center gap-3">
        <Smartphone className="size-5 shrink-0 text-primary" />
        <p className="text-xs font-medium text-foreground dark:text-white">
          {locale === "fr"
            ? "Tchopé est aussi disponible sur mobile !"
            : "Tchopé is also available on mobile!"}
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
          className="shrink-0 cursor-pointer rounded-full p-1 text-foreground/40 transition-colors hover:text-foreground dark:text-white/40 dark:hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
