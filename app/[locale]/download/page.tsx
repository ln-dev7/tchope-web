"use client"
import { useSyncExternalStore } from "react"
import Image from "next/image"
import Link from "next/link"
import { WifiOff, BookOpen, Globe } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StoreQrCard } from "@/components/store-qr-card"
import { useLocale } from "@/lib/locale-context"
import { storeLinks } from "@/lib/store-links"
const subscribe = () => () => {}
function detectPlatform() {
  const ua = navigator.userAgent
  return /iPhone|iPad|iPod/i.test(ua) ||
    (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
    ? "ios"
    : /Android/i.test(ua)
      ? "android"
      : null
}
export default function DownloadPage() {
  const { locale } = useLocale()
  const fr = locale === "fr"
  const platform = useSyncExternalStore(subscribe, detectPlatform, () => null)
  return (
    <div className="brand-site">
      <Header />
      <main id="content" className="brand-download">
        <div className="brand-container">
          <div className="brand-download-heading">
            <p className="brand-eyebrow">
              {fr ? "VOTRE CUISINE VOUS SUIT" : "YOUR KITCHEN, WITH YOU"}
            </p>
            <h1>
              {fr ? (
                <>
                  Un goût de chez nous.
                  <br />
                  <em>Toujours à portée de main.</em>
                </>
              ) : (
                <>
                  A taste of home.
                  <br />
                  <em>Always close at hand.</em>
                </>
              )}
            </h1>
            <p>
              {fr
                ? "Retrouvez Tchopé sur votre téléphone ou votre tablette. Choisissez votre store, ou scannez le QR code depuis votre appareil."
                : "Take Tchopé with you on your phone or tablet. Choose your store, or scan the QR code with your device."}
            </p>
          </div>
          <div className="brand-download-grid">
            <div className="brand-download-image">
              <Image
                src={`/store-screens/${locale}/01-home.webp`}
                width={1206}
                height={2622}
                alt={
                  fr
                    ? "Accueil de Tchopé, nouveau design"
                    : "Tchopé home screen"
                }
                priority
                sizes="330px"
              />
            </div>
            <div>
              <div className="brand-download-stores">
                <StoreQrCard
                  store="app-store"
                  name="App Store"
                  devices="iPhone & iPad"
                  href={storeLinks.appStore}
                  highlighted={platform === "ios"}
                />
                <StoreQrCard
                  store="play-store"
                  name="Google Play"
                  devices="Android"
                  href={storeLinks.playStore}
                  highlighted={platform === "android"}
                />
              </div>
              <Link className="brand-web-link" href={`/${locale}/app`}>
                {fr
                  ? "Vous préférez le navigateur ? Accéder à la version web."
                  : "Prefer your browser? Open the web version."}
              </Link>
            </div>
          </div>
          <div className="brand-download-extras">
            <article>
              <WifiOff />
              <h2>{fr ? "Même hors ligne." : "Even offline."}</h2>
              <p>
                {fr
                  ? "Consultez les recettes intégrées sur mobile sans connexion. Les images distantes, vidéos et fonctions IA utilisent Internet."
                  : "Read the included mobile recipes without a connection. Remote images, videos and AI features use the internet."}
              </p>
            </article>
            <article>
              <BookOpen />
              <h2>{fr ? "À votre façon." : "Make it yours."}</h2>
              <p>
                {fr
                  ? "Favoris, recettes personnelles, notes et planning : gardez vos habitudes de cuisine à portée de main."
                  : "Keep your favourites, personal recipes, notes and meal plans close at hand."}
              </p>
            </article>
            <article>
              <Globe />
              <h2>{fr ? "Dans votre langue." : "In your language."}</h2>
              <p>
                {fr
                  ? "Français ou anglais, thème clair ou sombre : choisissez ce qui vous convient dans les réglages."
                  : "French or English, light or dark: choose what works for you in settings."}
              </p>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
