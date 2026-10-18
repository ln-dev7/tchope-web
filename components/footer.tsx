"use client"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { StoreBadges } from "@/components/store-badges"
export function Footer() {
  const { locale } = useLocale()
  const fr = locale === "fr"
  return (
    <footer className="brand-footer">
      <div className="brand-container">
        <div className="brand-footer-top">
          <div>
            <p className="brand-eyebrow">
              {fr ? "LA CUISINE, EN PARTAGE" : "GOOD FOOD, SHARED"}
            </p>
            <h2>{fr ? "On passe à table ?" : "Shall we eat?"}</h2>
            <p>
              {fr
                ? "Les saveurs du Cameroun vous accompagnent."
                : "Take the flavours of Cameroon with you."}
            </p>
            <StoreBadges />
          </div>
          <nav aria-label={fr ? "Liens utiles" : "Useful links"}>
            <Link href={`/${locale}/download`}>
              {fr ? "Télécharger l’app" : "Download the app"}
              <ArrowUpRight size={16} />
            </Link>
            <Link href={`/${locale}/privacy`}>
              {fr ? "Confidentialité" : "Privacy"}
            </Link>
            <Link href={`/${locale}/app`}>
              {fr ? "Utiliser la version web" : "Use the web version"}
            </Link>
            <a
              href="https://github.com/ln-dev7/tchope"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
              <ArrowUpRight size={16} />
            </a>
            <a
              href="https://lndev.me"
              target="_blank"
              rel="noopener noreferrer"
            >
              {fr ? "Créé par LNDEV" : "Made by LNDEV"}
              <ArrowUpRight size={16} />
            </a>
          </nav>
        </div>
        <div className="brand-wordmark" aria-hidden="true">
          Tchopé.
        </div>
        <div className="brand-footer-bottom">
          <span>© {new Date().getFullYear()} Tchopé</span>
          <span>
            {fr
              ? "Du Cameroun. Pour toutes les cuisines."
              : "From Cameroon. For every kitchen."}
          </span>
        </div>
      </div>
    </footer>
  )
}
