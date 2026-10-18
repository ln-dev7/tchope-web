"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X, Globe, ArrowUpRight } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
export function Header() {
  const { locale, switchLocale } = useLocale()
  const [open, setOpen] = useState(false)
  const fr = locale === "fr"
  const items = [
    { label: fr ? "Comment ça marche" : "How it works", hash: "features" },
    { label: fr ? "Les recettes" : "The recipes", hash: "recipes" },
    { label: fr ? "Questions fréquentes" : "FAQ", hash: "faq" },
  ]
  return (
    <header className="brand-header">
      <a href="#content" className="brand-skip">
        {fr ? "Aller au contenu" : "Skip to content"}
      </a>
      <div className="brand-nav-wrap">
        <Link href={`/${locale}`} className="brand-logo">
          <Image src="/brand/logo.png" alt="" width={40} height={40} />
          <span>Tchopé</span>
        </Link>
        <nav
          aria-label={fr ? "Navigation principale" : "Main navigation"}
          className="brand-desktop-nav"
        >
          {items.map((x) => (
            <Link key={x.hash} href={`/${locale}#${x.hash}`}>
              {x.label}
            </Link>
          ))}
        </nav>
        <div className="brand-nav-actions">
          <button
            onClick={switchLocale}
            aria-label={fr ? "Switch to English" : "Passer en français"}
            className="brand-language"
          >
            <Globe size={16} />
            {fr ? "EN" : "FR"}
          </button>
          <Link
            className="brand-button brand-nav-download"
            href={`/${locale}/download`}
          >
            {fr ? "Télécharger" : "Get the app"}
            <ArrowUpRight size={16} />
          </Link>
          <button
            className="brand-menu-toggle"
            aria-label={
              open
                ? fr
                  ? "Fermer le menu"
                  : "Close menu"
                : fr
                  ? "Ouvrir le menu"
                  : "Open menu"
            }
            aria-expanded={open}
            aria-controls="brand-mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="brand-mobile-menu"
          className="brand-mobile-menu"
          aria-label={fr ? "Navigation mobile" : "Mobile navigation"}
        >
          {items.map((x) => (
            <Link
              key={x.hash}
              href={`/${locale}#${x.hash}`}
              onClick={() => setOpen(false)}
            >
              {x.label}
            </Link>
          ))}
          <Link href={`/${locale}/download`} onClick={() => setOpen(false)}>
            {fr ? "Télécharger Tchopé" : "Download Tchopé"}{" "}
            <ArrowUpRight size={20} />
          </Link>
        </nav>
      )}
    </header>
  )
}
