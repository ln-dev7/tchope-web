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
      openApp: "Ouvrir l'app",
    },
    hero: {
      badge: "100+ recettes",
      title: "La cuisine camerounaise dans ta poche",
      subtitle:
        "Découvre des recettes camerounaises traditionnelles et authentiques, filtre par région et crée ton propre cookbook. 100% gratuit, 100% hors ligne.",
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
    popular: {
      sectionLabel: "Recettes",
      title: "Les grands classiques de la cuisine camerounaise",
      viewAll: "Voir les 140 recettes camerounaises →",
    },
    cta: {
      title: "Prêt à tchoper ?",
      subtitle:
        "Télécharge l'application de recettes camerounaises gratuite et cuisine hors ligne.",
      openWeb: "Ouvrir la version web",
    },
    download: {
      back: "Retour",
      badge: "iPhone · iPad · Android",
      title: "Télécharge Tchopé",
      subtitle:
        "Scanne le QR code avec l'appareil photo de ton téléphone, ou ouvre directement le lien de ton store.",
      detectedIos: "Tu es sur iPhone ou iPad",
      detectedAndroid: "Tu es sur Android",
      openIos: "Ouvrir dans l'App Store",
      openAndroid: "Ouvrir sur Google Play",
      appStoreDevices: "iPhone et iPad",
      playStoreDevices: "Téléphones Android",
      scan: "Scanne pour télécharger",
      copy: "Copier le lien",
      copied: "Lien copié !",
      extrasLabel: "En plus sur mobile",
      extrasTitle: "Ce que tu trouves dans l'app",
      extras: [
        {
          title: "TchopAI",
          desc: "Ton assistant culinaire : pose tes questions, envoie une photo de ton plat.",
        },
        {
          title: "TchopAI Live",
          desc: "Cuisine avec l'IA en vocal, elle te guide étape par étape.",
        },
        {
          title: "Plan de la semaine",
          desc: "L'IA compose tes repas et ta liste de courses automatiquement.",
        },
        {
          title: "Mode cuisine",
          desc: "Les étapes une par une, avec minuteur et lecture vocale.",
        },
      ],
      webTitle: "Pas envie d'installer ?",
      webSubtitle:
        "Toutes les recettes sont aussi disponibles dans ton navigateur.",
      webCta: "Ouvrir la version web",
    },
    footer: {
      tagline: "La cuisine camerounaise dans ta poche.",
      links: "Liens",
      privacy: "Politique de confidentialité",
      download: "Télécharger l'app",
      madeWith: "Fait avec ❤️ au Cameroun",
      by: "Par",
      rights: "© 2026 Tchopé. Tous droits réservés.",
    },
    privacy: {
      title: "Politique de Confidentialité",
      lastUpdated: "Dernière mise à jour : 17 octobre 2026",
      developer: "Développeur : LNDEV —",
      sections: {
        intro: {
          title: "1. Introduction",
          content:
            "Tchopé est une application mobile de recettes camerounaises. Votre vie privée est importante pour nous. Cette politique explique comment l'application gère vos données.",
          summary:
            "En résumé : Tchopé ne collecte aucune donnée personnelle identifiable. Vos données restent sur votre appareil, sauf lorsque vous utilisez TchopAI, qui envoie vos messages et le contexte utile à notre prestataire d'IA (voir section 8). L'application n'affiche aucune publicité ; les fonctions IA font partie de l'abonnement Tchopé Pro (voir section 5).",
        },
        data: {
          title: "2. Collecte de données",
          intro:
            "Tchopé ne collecte, ne transmet et ne stocke aucune donnée personnelle identifiable (nom, email, téléphone) sur ses serveurs. L'application :",
          items: [
            "Ne requiert aucune création de compte",
            "Ne demande aucune information personnelle (nom, email, numéro de téléphone)",
            "N'utilise aucun service d'analytics ou de tracking",
            "Stocke toutes vos données (favoris, notes, plans de repas, recettes personnelles) sur votre appareil — elles ne sont transmises à un tiers que si vous utilisez TchopAI, qui envoie ce contexte à l'IA pour personnaliser ses réponses (voir section 8)",
            "Permet de consulter les recettes entièrement hors ligne — seules les fonctionnalités IA (TchopAI) nécessitent une connexion",
            "N'affiche aucune publicité et n'intègre aucun SDK publicitaire (aucun identifiant publicitaire n'est lu)",
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
              description: "Lorsque vous envoyez une photo à TchopAI pour analyser un plat ou des ingrédients :",
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
          title: "5. Paiement et Achats — Tchopé Pro",
          intro:
            "Les recettes, le planning manuel, la liste de courses, les notes, les minuteurs et le mode cuisson sont gratuits. Les fonctions d'intelligence artificielle (TchopAI au-delà de 3 messages gratuits, photo, recherche par ingrédients et recherche libre par IA, planning IA, guidage vocal TchopAI Live) font partie de Tchopé Pro, un abonnement mensuel sans engagement, souscrit sans créer de compte.",
          items: [
            "Paiement par le store : le paiement est effectué par l'App Store (Apple) ou Google Play. Nous ne voyons ni ne stockons vos coordonnées bancaires.",
            "Validation de l'abonnement : l'application s'appuie sur RevenueCat, Inc. (États-Unis), notre sous-traitant de gestion des abonnements. RevenueCat reçoit un identifiant anonyme généré par l'application (sans lien avec votre identité), le reçu d'achat transmis par le store et des données techniques (plate-forme, version de l'application, pays du store), uniquement pour valider l'abonnement, le restaurer sur un nouvel appareil et établir des statistiques de ventes agrégées.",
            "Contrôle par notre serveur : quand vous utilisez une fonction IA, l'application envoie aussi cet identifiant anonyme à notre serveur, qui demande à RevenueCat si votre abonnement est actif. Notre serveur garde cette réponse quelques minutes en mémoire et compte les requêtes par identifiant (24 heures au plus) pour appliquer les limites d'usage ; il ne la relie ni à votre identité ni au contenu de vos demandes.",
            "Résiliation : vous pouvez consulter, modifier ou résilier l'abonnement à tout moment dans les réglages de votre compte App Store ou Google Play (l'application y mène depuis Réglages → Tchopé Pro). La résiliation prend effet à la fin de la période en cours.",
            "Messages gratuits : le nombre de messages TchopAI gratuits déjà utilisés est compté sur votre appareil.",
          ],
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
            "Ne sont pas transmises à un tiers, sauf le contexte que vous choisissez d'envoyer à TchopAI (voir section 8)",
            "Peuvent être supprimées à tout moment depuis les paramètres de l'application ou en désinstallant l'application",
          ],
        },
        thirdParty: {
          title: "7. Données de tiers",
          content:
            "L'application charge des images depuis Wikimedia Commons et des miniatures vidéo depuis YouTube pour illustrer les recettes. Ces requêtes sont soumises aux politiques de confidentialité respectives de Wikimedia et Google/YouTube. Lorsque vous choisissez de regarder une vidéo de recette, vous êtes redirigé vers YouTube via votre navigateur. Tchopé n'a aucun contrôle sur les données collectées par YouTube.",
        },
        ai: {
          title: "8. Assistant IA (TchopAI)",
          intro:
            "TchopAI regroupe les fonctionnalités d'intelligence artificielle de Tchopé (chat, recherche IA, plans de repas IA, TchopAI Live). Lorsque, et uniquement lorsque, vous les utilisez, certaines données sont envoyées à notre serveur proxy puis à l'API Claude d'Anthropic afin de générer une réponse :",
          items: [
            "Le texte de vos messages : les questions et instructions que vous saisissez.",
            "Le contexte de l'app : pour personnaliser ses réponses, TchopAI transmet le contexte utile issu de votre appareil — vos favoris, vos recettes enregistrées, votre plan de repas en cours et vos notes.",
            "Les photos : les photos que vous choisissez d'envoyer pour analyse (voir section 3).",
            "Le texte vocal (TchopAI Live) : le texte transcrit de votre voix (voir section 4) ; votre voix elle-même n'est jamais transmise.",
            "Destinataire : Anthropic, PBC (« Claude »), notre prestataire d'IA, dont les serveurs sont situés aux États-Unis. Anthropic traite ces données uniquement pour générer une réponse, ne les utilise pas pour entraîner ses modèles et ne les conserve pas au-delà du traitement.",
            "Consentement : avant votre première utilisation de TchopAI, l'application affiche un écran décrivant ces données et leur destinataire, et recueille votre accord explicite. Aucune donnée n'est envoyée tant que vous n'avez pas accepté.",
            "Confidentialité : ces échanges ne sont reliés à aucun identifiant personnel et ne sont pas revendus. L'historique de vos conversations est conservé localement sur votre appareil.",
          ],
        },
        changes: {
          title: "9. Modifications",
          content:
            "Cette politique de confidentialité peut être mise à jour occasionnellement. Toute modification sera reflétée par la date de mise à jour en haut de ce document. Nous vous encourageons à consulter cette page régulièrement.",
        },
        contact: {
          title: "10. Contact",
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
      openApp: "Open app",
    },
    hero: {
      badge: "100+ recipes",
      title: "Cameroonian cuisine in your pocket",
      subtitle:
        "Discover authentic traditional Cameroonian recipes, filter by region and create your own cookbook. 100% free, 100% offline.",
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
    popular: {
      sectionLabel: "Recipes",
      title: "The great classics of Cameroonian cuisine",
      viewAll: "Browse all 140 Cameroonian recipes →",
    },
    cta: {
      title: "Ready to tchoper?",
      subtitle:
        "Download the free Cameroonian recipes app and cook offline.",
      openWeb: "Open web version",
    },
    download: {
      back: "Back",
      badge: "iPhone · iPad · Android",
      title: "Download Tchopé",
      subtitle:
        "Scan the QR code with your phone's camera, or open your store's link directly.",
      detectedIos: "You're on iPhone or iPad",
      detectedAndroid: "You're on Android",
      openIos: "Open in the App Store",
      openAndroid: "Open in Google Play",
      appStoreDevices: "iPhone and iPad",
      playStoreDevices: "Android phones",
      scan: "Scan to download",
      copy: "Copy link",
      copied: "Link copied!",
      extrasLabel: "Only on mobile",
      extrasTitle: "What you get in the app",
      extras: [
        {
          title: "TchopAI",
          desc: "Your cooking assistant: ask anything, send a photo of your dish.",
        },
        {
          title: "TchopAI Live",
          desc: "Cook with the AI by voice, it guides you step by step.",
        },
        {
          title: "Weekly plan",
          desc: "AI builds your meals and your shopping list automatically.",
        },
        {
          title: "Cooking mode",
          desc: "Steps one at a time, with a timer and voice reading.",
        },
      ],
      webTitle: "Don't want to install?",
      webSubtitle: "All the recipes are also available in your browser.",
      webCta: "Open web version",
    },
    footer: {
      tagline: "Cameroonian cuisine in your pocket.",
      links: "Links",
      privacy: "Privacy Policy",
      download: "Download the app",
      madeWith: "Made with ❤️ in Cameroon",
      by: "By",
      rights: "© 2026 Tchopé. All rights reserved.",
    },
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "Last updated: October 17, 2026",
      developer: "Developer: LNDEV —",
      sections: {
        intro: {
          title: "1. Introduction",
          content:
            "Tchopé is a mobile app for Cameroonian recipes. Your privacy matters to us. This policy explains how the app handles your data.",
          summary:
            "In short: Tchopé does not collect any personally identifiable data. Your data stays on your device, except when you use TchopAI, which sends your messages and relevant context to our AI provider (see section 8). The app shows no ads; the AI features are part of the Tchopé Pro subscription (see section 5).",
        },
        data: {
          title: "2. Data Collection",
          intro:
            "Tchopé does not collect, transmit, or store any personally identifiable data (name, email, phone) on its servers. The app:",
          items: [
            "Does not require any account creation",
            "Does not ask for any personal information (name, email, phone number)",
            "Does not use any analytics or tracking services",
            "Stores all your data (favorites, notes, meal plans, personal recipes) on your device — it is only transmitted to a third party if you use TchopAI, which sends this context to the AI to personalize its answers (see section 8)",
            "Lets you browse recipes entirely offline — only AI features (TchopAI) require a connection",
            "Shows no ads and includes no advertising SDK (no advertising identifier is read)",
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
              description: "When you send a photo to TchopAI to analyze a dish or ingredients:",
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
          title: "5. Payment and Purchases — Tchopé Pro",
          intro:
            "Recipes, manual meal planning, the shopping list, notes, timers and cooking mode are free. The artificial-intelligence features (TchopAI beyond 3 free messages, photos, AI ingredient and free-text search, AI meal planning, TchopAI Live voice guidance) are part of Tchopé Pro, a monthly subscription with no commitment, purchased without creating an account.",
          items: [
            "Payment through the store: payment is handled by the App Store (Apple) or Google Play. We never see or store your payment details.",
            "Subscription validation: the app relies on RevenueCat, Inc. (United States), our subscription-management processor. RevenueCat receives an anonymous identifier generated by the app (not linked to your identity), the purchase receipt passed on by the store and technical data (platform, app version, store country), solely to validate the subscription, restore it on a new device and compile aggregated sales statistics.",
            "Check by our server: when you use an AI feature, the app also sends this anonymous identifier to our server, which asks RevenueCat whether your subscription is active. Our server keeps that answer in memory for a few minutes and counts requests per identifier (for at most 24 hours) to apply usage limits; it links it neither to your identity nor to the content of your requests.",
            "Cancellation: you can review, change or cancel the subscription at any time in your App Store or Google Play account settings (the app links there from Settings → Tchopé Pro). Cancellation takes effect at the end of the current period.",
            "Free messages: the number of free TchopAI messages already used is counted on your device.",
          ],
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
            "Is not transmitted to any third party, except the context you choose to send to TchopAI (see section 8)",
            "Can be deleted at any time from the app settings or by uninstalling the app",
          ],
        },
        thirdParty: {
          title: "7. Third-Party Data",
          content:
            "The app loads images from Wikimedia Commons and video thumbnails from YouTube to illustrate recipes. These requests are subject to the respective privacy policies of Wikimedia and Google/YouTube. When you choose to watch a recipe video, you are redirected to YouTube via your browser. Tchopé has no control over the data collected by YouTube.",
        },
        ai: {
          title: "8. AI Assistant (TchopAI)",
          intro:
            "TchopAI covers Tchopé's artificial-intelligence features (chat, AI search, AI meal plans, TchopAI Live). When, and only when, you use them, certain data is sent to our proxy server and then to Anthropic's Claude API in order to generate a response:",
          items: [
            "The text of your messages: the questions and instructions you type.",
            "App context: to personalize its answers, TchopAI sends relevant context from your device — your favorites, your saved recipes, your current meal plan and your notes.",
            "Photos: the photos you choose to send for analysis (see section 3).",
            "Voice text (TchopAI Live): the transcribed text of your voice (see section 4); your voice itself is never transmitted.",
            "Recipient: Anthropic, PBC (\"Claude\"), our AI provider, whose servers are located in the United States. Anthropic processes this data solely to generate a response, does not use it to train its models, and does not retain it beyond processing.",
            "Consent: before your first use of TchopAI, the app shows a screen describing this data and its recipient, and collects your explicit agreement. No data is sent until you have agreed.",
            "Privacy: these exchanges are not linked to any personal identifier and are not sold. Your conversation history is stored locally on your device.",
          ],
        },
        changes: {
          title: "9. Changes",
          content:
            "This privacy policy may be updated from time to time. Any changes will be reflected by the update date at the top of this document. We encourage you to review this page periodically.",
        },
        contact: {
          title: "10. Contact",
          intro:
            "For any questions regarding this privacy policy:",
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
