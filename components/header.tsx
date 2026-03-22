"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X, Globe } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useLocale } from "@/lib/locale-context"

export function Header() {
  const { locale, t, switchLocale } = useLocale()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { label: t.nav.features, href: `/${locale}#features` },
    { label: t.nav.screenshots, href: `/${locale}#screenshots` },
  ]

  return (
    <header className="fixed top-0 right-0 left-0 z-50">
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div className="rounded-xl md:rounded-full border border-foreground/5 bg-surface/80 px-5 py-3 shadow-lg shadow-foreground/5 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <Link href={`/${locale}`} className="flex items-center gap-2.5">
              <Image
                src="/brand/logo.png"
                alt="Tchopé"
                width={32}
                height={32}
                className="rounded-[8px]"
              />
              <span className="text-lg font-extrabold tracking-tight text-foreground">
                Tchopé
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
              <button
                onClick={switchLocale}
                className="ml-2 flex items-center gap-1.5 rounded-full border border-foreground/10 px-3 py-1.5 text-xs font-semibold text-foreground/60 transition-all hover:border-primary/30 hover:text-primary"
              >
                <Globe className="size-3.5" />
                {locale === "fr" ? "EN" : "FR"}
              </button>
              <Link
                href={`/${locale}/app`}
                className="ml-1 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-all hover:brightness-110"
              >
                {t.nav.openApp}
              </Link>
              <a
                href={`/${locale}#download`}
                className="ml-1 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-surface transition-all hover:bg-foreground/85"
              >
                {t.nav.download}
              </a>
            </nav>

            {/* Mobile toggle */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={switchLocale}
                className="flex items-center gap-1 rounded-full border border-foreground/10 px-2.5 py-1.5 text-xs font-semibold text-foreground/60"
              >
                <Globe className="size-3.5" />
                {locale === "fr" ? "EN" : "FR"}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="rounded-lg p-1.5 text-foreground transition-colors hover:bg-foreground/5"
              >
                {mobileOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden md:hidden"
              >
                <div className="flex flex-col gap-1 pt-4 pb-2">
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl px-4 py-3 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5"
                    >
                      {item.label}
                    </a>
                  ))}
                  <Link
                    href={`/${locale}/app`}
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 rounded-full bg-primary py-3 text-center text-sm font-semibold text-white"
                  >
                    {t.nav.openApp}
                  </Link>
                  <a
                    href={`/${locale}#download`}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full bg-foreground py-3 text-center text-sm font-semibold text-surface"
                  >
                    {t.nav.download}
                  </a>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
