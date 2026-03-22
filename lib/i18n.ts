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
      download: "Télécharger",
    },
    hero: {
      badge: "80+ recettes",
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
    cta: {
      title: "Prêt à tchoper ?",
      subtitle:
        "Télécharge Tchopé gratuitement et commence à cuisiner.",
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
      lastUpdated: "Dernière mise à jour : 20 mars 2026",
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
            "Tchopé demande l'accès à votre caméra et/ou à votre galerie photo uniquement lorsque vous choisissez d'ajouter une photo à une recette personnelle. Cette permission est :",
          items: [
            "Optionnelle : vous pouvez créer des recettes sans ajouter de photo",
            "Ponctuelle : l'accès n'est demandé qu'au moment où vous appuyez sur le bouton d'ajout de photo",
            "Locale : les photos sélectionnées ou prises sont stockées uniquement sur votre appareil. Elles ne sont jamais envoyées, partagées ou uploadées vers un serveur",
          ],
        },
        storage: {
          title: "4. Stockage local",
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
          title: "5. Données de tiers",
          content:
            "L'application charge des images depuis Wikimedia Commons et des miniatures vidéo depuis YouTube pour illustrer les recettes. Ces requêtes sont soumises aux politiques de confidentialité respectives de Wikimedia et Google/YouTube. Lorsque vous choisissez de regarder une vidéo de recette, vous êtes redirigé vers YouTube via votre navigateur. Tchopé n'a aucun contrôle sur les données collectées par YouTube.",
        },
        changes: {
          title: "6. Modifications",
          content:
            "Cette politique de confidentialité peut être mise à jour occasionnellement. Toute modification sera reflétée par la date de mise à jour en haut de ce document. Nous vous encourageons à consulter cette page régulièrement.",
        },
        contact: {
          title: "7. Contact",
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
      download: "Download",
    },
    hero: {
      badge: "80+ recipes",
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
    cta: {
      title: "Ready to tchoper?",
      subtitle:
        "Download Tchopé for free and start cooking.",
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
      lastUpdated: "Last updated: March 20, 2026",
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
            "Tchopé requests access to your camera and/or photo library only when you choose to add a photo to a personal recipe. This permission is:",
          items: [
            "Optional: you can create recipes without adding a photo",
            "On-demand: access is only requested when you tap the photo button",
            "Local: selected or captured photos are stored exclusively on your device. They are never sent, shared, or uploaded to any server",
          ],
        },
        storage: {
          title: "4. Local Storage",
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
          title: "5. Third-Party Data",
          content:
            "The app loads images from Wikimedia Commons and video thumbnails from YouTube to illustrate recipes. These requests are subject to the respective privacy policies of Wikimedia and Google/YouTube. When you choose to watch a recipe video, you are redirected to YouTube via your browser. Tchopé has no control over the data collected by YouTube.",
        },
        changes: {
          title: "6. Changes",
          content:
            "This privacy policy may be updated from time to time. Any changes will be reflected by the update date at the top of this document. We encourage you to review this page periodically.",
        },
        contact: {
          title: "7. Contact",
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
