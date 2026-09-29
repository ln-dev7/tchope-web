import type { Metadata } from "next"
import { languageAlternates } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale !== "en"
  const title = isFr ? "Plan de la semaine" : "Weekly Plan"
  const description = isFr
    ? "Planifie tes repas de la semaine avec TchopAI : plan de repas camerounais, liste de courses et export PDF."
    : "Plan your weekly meals with TchopAI: Cameroonian meal plan, shopping list and PDF export."
  const path = "/app/planner"

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

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
