"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Home,
  Search,
  BookOpen,
  Settings,
  Globe,
  CalendarDays,
  MessageCircleMore,
} from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import type { Locale } from "@/lib/i18n"
import { AppOnlyProvider, useAppOnly } from "@/components/app-only"
import { TimerHost } from "@/components/timer/timer-host"

type NavItem = {
  href: string
  icon: typeof Home
  labelKey:
    | "tabHome"
    | "tabSearch"
    | "tabPlanner"
    | "tabCookbook"
    | "tabSettings"
}

function getNavItems(locale: Locale): NavItem[] {
  return [
    { href: `/${locale}/app`, icon: Home, labelKey: "tabHome" },
    { href: `/${locale}/app/search`, icon: Search, labelKey: "tabSearch" },
    {
      href: `/${locale}/app/planner`,
      icon: CalendarDays,
      labelKey: "tabPlanner",
    },
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

  // Écran plein écran (comme les écrans empilés de l'app mobile) : pas de barre
  // d'onglets en bas ni de bouton TchopAI, pour laisser la place à la cuisine.
  const immersive = /\/app\/cooking-mode(\/|$)/.test(pathname)

  function isActive(href: string) {
    if (href === `/${locale}/app`) {
      return pathname === `/${locale}/app`
    }
    return pathname.startsWith(href)
  }

  return (
    <AppOnlyProvider>
      <div className="tchope-app flex min-h-dvh bg-background dark:bg-dark">
        {/* Sidebar — desktop */}
        <aside className="fixed top-0 left-0 z-40 hidden h-dvh w-[220px] flex-col border-r border-foreground/5 bg-surface px-4 py-6 lg:flex dark:border-white/5 dark:bg-dark-surface">
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
          <nav
            aria-label={
              locale === "fr" ? "Navigation principale" : "Main navigation"
            }
            className="flex flex-1 flex-col gap-1"
          >
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
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
            <div className="mt-auto space-y-1 pt-4">
              <AppAiButton />
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
        <aside className="fixed top-0 left-0 z-40 hidden h-dvh w-[72px] flex-col items-center border-r border-foreground/5 bg-surface py-6 md:flex lg:hidden dark:border-white/5 dark:bg-dark-surface">
          <Link href={`/${locale}`} className="mb-8">
            <Image
              src="/brand/logo.png"
              alt="Tchopé"
              width={32}
              height={32}
              className="rounded-[8px]"
            />
          </Link>
          <nav
            aria-label={
              locale === "fr" ? "Navigation principale" : "Main navigation"
            }
            className="flex flex-1 flex-col items-center gap-2"
          >
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  title={t(item.labelKey)}
                  aria-label={t(item.labelKey)}
                  className={`flex size-11 items-center justify-center rounded-xl transition-colors ${
                    active
                      ? "bg-primary/10 text-primary dark:bg-primary/20"
                      : "text-muted hover:bg-foreground/5 hover:text-foreground dark:text-dark-muted dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  <item.icon className="size-5" />
                </Link>
              )
            })}
            <div className="mt-auto space-y-2 pt-4">
              <AppAiButton compact />
              <Link
                href={`/${locale}`}
                title={locale === "fr" ? "Retour au site" : "Back to site"}
                className="flex size-11 items-center justify-center rounded-xl text-muted transition-colors hover:bg-foreground/5 hover:text-foreground dark:text-dark-muted dark:hover:bg-white/5 dark:hover:text-white"
              >
                <Globe className="size-5" />
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        {immersive ? (
          <main className="h-dvh min-w-0 flex-1 md:ml-[72px] lg:ml-[220px]">
            {children}
          </main>
        ) : (
          <main className="min-h-dvh min-w-0 flex-1 pb-[calc(6rem+env(safe-area-inset-bottom))] md:ml-[72px] md:pb-8 lg:ml-[220px]">
            <div className="mx-auto max-w-2xl px-5 py-7 sm:px-7 md:py-9 lg:max-w-4xl">
              {children}
            </div>
          </main>
        )}

        <TimerHost />

        {/* Bottom tabs — mobile */}
        <nav
          aria-label={
            locale === "fr" ? "Navigation principale" : "Main navigation"
          }
          className={`app-bottom-nav fixed right-0 bottom-0 left-0 z-40 border-t border-foreground/5 bg-surface/90 backdrop-blur-xl md:hidden dark:border-white/5 dark:bg-dark-surface/90 ${immersive ? "hidden" : ""}`}
        >
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
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
    </AppOnlyProvider>
  )
}

function AppAiButton({ compact = false }: { compact?: boolean }) {
  const { openAppOnly } = useAppOnly()
  return (
    <button
      type="button"
      onClick={openAppOnly}
      aria-label="TchopAI"
      title="TchopAI"
      className={`flex min-h-11 cursor-pointer items-center rounded-xl text-primary transition-colors hover:bg-primary/10 ${compact ? "size-11 justify-center" : "w-full gap-3 px-3 py-2.5 text-sm font-medium"}`}
    >
      <MessageCircleMore className="size-5" />
      {!compact && "TchopAI"}
    </button>
  )
}
