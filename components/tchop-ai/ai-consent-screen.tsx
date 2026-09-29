"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRightCircle, FileText, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Locale } from "@/lib/i18n"
import type { useAppTranslations } from "@/hooks/use-app-translations"
import { focusRingPrimary, roundButton } from "./styles"

/**
 * Écran de consentement affiché dans le chat tant que le consentement IA n'est
 * pas donné (comme AiConsent dans tchope/app/tchop-ai.tsx) : divulgue les
 * données envoyées à TchopAI et le prestataire IA (Anthropic), puis recueille
 * un accord explicite AVANT tout envoi.
 */
export function AiConsentScreen({
  locale,
  isFr,
  t,
  onAgree,
  onBack,
}: {
  locale: Locale
  isFr: boolean
  t: ReturnType<typeof useAppTranslations>["t"]
  onAgree: () => void
  onBack: () => void
}) {
  const dataItems = t("aiConsentData").split("\n").filter(Boolean)

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            aria-label={isFr ? "Retour" : "Back"}
            title={isFr ? "Retour" : "Back"}
            className={cn(roundButton, focusRingPrimary)}
          >
            <ArrowLeft className="size-5" />
          </button>
          <span className="text-[17px] font-bold text-foreground dark:text-white">TchopAI</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-lg px-6 pt-2 pb-10 sm:pt-8">
          <div className="flex flex-col items-center">
            <div className="flex size-16 items-center justify-center rounded-[20px] bg-primary/10 text-primary dark:bg-primary/20">
              <ShieldCheck className="size-[30px]" />
            </div>
            <h1 className="mt-3.5 text-center text-[22px] font-extrabold text-foreground dark:text-white">
              {t("aiConsentTitle")}
            </h1>
          </div>

          <p className="mt-3.5 text-sm leading-[21px] text-muted dark:text-dark-muted">{t("aiConsentBody")}</p>

          <ul className="mt-3.5 space-y-2.5">
            {dataItems.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm leading-5 font-semibold text-foreground dark:text-white"
              >
                <ArrowRightCircle className="mt-px size-[18px] shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[13px] leading-5 text-muted dark:text-dark-muted">{t("aiConsentProvider")}</p>

          <Link
            href={`/${locale}/privacy`}
            target="_blank"
            rel="noopener"
            className={cn(
              "mt-3.5 inline-flex items-center gap-1.5 rounded text-[13px] font-bold text-primary underline",
              focusRingPrimary
            )}
          >
            <FileText className="size-[15px]" />
            {t("aiConsentPrivacy")}
          </Link>

          <button
            type="button"
            onClick={onAgree}
            className={cn(
              "mt-6 w-full cursor-pointer rounded-2xl bg-primary py-[15px] text-[15px] font-extrabold text-white transition-colors hover:bg-primary-dark",
              focusRingPrimary
            )}
          >
            {t("aiConsentAgree")}
          </button>
        </div>
      </div>
    </div>
  )
}
