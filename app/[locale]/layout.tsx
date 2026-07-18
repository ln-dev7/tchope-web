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
    ? "Tchopé, l'application de recettes camerounaises gratuite et hors ligne : 140+ plats traditionnels (ndolé, eru, poulet DG), filtres par région et cookbook."
    : "Tchopé, the free offline Cameroonian recipes app: 140+ traditional dishes (ndolé, eru, poulet DG), region filters and a personal cookbook."
  const shortDescription = isFr
    ? "La cuisine camerounaise dans ta poche."
    : "Cameroonian cuisine in your pocket."
  const ogImage = isFr ? DEFAULT_OG_FR : DEFAULT_OG_EN

  return {
    // `absolute` : le template « %s | Tchopé » du layout racine dupliquait la
    // marque (« Tchopé — … | Tchopé ») sur la home. Les pages internes gardent
    // le template.
    title: { absolute: title },
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
          width: 1536,
          height: 1024,
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
