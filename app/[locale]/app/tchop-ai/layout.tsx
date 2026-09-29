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
    ? "TchopAI, ton assistant culinaire camerounais : pose tes questions sur les recettes, les ingrédients et les techniques, ou envoie une photo de ton plat."
    : "TchopAI, your Cameroonian cooking assistant: ask about recipes, ingredients and techniques, or send a photo of your dish."
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
