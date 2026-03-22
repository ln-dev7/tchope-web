"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Home, Search, BookOpen, Settings, Globe } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import type { Locale } from "@/lib/i18n"

type NavItem = {
  href: string
  icon: typeof Home
  labelKey: "tabHome" | "tabSearch" | "tabCookbook" | "tabSettings"
}

function getNavItems(locale: Locale): NavItem[] {
  return [
    { href: `/${locale}/app`, icon: Home, labelKey: "tabHome" },
    { href: `/${locale}/app/search`, icon: Search, labelKey: "tabSearch" },
    {
      href: `/${locale}/app/cookbook`,
      icon: BookOpen,
      labelKey: "tabCookbook",
    },
    {
      href: `/${locale}/app/settings`,
      icon: Settings,
      labelKey: "tabSettings",
    },
  ]
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const pathname = usePathname()
  const navItems = getNavItems(locale)

  function isActive(href: string) {
    if (href === `/${locale}/app`) {
      return pathname === `/${locale}/app`
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="flex min-h-dvh bg-background dark:bg-dark">
      {/* Sidebar — desktop */}
      <aside className="fixed top-0 left-0 z-40 hidden h-dvh w-[220px] flex-col border-r border-foreground/5 bg-surface px-4 py-6 dark:border-white/5 dark:bg-dark-surface lg:flex">
        <Link
          href={`/${locale}/app`}
          className="mb-8 flex items-center gap-2.5 px-2"
        >
          <Image
            src="/brand/logo.png"
            alt="Tchopé"
            width={32}
            height={32}
            className="rounded-[8px]"
          />
          <span className="text-lg font-extrabold tracking-tight text-foreground dark:text-white">
            Tchopé
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "text-muted hover:bg-foreground/5 hover:text-foreground dark:text-dark-muted dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                <item.icon className="size-5" />
                {t(item.labelKey)}
              </Link>
            )
          })}
          <div className="mt-auto pt-4">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-foreground/5 hover:text-foreground dark:text-dark-muted dark:hover:bg-white/5 dark:hover:text-white"
            >
              <Globe className="size-5" />
              {locale === "fr" ? "Retour au site" : "Back to site"}
            </Link>
          </div>
        </nav>
      </aside>

      {/* Sidebar — tablet (icons only) */}
      <aside className="fixed top-0 left-0 z-40 hidden h-dvh w-[72px] flex-col items-center border-r border-foreground/5 bg-surface py-6 dark:border-white/5 dark:bg-dark-surface md:flex lg:hidden">
        <Link href={`/${locale}/app`} className="mb-8">
          <Image
            src="/brand/logo.png"
            alt="Tchopé"
            width={32}
            height={32}
            className="rounded-[8px]"
          />
        </Link>
        <nav className="flex flex-1 flex-col items-center gap-2">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={t(item.labelKey)}
                className={`flex size-10 items-center justify-center rounded-xl transition-colors ${
                  active
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "text-muted hover:bg-foreground/5 hover:text-foreground dark:text-dark-muted dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                <item.icon className="size-5" />
              </Link>
            )
          })}
          <div className="mt-auto pt-4">
            <Link
              href={`/${locale}`}
              title={locale === "fr" ? "Retour au site" : "Back to site"}
              className="flex size-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-foreground/5 hover:text-foreground dark:text-dark-muted dark:hover:bg-white/5 dark:hover:text-white"
            >
              <Globe className="size-5" />
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="min-h-dvh pb-20 md:ml-[72px] lg:ml-[220px] w-full">
        <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6 md:py-6 lg:max-w-4xl">{children}</div>
      </main>

      {/* Bottom tabs — mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-foreground/5 bg-surface/90 backdrop-blur-xl dark:border-white/5 dark:bg-dark-surface/90 md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted dark:text-dark-muted"
                }`}
              >
                <item.icon className="size-5" />
                {t(item.labelKey)}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
