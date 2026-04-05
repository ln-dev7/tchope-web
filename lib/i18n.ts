export type Locale = "fr" | "en"

export const locales: Locale[] = ["fr", "en"]
export const defaultLocale: Locale = "fr"

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

const dictionaries = {
  fr: {
    nav: {
      features: "Fonctionnalités",
      screenshots: "Aperçu",
      pricing: "Tarifs",
      download: "Télécharger",
      openApp: "Ouvrir l'app",
    },
    hero: {
      badge: "100+ recettes",
      title: "La cuisine camerounaise dans ta poche",
      subtitle:
        "Découvre des recettes traditionnelles authentiques, filtre par région et crée ton propre cookbook. 100% gratuit, 100% hors ligne.",
    },
    features: {
      sectionLabel: "Fonctionnalités",
      title: "Tout ce qu'il faut pour cuisiner camerounais",
      regionTitle: "Recettes par région",
      regionDesc:
        "Explore les spécialités des 10 régions du Cameroun, du Littoral à l'Extrême-Nord.",
      searchTitle: "Recherche intelligente",
      searchDesc:
        "Filtre par temps de cuisson, niveau de piment et ingrédients populaires.",
      favTitle: "Favoris & Cookbook",
      favDesc:
        "Sauvegarde tes recettes préférées et crée les tiennes dans ton cookbook personnel.",
      offlineTitle: "100% hors ligne",
      offlineDesc:
        "Pas besoin d'internet. Toutes les recettes sont disponibles sans connexion.",
    },
    screenshots: {
      sectionLabel: "Aperçu",
      title: "Un aperçu de Tchopé",
    },
    stats: {
      regions: "Régions du Cameroun",
      languages: "Langues (FR & EN)",
      free: "Gratuit & hors ligne",
    },
    pricing: {
      sectionLabel: "Tarifs",
      title: "Choisis ton plan",
      monthly: "Mensuel",
      yearly: "Annuel",
      free: "Gratuit",
      freeDesc: "Tout pour découvrir la cuisine camerounaise",
      freePrice: "0 FCFA",
      freePeriod: "pour toujours",
      freeFeatures: [
        "116+ recettes authentiques",
        "Recherche par région & ingrédients",
        "Liste de courses automatique",
        "Vidéos de recettes",
        "Mode cuisine pas à pas",
        "100% hors ligne",
        "Thème clair / sombre",
        "Widgets iOS & Android",
      ],
      freeCta: "Commencer gratuitement",
      plus: "Tchopé Plus",
      plusDesc: "L'IA au service de ta cuisine",
      plusMonthly: "2 000 FCFA",
      plusYearly: "20 000 FCFA",
      plusPeriodMonthly: "/ mois",
      plusPeriodYearly: "/ an",
      plusSave: "Économise 17%",
      plusFeatures: [
        "Tout du plan Gratuit",
        "TchopAI — Assistant cuisine IA illimité",
        "TchopAI Live — Guidage vocal en temps réel",
        "Recherche de recettes en langage naturel",
        "Génération de plans de repas IA (7 jours)",
        "Ajustement de plans de repas par IA",
      ],
      plusCta: "Passer à Plus",
      popular: "Populaire",
    },
    cta: {
      title: "Prêt à tchoper ?",
      subtitle:
        "Télécharge Tchopé gratuitement et commence à cuisiner.",
      openWeb: "Ouvrir la version web",
    },
    footer: {
      tagline: "La cuisine camerounaise dans ta poche.",
      links: "Liens",
      privacy: "Politique de confidentialité",
      madeWith: "Fait avec ❤️ au Cameroun",
      by: "Par",
      rights: "© 2026 Tchopé. Tous droits réservés.",
    },
    privacy: {
      title: "Politique de Confidentialité",
      lastUpdated: "Dernière mise à jour : 5 avril 2026",
      developer: "Développeur : LNDEV —",
      sections: {
        intro: {
          title: "1. Introduction",
          content:
            "Tchopé est une application mobile de recettes camerounaises. Votre vie privée est importante pour nous. Cette politique explique comment l'application gère vos données.",
          summary:
            "En résumé : Tchopé ne collecte aucune donnée personnelle. Tout reste sur votre appareil.",
        },
        data: {
          title: "2. Collecte de données",
          intro:
            "Tchopé ne collecte, ne transmet et ne stocke aucune donnée personnelle sur un serveur distant. L'application :",
          items: [
            "Ne requiert aucune création de compte",
            "Ne demande aucune information personnelle (nom, email, numéro de téléphone)",
            "N'utilise aucun service d'analytics ou de tracking",
            "N'intègre aucun SDK publicitaire",
            "Ne se connecte à aucun backend ou base de données distante",
            "Fonctionne entièrement hors ligne",
          ],
        },
        camera: {
          title: "3. Caméra et Photos",
          intro:
            "Tchopé demande l'accès à votre caméra et/ou à votre galerie photo dans deux cas :",
          subsections: [
            {
              subtitle: "a) Recettes personnelles",
              description: "Lorsque vous choisissez d'ajouter une photo à une recette personnelle :",
              items: [
                "Optionnelle : vous pouvez créer des recettes sans ajouter de photo",
                "Ponctuelle : l'accès n'est demandé qu'au moment où vous appuyez sur le bouton d'ajout de photo",
                "Locale : les photos sélectionnées ou prises sont stockées uniquement sur votre appareil. Elles ne sont jamais envoyées, partagées ou uploadées vers un serveur",
              ],
            },
            {
              subtitle: "b) TchopAI (analyse photo)",
              description: "Lorsque vous envoyez une photo à TchopAI pour analyser un plat ou des ingrédients (fonctionnalité réservée aux abonnés Tchopé Plus) :",
              items: [
                "Optionnelle : vous pouvez utiliser TchopAI sans envoyer de photo",
                "Ponctuelle : l'accès n'est demandé qu'au moment où vous appuyez sur le bouton photo dans le chat",
                "Transmise à l'API Claude : la photo est envoyée à l'API Claude (Anthropic) pour analyse. Anthropic traite l'image uniquement pour générer une réponse et ne la conserve pas",
                "Non stockée : la photo n'est pas sauvegardée dans l'application après l'envoi. Elle est supprimée de la mémoire dès la réponse reçue",
              ],
            },
          ],
        },
        microphone: {
          title: "4. Microphone et Reconnaissance vocale",
          intro:
            "Tchopé utilise le microphone de votre appareil uniquement dans le cadre de la fonctionnalité TchopAI Live, qui permet de dialoguer vocalement avec l'assistant cuisine pendant que vous cuisinez.",
          items: [
            "Activation explicite : le microphone n'est utilisé que lorsque vous lancez une session TchopAI Live et maintenez le bouton de parole. Il n'est jamais activé en arrière-plan.",
            "Traitement sur l'appareil : l'audio capté par le microphone est converti en texte directement sur votre appareil via les services de reconnaissance vocale du système d'exploitation (Google Speech Services sur Android, Speech Recognition sur iOS). Aucun flux audio n'est envoyé à un serveur distant.",
            "Aucun enregistrement : aucun enregistrement audio n'est stocké sur l'appareil ni transmis à un tiers.",
            "Texte uniquement : seul le texte transcrit par la reconnaissance vocale est envoyé à l'API Claude (Anthropic) pour générer une réponse. Anthropic ne reçoit jamais votre voix, uniquement du texte.",
            "Pas de sauvegarde : les conversations vocales (texte transcrit et réponses de l'IA) ne sont pas sauvegardées après la fin de la session TchopAI Live. Elles sont supprimées de la mémoire dès que vous quittez l'écran.",
            "Révocable : vous pouvez révoquer la permission microphone à tout moment dans les paramètres de votre téléphone (Réglages > Tchopé > Microphone).",
          ],
        },
        payment: {
          title: "5. Paiement et Licence",
          intro:
            "Les fonctionnalités IA de Tchopé (TchopAI Chat, Recherche IA, Meal Plan IA, TchopAI Live) nécessitent une licence payante. Le processus d'achat implique deux services tiers, tous deux opérés par Axa Zara LLC (axazara.com) :",
          items: [
            "Chariow (chariow.com) : plateforme de vente qui gère la licence (génération de clé, activation, expiration). La page d'achat est hébergée sur Chariow, en dehors de l'application.",
            "Moneroo (moneroo.io) : passerelle de paiement qui traite la transaction financière. C'est Moneroo qui collecte et traite les données de paiement (carte bancaire, mobile money, etc.).",
            "Aucune donnée bancaire : Tchopé ne collecte, ne stocke et ne traite aucune donnée bancaire ou financière. Aucune donnée de paiement ne transite par l'application. Tout est géré par les services tiers mentionnés ci-dessus.",
            "Clé de licence : après l'achat, vous recevez une clé de licence que vous saisissez dans l'application. Seule cette clé est stockée localement sur votre appareil pour vérifier votre accès aux fonctionnalités IA.",
          ],
          policies: "Pour plus d'informations, consultez les politiques de confidentialité de Chariow, Moneroo et Axa Zara LLC.",
        },
        storage: {
          title: "6. Stockage local",
          intro:
            "L'application stocke localement sur votre appareil (via AsyncStorage) les données suivantes :",
          items: [
            "Vos favoris : la liste des recettes que vous avez marquées comme favorites",
            "Vos recettes personnelles : les recettes que vous avez créées, incluant les photos éventuelles",
            "Vos préférences : le thème choisi (clair/sombre/système) et la langue (français/anglais)",
          ],
          dataInfo: [
            "Sont stockées exclusivement sur votre appareil",
            "Ne sont jamais transmises à un tiers",
            "Peuvent être supprimées à tout moment depuis les paramètres de l'application ou en désinstallant l'application",
          ],
        },
        thirdParty: {
          title: "7. Données de tiers",
          content:
            "L'application charge des images depuis Wikimedia Commons et des miniatures vidéo depuis YouTube pour illustrer les recettes. Ces requêtes sont soumises aux politiques de confidentialité respectives de Wikimedia et Google/YouTube. Lorsque vous choisissez de regarder une vidéo de recette, vous êtes redirigé vers YouTube via votre navigateur. Tchopé n'a aucun contrôle sur les données collectées par YouTube.",
        },
        changes: {
          title: "8. Modifications",
          content:
            "Cette politique de confidentialité peut être mise à jour occasionnellement. Toute modification sera reflétée par la date de mise à jour en haut de ce document. Nous vous encourageons à consulter cette page régulièrement.",
        },
        contact: {
          title: "9. Contact",
          intro:
            "Pour toute question concernant cette politique de confidentialité :",
        },
      },
    },
  },
  en: {
    nav: {
      features: "Features",
      screenshots: "Preview",
      pricing: "Pricing",
      download: "Download",
      openApp: "Open app",
    },
    hero: {
      badge: "100+ recipes",
      title: "Cameroonian cuisine in your pocket",
      subtitle:
        "Discover authentic traditional recipes, filter by region and create your own cookbook. 100% free, 100% offline.",
    },
    features: {
      sectionLabel: "Features",
      title: "Everything you need to cook Cameroonian",
      regionTitle: "Recipes by region",
      regionDesc:
        "Explore specialties from all 10 regions of Cameroon, from the Coast to the Far North.",
      searchTitle: "Smart search",
      searchDesc:
        "Filter by cooking time, spice level, and popular ingredients.",
      favTitle: "Favorites & Cookbook",
      favDesc:
        "Save your favorite recipes and create your own in your personal cookbook.",
      offlineTitle: "100% offline",
      offlineDesc:
        "No internet needed. All recipes are available without a connection.",
    },
    screenshots: {
      sectionLabel: "Preview",
      title: "A glimpse of Tchopé",
    },
    stats: {
      regions: "Regions of Cameroon",
      languages: "Languages (FR & EN)",
      free: "Free & offline",
    },
    pricing: {
      sectionLabel: "Pricing",
      title: "Choose your plan",
      monthly: "Monthly",
      yearly: "Yearly",
      free: "Free",
      freeDesc: "Everything to discover Cameroonian cuisine",
      freePrice: "0 FCFA",
      freePeriod: "forever",
      freeFeatures: [
        "116+ authentic recipes",
        "Search by region & ingredients",
        "Automatic shopping list",
        "Recipe videos",
        "Step-by-step cooking mode",
        "100% offline",
        "Light / dark theme",
        "iOS & Android widgets",
      ],
      freeCta: "Get started for free",
      plus: "Tchopé Plus",
      plusDesc: "AI-powered cooking assistant",
      plusMonthly: "2,000 FCFA",
      plusYearly: "20,000 FCFA",
      plusPeriodMonthly: "/ month",
      plusPeriodYearly: "/ year",
      plusSave: "Save 17%",
      plusFeatures: [
        "Everything in Free",
        "TchopAI — Unlimited AI cooking assistant",
        "TchopAI Live — Real-time voice guidance",
        "Natural language recipe search",
        "AI meal plan generation (7 days)",
        "AI meal plan adjustments",
      ],
      plusCta: "Upgrade to Plus",
      popular: "Popular",
    },
    cta: {
      title: "Ready to tchoper?",
      subtitle:
        "Download Tchopé for free and start cooking.",
      openWeb: "Open web version",
    },
    footer: {
      tagline: "Cameroonian cuisine in your pocket.",
      links: "Links",
      privacy: "Privacy Policy",
      madeWith: "Made with ❤️ in Cameroon",
      by: "By",
      rights: "© 2026 Tchopé. All rights reserved.",
    },
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "Last updated: April 5, 2026",
      developer: "Developer: LNDEV —",
      sections: {
        intro: {
          title: "1. Introduction",
          content:
            "Tchopé is a mobile app for Cameroonian recipes. Your privacy matters to us. This policy explains how the app handles your data.",
          summary:
            "In short: Tchopé does not collect any personal data. Everything stays on your device.",
        },
        data: {
          title: "2. Data Collection",
          intro:
            "Tchopé does not collect, transmit, or store any personal data on a remote server. The app:",
          items: [
            "Does not require any account creation",
            "Does not ask for any personal information (name, email, phone number)",
            "Does not use any analytics or tracking services",
            "Does not integrate any advertising SDK",
            "Does not connect to any backend or remote database",
            "Works entirely offline",
          ],
        },
        camera: {
          title: "3. Camera and Photos",
          intro:
            "Tchopé requests access to your camera and/or photo library in two cases:",
          subsections: [
            {
              subtitle: "a) Personal Recipes",
              description: "When you choose to add a photo to a personal recipe:",
              items: [
                "Optional: you can create recipes without adding a photo",
                "On-demand: access is only requested when you tap the photo button",
                "Local: selected or captured photos are stored exclusively on your device. They are never sent, shared, or uploaded to any server",
              ],
            },
            {
              subtitle: "b) TchopAI (photo analysis)",
              description: "When you send a photo to TchopAI to analyze a dish or ingredients (feature reserved for Tchopé Plus subscribers):",
              items: [
                "Optional: you can use TchopAI without sending a photo",
                "On-demand: access is only requested when you tap the photo button in the chat",
                "Sent to Claude API: the photo is sent to the Claude API (Anthropic) for analysis. Anthropic processes the image solely to generate a response and does not retain it",
                "Not stored: the photo is not saved in the application after sending. It is cleared from memory once the response is received",
              ],
            },
          ],
        },
        microphone: {
          title: "4. Microphone and Speech Recognition",
          intro:
            "Tchopé uses your device's microphone only within the TchopAI Live feature, which allows you to have a voice conversation with the cooking assistant while you cook.",
          items: [
            "Explicit activation: the microphone is only used when you start a TchopAI Live session and hold the speak button. It is never activated in the background.",
            "On-device processing: the audio captured by the microphone is converted to text directly on your device using the operating system's built-in speech recognition services (Google Speech Services on Android, Speech Recognition on iOS). No audio stream is sent to a remote server.",
            "No recordings: no audio recording is stored on the device or transmitted to any third party.",
            "Text only: only the transcribed text from speech recognition is sent to the Claude API (Anthropic) to generate a response. Anthropic never receives your voice, only text.",
            "No saving: voice conversations (transcribed text and AI responses) are not saved after the TchopAI Live session ends. They are cleared from memory as soon as you leave the screen.",
            "Revocable: you can revoke the microphone permission at any time in your phone settings (Settings > Tchopé > Microphone).",
          ],
        },
        payment: {
          title: "5. Payment and License",
          intro:
            "The AI features of Tchopé (TchopAI Chat, AI Search, AI Meal Plan, TchopAI Live) require a paid license. The purchase process involves two third-party services, both operated by Axa Zara LLC (axazara.com):",
          items: [
            "Chariow (chariow.com): sales platform that manages the license (key generation, activation, expiration). The purchase page is hosted on Chariow, outside the application.",
            "Moneroo (moneroo.io): payment gateway that processes the financial transaction. Moneroo collects and processes payment data (credit card, mobile money, etc.).",
            "No financial data: Tchopé does not collect, store, or process any banking or financial data. No payment data passes through the application. Everything is handled by the third-party services mentioned above.",
            "License key: after purchase, you receive a license key that you enter in the application. Only this key is stored locally on your device to verify your access to AI features.",
          ],
          policies: "For more information, see the privacy policies of Chariow, Moneroo, and Axa Zara LLC.",
        },
        storage: {
          title: "6. Local Storage",
          intro:
            "The app stores the following data locally on your device (via AsyncStorage):",
          items: [
            "Your favorites: the list of recipes you have marked as favorites",
            "Your personal recipes: recipes you have created, including any photos",
            "Your preferences: your chosen theme (light/dark/system) and language (French/English)",
          ],
          dataInfo: [
            "Is stored exclusively on your device",
            "Is never transmitted to any third party",
            "Can be deleted at any time from the app settings or by uninstalling the app",
          ],
        },
        thirdParty: {
          title: "7. Third-Party Data",
          content:
            "The app loads images from Wikimedia Commons and video thumbnails from YouTube to illustrate recipes. These requests are subject to the respective privacy policies of Wikimedia and Google/YouTube. When you choose to watch a recipe video, you are redirected to YouTube via your browser. Tchopé has no control over the data collected by YouTube.",
        },
        changes: {
          title: "8. Changes",
          content:
            "This privacy policy may be updated from time to time. Any changes will be reflected by the update date at the top of this document. We encourage you to review this page periodically.",
        },
        contact: {
          title: "9. Contact",
          intro: "For any questions regarding this privacy policy:",
        },
      },
    },
  },
}

type Dictionaries = typeof dictionaries

export type Dictionary = Dictionaries[Locale]

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
