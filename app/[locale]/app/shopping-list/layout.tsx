import type { Metadata } from "next"
import { languageAlternates } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale !== "en"
  const title = isFr ? "Liste de courses" : "Shopping List"
  const description = isFr
    ? "La liste de courses de ton plan de la semaine : ingrédients regroupés, à cocher et à partager."
    : "The shopping list for your weekly plan: grouped ingredients to check off and share."
  const path = "/app/shopping-list"

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

export default function ShoppingListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
