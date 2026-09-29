"use client"

import { AlertCircle, X } from "lucide-react"

/** Message d'erreur en ligne (remplace l'Alert du mobile). */
export function ErrorBanner({
  message,
  onDismiss,
  dismissLabel,
}: {
  message: string
  onDismiss?: () => void
  dismissLabel?: string
}) {
  return (
    <div
      role="alert"
      className="flex animate-in items-start gap-2.5 rounded-2xl bg-red-500/10 p-3.5 text-sm font-medium text-red-600 fade-in-0 slide-in-from-top-1 duration-200 dark:bg-red-500/15 dark:text-red-400"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <p className="flex-1 leading-snug">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="-m-1 cursor-pointer rounded-full p-1 transition-colors hover:bg-red-500/10"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
