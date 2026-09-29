import type { Metadata } from "next"
import { languageAlternates } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale !== "en"
  const title = isFr ? "Cuisine avec ce que j'ai" : "Cook with what I have"
  const description = isFr
    ? "Ajoute les ingrédients que tu as chez toi ou décris ton envie : TchopAI trouve les recettes camerounaises que tu peux préparer."
    : "Add the ingredients you have at home or describe what you feel like: TchopAI finds the Cameroonian recipes you can make."
  const path = "/app/ai-recipes"

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

export default function AiRecipesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
