"use client"

import { QRCodeSVG } from "qrcode.react"
import { Copy, ScanLine } from "lucide-react"
import { toast } from "sonner"
import { useLocale } from "@/lib/locale-context"

type Store = "app-store" | "play-store"

const badgeSrc: Record<Store, string> = {
  "app-store": "apple-store",
  "play-store": "play-store",
}

export function StoreQrCard({
  store,
  name,
  devices,
  href,
  highlighted = false,
}: {
  store: Store
  name: string
  devices: string
  href: string
  highlighted?: boolean
}) {
  const { locale, t } = useLocale()

  function copyLink() {
    navigator.clipboard.writeText(href)
    toast.success(t.download.copied)
  }

  return (
    <div
      className={`flex flex-col items-center rounded-3xl border bg-surface p-6 text-center transition-shadow sm:p-7 ${
        highlighted
          ? "border-primary/40 shadow-xl shadow-primary/10"
          : "border-foreground/5 shadow-lg shadow-foreground/5"
      }`}
    >
      <p className="text-lg font-bold text-foreground">{name}</p>
      <p className="mt-0.5 text-sm text-muted">{devices}</p>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${name} — ${t.download.scan}`}
        className="mt-5 rounded-2xl border border-foreground/5 bg-white p-4"
      >
        <QRCodeSVG
          value={href}
          size={176}
          level="H"
          marginSize={0}
          fgColor="#1A1A1A"
          bgColor="#FFFFFF"
          title={`${name} — ${href}`}
          imageSettings={{
            src: "/brand/logo.png",
            width: 40,
            height: 40,
            excavate: true,
          }}
        />
      </a>
      <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
        <ScanLine className="size-3.5" />
        {t.download.scan}
      </p>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 transition-opacity hover:opacity-80"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/store/${badgeSrc[store]}/${locale}.svg`}
          alt={name}
          className="h-[48px] w-auto"
        />
      </a>

      <button
        type="button"
        onClick={copyLink}
        className="mt-4 flex max-w-full cursor-pointer items-center gap-2 rounded-full bg-background px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-foreground"
      >
        <Copy className="size-3.5 shrink-0" />
        <span className="truncate">{t.download.copy}</span>
      </button>
    </div>
  )
}
