import type { Metadata } from "next"
import { languageAlternates } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale !== "en"
  const title = isFr ? "Mes notes" : "My notes"
  const description = isFr
    ? "Tes idées, astuces et pense-bêtes de cuisine, enregistrés dans ton navigateur."
    : "Your cooking ideas, tips and reminders, saved in your browser."
  const path = "/app/notes"

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

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
