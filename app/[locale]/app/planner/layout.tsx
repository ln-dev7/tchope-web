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
    ? "Ton plan de repas camerounais de la semaine, ta liste de courses et l'export PDF. Le planning par l'IA est dans l'app Tchopé."
    : "Your weekly Cameroonian meal plan, shopping list and PDF export. AI meal planning is in the Tchopé app."
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
