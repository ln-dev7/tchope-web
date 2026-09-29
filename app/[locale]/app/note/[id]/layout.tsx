import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale !== "en"
  const title = "Note"
  const description = isFr
    ? "Écris tes idées, listes de courses et astuces de cuisine."
    : "Write down your ideas, shopping lists and cooking tips."

  return {
    title,
    description,
    robots: { index: false, follow: false },
  }
}

export default function NoteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
