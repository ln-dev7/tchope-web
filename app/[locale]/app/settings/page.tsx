"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Sun,
  Moon,
  Monitor,
  Check,
  Trash2,
  ExternalLink,
  Heart,
  Github,
  Mail,
  Send,
  Shield,
} from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useFavorites } from "@/hooks/use-favorites"
import { useUserRecipes } from "@/hooks/use-user-recipes"

type Theme = "light" | "dark" | "system"

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "light"
  return (localStorage.getItem("tchope_theme") as Theme) || "light"
}

function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", isDark)
  localStorage.setItem("tchope_theme", theme)
}

export default function SettingsPage() {
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const router = useRouter()
  const { clearAll: clearFavorites } = useFavorites()
  const { clearAll: clearUserRecipes } = useUserRecipes()
  const [theme, setTheme] = useState<Theme>(getStoredTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  function switchLanguage() {
    const target = locale === "fr" ? "en" : "fr"
    router.push(`/${target}/app/settings`)
  }

  function handleClearFavorites() {
    if (confirm(t("clearConfirmMessage"))) {
      clearFavorites()
    }
  }

  function handleClearRecipes() {
    if (confirm(t("clearConfirmMessage"))) {
      clearUserRecipes()
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold text-foreground dark:text-white">
        {t("settings")}
      </h1>

      {/* Appearance */}
      <Section title={t("appearance")}>
        <div className="space-y-1">
          <p className="mb-2 text-xs font-medium text-muted dark:text-dark-muted">
            {t("theme")}
          </p>
          {([
            { key: "light" as Theme, icon: Sun, label: t("light") },
            { key: "dark" as Theme, icon: Moon, label: t("dark") },
            { key: "system" as Theme, icon: Monitor, label: t("system") },
          ]).map((item) => (
            <button
              key={item.key}
              onClick={() => setTheme(item.key)}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 dark:text-white dark:hover:bg-white/5"
            >
              <item.icon className="size-4 text-muted dark:text-dark-muted" />
              <span className="flex-1 text-left">{item.label}</span>
              {theme === item.key && (
                <Check className="size-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </Section>

      {/* Language */}
      <Section title={t("language")}>
        {[
          { key: "fr", label: t("french") },
          { key: "en", label: t("english") },
        ].map((lang) => (
          <button
            key={lang.key}
            onClick={lang.key !== locale ? switchLanguage : undefined}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 dark:text-white dark:hover:bg-white/5"
          >
            <span className="flex-1 text-left">{lang.label}</span>
            {locale === lang.key && (
              <Check className="size-4 text-primary" />
            )}
          </button>
        ))}
      </Section>

      {/* Data */}
      <Section title={t("data")}>
        <button
          onClick={handleClearFavorites}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/5"
        >
          <Trash2 className="size-4" />
          {t("clearFavorites")}
        </button>
        <button
          onClick={handleClearRecipes}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/5"
        >
          <Trash2 className="size-4" />
          {t("clearUserRecipes")}
        </button>
      </Section>

      {/* Contact */}
      <Section title={t("contactMe")}>
        <SettingsLink
          href="mailto:leonelngoya@gmail.com"
          icon={Mail}
          label="leonelngoya@gmail.com"
        />
        <SettingsLink
          href="https://t.me/ln_dev7"
          icon={Send}
          label="Telegram"
        />
      </Section>

      {/* About */}
      <Section title={t("about")}>
        <div className="space-y-1">
          <div className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-foreground dark:text-white">
            <span>{t("version")}</span>
            <span className="text-muted dark:text-dark-muted">1.0.0</span>
          </div>
          <SettingsLink
            href="https://lndev.me"
            icon={ExternalLink}
            label={t("developer")}
            suffix="lndev.me"
          />
          <SettingsLink
            href="https://github.com/ln-dev7/tchope"
            icon={Github}
            label="GitHub"
          />
          <SettingsLink
            href={`/${locale}/privacy`}
            icon={Shield}
            label={t("privacyPolicy")}
            external={false}
          />
        </div>
      </Section>

      {/* Footer */}
      <div className="pb-4 text-center text-xs text-muted dark:text-dark-muted">
        <p>{t("madeWith")}</p>
        <p className="mt-1">
          <a
            href="https://lndev.me"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary"
          >
            LNDEV.ME
          </a>
        </p>
      </div>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
        {title}
      </h2>
      <div className="rounded-2xl bg-surface dark:bg-dark-surface">
        {children}
      </div>
    </section>
  )
}

function SettingsLink({
  href,
  icon: Icon,
  label,
  suffix,
  external = true,
}: {
  href: string
  icon: typeof ExternalLink
  label: string
  suffix?: string
  external?: boolean
}) {
  const Tag = external ? "a" : "a"
  return (
    <Tag
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 dark:text-white dark:hover:bg-white/5"
    >
      <Icon className="size-4 text-muted dark:text-dark-muted" />
      <span className="flex-1">{label}</span>
      {suffix && (
        <span className="text-xs text-muted dark:text-dark-muted">
          {suffix}
        </span>
      )}
    </Tag>
  )
}
