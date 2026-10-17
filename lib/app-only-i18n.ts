import type { Locale } from "@/lib/i18n"

/**
 * Libellés propres au site (components/app-only.tsx) : à part de constants/translations.ts,
 * que `pnpm sync` recopie depuis l'app mobile.
 */
const dict = {
  fr: {
    title: "TchopAI est dans l'app",
    body: "Les fonctions IA de Tchopé font partie de Tchopé Pro, dans l'application mobile. Sur le site, les recettes, le mode cuisine, les minuteurs, les notes et ton carnet restent gratuits.",
    features: [
      "TchopAI, ton assistant cuisine (3 messages offerts)",
      "Photo de ton plat ou de ton frigo",
      "Recherche intelligente avec tes ingrédients",
      "Planning de la semaine par l'IA",
      "TchopAI Live : guidage vocal en cuisine",
    ],
    qr: "Scanner le QR code pour télécharger",
    close: "Fermer",
    localHint: "Résultats simples, sans IA. La recherche intelligente est dans l'app.",
    localCta: "Voir l'app",
  },
  en: {
    title: "TchopAI is in the app",
    body: "Tchopé's AI features are part of Tchopé Pro, in the mobile app. On the website, recipes, cooking mode, timers, notes and your cookbook stay free.",
    features: [
      "TchopAI, your cooking assistant (3 free messages)",
      "A photo of your dish or fridge",
      "Smart search with your ingredients",
      "Your week planned by AI",
      "TchopAI Live: voice guidance while you cook",
    ],
    qr: "Scan the QR code to download",
    close: "Close",
    localHint: "Simple results, without AI. Smart search is in the app.",
    localCta: "Get the app",
  },
} as const

export function appOnlyText(locale: Locale) {
  return dict[locale] ?? dict.fr
}
