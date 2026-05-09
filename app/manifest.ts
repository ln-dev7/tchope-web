import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tchopé — Recettes Camerounaises",
    short_name: "Tchopé",
    description:
      "Recettes traditionnelles camerounaises authentiques. 100% gratuit, 100% hors ligne.",
    start_url: "/fr",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#E07A2F",
    lang: "fr-FR",
    categories: ["food", "lifestyle"],
    icons: [
      {
        src: "/brand/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
