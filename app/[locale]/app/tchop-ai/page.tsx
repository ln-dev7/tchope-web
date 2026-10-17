"use client"

import { useLocale } from "@/lib/locale-context"
import { AppOnlyPage } from "@/components/app-only"

/** TchopAI n'est plus sur le site (17 oct. 2026) : l'ancienne adresse ouvre la fenêtre « dans l'app ». */
export default function TchopAiPage() {
  const { locale } = useLocale()
  return <AppOnlyPage fallback={`/${locale}/app`} />
}
