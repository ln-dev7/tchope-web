import type { Metadata } from "next"
import { languageAlternates } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale !== "en"
  const title = isFr ? "Minuteur" : "Timer"
  const description = isFr
    ? "Minuteurs de cuisine multiples, préréglages (œuf, pâtes, riz, braisé…) et durées personnalisées."
    : "Multiple kitchen timers, cooking presets (egg, pasta, rice, braised meat…) and custom durations."
  const path = "/app/timer"

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: languageAlternates(path),
    },
    robots: { index: false, follow: false },
  }
}

export default function TimerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
