"use client"

import { useLocale } from "@/lib/locale-context"
import { storeLinks } from "@/lib/store-links"

export function StoreBadges({ className }: { className?: string }) {
  const { locale } = useLocale()

  const hasAppStore = !!storeLinks.appStore
  const hasPlayStore = !!storeLinks.playStore

  if (!hasAppStore && !hasPlayStore) return null

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ""}`}>
      {hasAppStore && (
        <a
          href={storeLinks.appStore}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-80"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/store/apple-store/${locale}.svg`}
            alt="Download on the App Store"
            className="h-[48px] w-auto"
          />
        </a>
      )}
      {hasPlayStore && (
        <a
          href={storeLinks.playStore}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-80"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/store/play-store/${locale}.svg`}
            alt="Get it on Google Play"
            className="h-[48px] w-auto"
          />
        </a>
      )}
    </div>
  )
}
