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
      lastUpdated: "Dernière mise à jour : 16 juillet 2026",
      developer: "Développeur : LNDEV —",
      sections: {
        intro: {
          title: "1. Introduction",
          content:
            "Tchopé est une application mobile de recettes camerounaises. Votre vie privée est importante pour nous. Cette politique explique comment l'application gère vos données.",
          summary:
            "En résumé : Tchopé ne collecte aucune donnée personnelle identifiable. Vos données restent sur votre appareil, sauf lorsque vous utilisez TchopAI, qui envoie vos messages et le contexte utile à notre prestataire d'IA (voir section 9). L'application affiche des annonces via Google AdMob et certaines fonctionnalités IA se débloquent en visionnant une publicité récompensée (voir section 8).",
        },
        data: {
          title: "2. Collecte de données",
          intro:
            "Tchopé ne collecte, ne transmet et ne stocke aucune donnée personnelle identifiable (nom, email, téléphone) sur ses serveurs. L'application :",
          items: [
            "Ne requiert aucune création de compte",
            "Ne demande aucune information personnelle (nom, email, numéro de téléphone)",
            "N'utilise aucun service d'analytics ou de tracking",
            "Stocke toutes vos données (favoris, notes, plans de repas, recettes personnelles) sur votre appareil — elles ne sont transmises à un tiers que si vous utilisez TchopAI, qui envoie ce contexte à l'IA pour personnaliser ses réponses (voir section 9)",
            "Permet de consulter les recettes entièrement hors ligne — seules les fonctionnalités IA (TchopAI) et l'affichage des annonces nécessitent une connexion",
            "Affiche des annonces via Google AdMob : le SDK publicitaire collecte certaines données techniques détaillées à la section 8",
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
          title: "5. Paiement et Achats",
          intro:
            "Tchopé est entièrement gratuit et ne propose aucun achat intégré, abonnement ou licence. Les fonctionnalités IA (TchopAI Chat, Recherche IA, Meal Plan IA, TchopAI Live) se débloquent gratuitement en visionnant des publicités récompensées (voir section 8).",
          items: [
            "Aucune donnée bancaire : Tchopé ne collecte, ne stocke et ne traite aucune donnée bancaire ou financière. Aucune donnée de paiement ne transite par l'application.",
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
            "Sont stockées sur votre appareil",
            "Ne sont pas transmises à un tiers, sauf le contexte que vous choisissez d'envoyer à TchopAI (voir section 9)",
            "Peuvent être supprimées à tout moment depuis les paramètres de l'application ou en désinstallant l'application",
          ],
        },
        thirdParty: {
          title: "7. Données de tiers",
          content:
            "L'application charge des images depuis Wikimedia Commons et des miniatures vidéo depuis YouTube pour illustrer les recettes. Ces requêtes sont soumises aux politiques de confidentialité respectives de Wikimedia et Google/YouTube. Lorsque vous choisissez de regarder une vidéo de recette, vous êtes redirigé vers YouTube via votre navigateur. Tchopé n'a aucun contrôle sur les données collectées par YouTube.",
        },
        ads: {
          title: "8. Publicité (Google AdMob)",
          intro:
            "Tchopé affiche des bannières publicitaires et propose des publicités récompensées (visionnées volontairement pour débloquer les fonctionnalités IA), fournies par Google AdMob. À cette fin, le SDK Google Mobile Ads intégré à l'application collecte et partage avec Google les données suivantes :",
          items: [
            "Identifiant publicitaire de l'appareil (Advertising ID) : utilisé pour diffuser les annonces, limiter leur répétition et prévenir la fraude",
            "Interactions avec les annonces : impressions et clics sur les bannières, à des fins de mesure des performances publicitaires",
            "Données de diagnostic : informations techniques liées au fonctionnement du SDK publicitaire",
          ],
          dataInfo: [
            "Annonces non personnalisées : Tchopé demande uniquement des annonces non personnalisées. Leur contenu est choisi selon le contexte (application, langue, région) et non selon un profil publicitaire.",
            "Vous pouvez réinitialiser ou supprimer votre identifiant publicitaire à tout moment dans les paramètres de votre téléphone (Paramètres > Confidentialité > Annonces).",
          ],
          policies: "Pour en savoir plus, consultez la politique de confidentialité de",
        },
        ai: {
          title: "9. Assistant IA (TchopAI)",
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
          title: "10. Modifications",
          content:
            "Cette politique de confidentialité peut être mise à jour occasionnellement. Toute modification sera reflétée par la date de mise à jour en haut de ce document. Nous vous encourageons à consulter cette page régulièrement.",
        },
        contact: {
          title: "11. Contact",
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
      lastUpdated: "Last updated: July 16, 2026",
      developer: "Developer: LNDEV —",
      sections: {
        intro: {
          title: "1. Introduction",
          content:
            "Tchopé is a mobile app for Cameroonian recipes. Your privacy matters to us. This policy explains how the app handles your data.",
          summary:
            "In short: Tchopé does not collect any personally identifiable data. Your data stays on your device, except when you use TchopAI, which sends your messages and relevant context to our AI provider (see section 9). The app shows ads via Google AdMob, and some AI features are unlocked by watching a rewarded ad (see section 8).",
        },
        data: {
          title: "2. Data Collection",
          intro:
            "Tchopé does not collect, transmit, or store any personally identifiable data (name, email, phone) on its servers. The app:",
          items: [
            "Does not require any account creation",
            "Does not ask for any personal information (name, email, phone number)",
            "Does not use any analytics or tracking services",
            "Stores all your data (favorites, notes, meal plans, personal recipes) on your device — it is only transmitted to a third party if you use TchopAI, which sends this context to the AI to personalize its answers (see section 9)",
            "Lets you browse recipes entirely offline — only AI features (TchopAI) and ad display require a connection",
            "Displays ads via Google AdMob: the advertising SDK collects certain technical data detailed in section 8",
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
          title: "5. Payment and Purchases",
          intro:
            "Tchopé is entirely free and offers no in-app purchases, subscriptions, or licenses. The AI features (TchopAI Chat, AI Search, AI Meal Plan, TchopAI Live) are unlocked for free by watching rewarded ads (see section 8).",
          items: [
            "No financial data: Tchopé does not collect, store, or process any banking or financial data. No payment data passes through the application.",
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
            "Is stored on your device",
            "Is not transmitted to any third party, except the context you choose to send to TchopAI (see section 9)",
            "Can be deleted at any time from the app settings or by uninstalling the app",
          ],
        },
        thirdParty: {
          title: "7. Third-Party Data",
          content:
            "The app loads images from Wikimedia Commons and video thumbnails from YouTube to illustrate recipes. These requests are subject to the respective privacy policies of Wikimedia and Google/YouTube. When you choose to watch a recipe video, you are redirected to YouTube via your browser. Tchopé has no control over the data collected by YouTube.",
        },
        ads: {
          title: "8. Advertising (Google AdMob)",
          intro:
            "Tchopé displays ad banners and offers rewarded ads (watched voluntarily to unlock AI features), served by Google AdMob. For this purpose, the Google Mobile Ads SDK embedded in the app collects and shares the following data with Google:",
          items: [
            "Device advertising identifier (Advertising ID): used to serve ads, cap their frequency, and prevent fraud",
            "Ad interactions: banner impressions and clicks, for ad performance measurement",
            "Diagnostic data: technical information related to the operation of the advertising SDK",
          ],
          dataInfo: [
            "Non-personalized ads: Tchopé only requests non-personalized ads. Their content is selected based on context (app, language, region), not on an advertising profile.",
            "You can reset or delete your advertising identifier at any time in your phone settings (Settings > Privacy > Ads).",
          ],
          policies: "For more information, see the privacy policy of",
        },
        ai: {
          title: "9. AI Assistant (TchopAI)",
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
          title: "10. Changes",
          content:
            "This privacy policy may be updated from time to time. Any changes will be reflected by the update date at the top of this document. We encourage you to review this page periodically.",
        },
        contact: {
          title: "11. Contact",
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
