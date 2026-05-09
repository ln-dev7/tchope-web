import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Script from "next/script"
import { isValidLocale, locales, type Locale } from "@/lib/i18n"
import { LocaleProvider } from "@/lib/locale-context"
import {
  DEFAULT_OG_EN,
  DEFAULT_OG_FR,
  SITE_NAME,
  SITE_TWITTER,
  SITE_URL,
  languageAlternates,
  ogLocale,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo"

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale !== "en"

  const title = isFr
    ? "Tchopé — Recettes Camerounaises Authentiques"
    : "Tchopé — Authentic Cameroonian Recipes"
  const description = isFr
    ? "Découvre 140+ recettes traditionnelles camerounaises authentiques. Filtre par région, sauvegarde tes favoris et crée ton cookbook. 100% gratuit, 100% hors ligne."
    : "Discover 140+ authentic traditional Cameroonian recipes. Filter by region, save your favorites and create your cookbook. 100% free, 100% offline."
  const shortDescription = isFr
    ? "La cuisine camerounaise dans ta poche."
    : "Cameroonian cuisine in your pocket."
  const ogImage = isFr ? DEFAULT_OG_FR : DEFAULT_OG_EN

  return {
    title,
    description,
    keywords: isFr
      ? [
          "recettes camerounaises",
          "cuisine camerounaise",
          "tchopé",
          "ndolé",
          "poulet dg",
          "eru",
          "mbongo tchobi",
          "okok",
          "kondre",
          "recettes africaines",
          "cuisine africaine",
          "Cameroun",
        ]
      : [
          "cameroonian recipes",
          "cameroonian cuisine",
          "tchopé",
          "ndolé",
          "poulet dg",
          "eru",
          "mbongo tchobi",
          "okok",
          "kondre",
          "african recipes",
          "african cuisine",
          "Cameroon",
        ],
    alternates: {
      canonical: `/${locale}`,
      languages: languageAlternates(""),
    },
    openGraph: {
      title,
      description: shortDescription,
      url: `${SITE_URL}/${locale}`,
      siteName: SITE_NAME,
      locale: ogLocale(locale === "en" ? "en" : "fr"),
      alternateLocale: isFr ? ["en_US"] : ["fr_FR"],
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: shortDescription,
      images: [ogImage],
      creator: SITE_TWITTER,
      site: SITE_TWITTER,
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

  const typedLocale = locale as Locale

  return (
    <LocaleProvider locale={typedLocale}>
      <Script
        id="ld-website"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd(typedLocale)),
        }}
      />
      <Script
        id="ld-organization"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd()),
        }}
      />
      {children}
    </LocaleProvider>
  )
}
