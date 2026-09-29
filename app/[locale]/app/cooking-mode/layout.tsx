import type { Metadata } from "next"
import { languageAlternates } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale !== "en"
  const title = isFr ? "Mode cuisine" : "Cooking mode"
  const description = isFr
    ? "Cuisine pas à pas avec minuteurs intégrés et lecture vocale des étapes."
    : "Cook step by step with built-in timers and voice reading of each step."
  const path = "/app/cooking-mode"

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

export default function CookingModeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
