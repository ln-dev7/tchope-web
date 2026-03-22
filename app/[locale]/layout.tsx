import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { isValidLocale, locales, type Locale } from "@/lib/i18n"
import { LocaleProvider } from "@/lib/locale-context"

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  if (locale === "en") {
    return {
      title: "Tchopé — Cameroonian Recipes",
      description:
        "Discover authentic traditional Cameroonian recipes. Filter by region, save your favorites and create your cookbook. 100% free, 100% offline.",
      keywords: [
        "cameroonian recipes",
        "cameroonian cuisine",
        "tchopé",
        "ndolé",
        "poulet dg",
        "eru",
        "african recipes",
      ],
      openGraph: {
        title: "Tchopé — Cameroonian Recipes",
        description: "Cameroonian cuisine in your pocket.",
        url: "https://tchope.lndev.me/en",
        siteName: "Tchopé",
        locale: "en_US",
        type: "website",
        images: [
          {
            url: "https://tchope.lndev.me/brand/banner-en.png",
            width: 1200,
            height: 630,
            alt: "Tchopé — Cameroonian Recipes",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Tchopé — Cameroonian Recipes",
        description: "Cameroonian cuisine in your pocket.",
        images: ["https://tchope.lndev.me/brand/banner-en.png"],
      },
    }
  }

  return {
    title: "Tchopé — Recettes Camerounaises",
    description:
      "Découvre des recettes traditionnelles camerounaises authentiques. Filtre par région, sauvegarde tes favoris et crée ton cookbook. 100% gratuit, 100% hors ligne.",
    keywords: [
      "recettes camerounaises",
      "cuisine camerounaise",
      "tchopé",
      "ndolé",
      "poulet dg",
      "eru",
      "recettes africaines",
    ],
    openGraph: {
      title: "Tchopé — Recettes Camerounaises",
      description: "La cuisine camerounaise dans ta poche.",
      url: "https://tchope.lndev.me",
      siteName: "Tchopé",
      locale: "fr_FR",
      type: "website",
      images: [
        {
          url: "https://tchope.lndev.me/brand/banner.png",
          width: 1200,
          height: 630,
          alt: "Tchopé — Recettes de cuisine camerounaise",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Tchopé — Recettes Camerounaises",
      description: "La cuisine camerounaise dans ta poche.",
      images: ["https://tchope.lndev.me/brand/banner.png"],
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isValidLocale(locale)) {
    notFound()
  }

  return (
    <LocaleProvider locale={locale as Locale}>{children}</LocaleProvider>
  )
}
