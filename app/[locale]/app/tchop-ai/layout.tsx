import type { Metadata } from "next"
import { languageAlternates } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale !== "en"
  const title = "TchopAI"
  const description = isFr
    ? "TchopAI, ton assistant culinaire camerounais, est dans l'app Tchopé (Tchopé Pro) : questions sur les recettes, les ingrédients et les techniques, photo de ton plat."
    : "TchopAI, your Cameroonian cooking assistant, is in the Tchopé app (Tchopé Pro): questions about recipes, ingredients and techniques, a photo of your dish."
  const path = "/app/tchop-ai"

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

export default function TchopAILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
