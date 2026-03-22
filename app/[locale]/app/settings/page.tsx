"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Sun,
  Moon,
  Monitor,
  Check,
  Trash2,
  ExternalLink,
  Github,
  Mail,
  Send,
  Shield,
  Heart,
} from "lucide-react"
import { toast } from "sonner"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useFavorites } from "@/stores/favorites"
import { useUserRecipes } from "@/stores/user-recipes"
import { StoreBanner } from "@/components/store-banner"
import { StoreBadges } from "@/components/store-badges"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

type Theme = "light" | "dark" | "system"

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "light"
  return (localStorage.getItem("tchope_theme") as Theme) || "light"
}

function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", isDark)
  localStorage.setItem("tchope_theme", theme)
}

export default function SettingsPage() {
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const router = useRouter()
  const clearFavorites = useFavorites((s) => s.clearAll)
  const clearUserRecipes = useUserRecipes((s) => s.clearAll)
  const [theme, setTheme] = useState<Theme>(getStoredTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  function switchLanguage() {
    const target = locale === "fr" ? "en" : "fr"
    router.push(`/${target}/app/settings`)
  }

  return (
    <div className="space-y-6 pb-4">
      <StoreBanner />

      <h1 className="text-2xl font-extrabold text-foreground dark:text-white">
        {t("settings")}
      </h1>

      {/* Appearance */}
      <Section title={t("appearance")}>
        {([
          { key: "light" as Theme, icon: Sun, label: t("light") },
          { key: "dark" as Theme, icon: Moon, label: t("dark") },
          { key: "system" as Theme, icon: Monitor, label: t("system") },
        ]).map((item) => (
          <button
            key={item.key}
            onClick={() => setTheme(item.key)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 dark:text-white dark:hover:bg-white/5"
          >
            <item.icon className="size-4 text-muted dark:text-dark-muted" />
            <span className="flex-1 text-left">{item.label}</span>
            {theme === item.key && <Check className="size-4 text-primary" />}
          </button>
        ))}
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
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 dark:text-white dark:hover:bg-white/5"
          >
            <span className="flex-1 text-left">{lang.label}</span>
            {locale === lang.key && <Check className="size-4 text-primary" />}
          </button>
        ))}
      </Section>

      {/* Store badges */}
      <Section title={locale === "fr" ? "Télécharger l'app" : "Download the app"}>
        <div className="flex items-center justify-center px-4 py-3">
          <StoreBadges />
        </div>
      </Section>

      {/* Support */}
      <Section title={t("supportMe")}>
        <a
          href="https://ecaefmew.mychariow.shop/prd_3cu1s0"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 dark:text-white dark:hover:bg-white/5"
        >
          <Heart className="size-4 text-red-500" />
          <span className="flex-1">{t("supportSubtitle")}</span>
          <ExternalLink className="size-3.5 text-muted dark:text-dark-muted" />
        </a>
      </Section>

      {/* Data */}
      <Section title={t("data")}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/5"
            >
              <Trash2 className="size-4" />
              {t("clearFavorites")}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("clearConfirm")}</AlertDialogTitle>
              <AlertDialogDescription>{t("clearConfirmMessage")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  clearFavorites()
                  toast.success(locale === "fr" ? "Favoris supprimés" : "Favorites cleared")
                }}
              >
                {t("confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/5"
            >
              <Trash2 className="size-4" />
              {t("clearUserRecipes")}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("clearConfirm")}</AlertDialogTitle>
              <AlertDialogDescription>{t("clearConfirmMessage")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  clearUserRecipes()
                  toast.success(t("allCreationsDeleted"))
                }}
              >
                {t("confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Section>

      {/* Contact */}
      <Section title={t("contactMe")}>
        <SettingsLink href="mailto:leonelngoya@gmail.com" icon={Mail} label="leonelngoya@gmail.com" />
        <SettingsLink href="https://t.me/ln_dev7" icon={Send} label="Telegram" />
      </Section>

      {/* About */}
      <Section title={t("about")}>
        <SettingsLink href="https://lndev.me" icon={ExternalLink} label={t("developer")} suffix="lndev.me" />
        <SettingsLink href="https://github.com/ln-dev7/tchope" icon={Github} label="GitHub" />
        <Link
          href={`/${locale}/privacy`}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 dark:text-white dark:hover:bg-white/5"
        >
          <Shield className="size-4 text-muted dark:text-dark-muted" />
          <span className="flex-1">{t("privacyPolicy")}</span>
        </Link>
      </Section>

      <div className="pb-4 text-center text-xs text-muted dark:text-dark-muted">
        <p>{t("madeWith")}</p>
        <p className="mt-1">
          <a href="https://lndev.me" target="_blank" rel="noopener noreferrer" className="font-medium text-primary">
            lndev.me
          </a>
        </p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
        {title}
      </h2>
      <div className="rounded-2xl bg-surface dark:bg-dark-surface p-2">{children}</div>
    </section>
  )
}

function SettingsLink({
  href,
  icon: Icon,
  label,
  suffix,
}: {
  href: string
  icon: typeof ExternalLink
  label: string
  suffix?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 dark:text-white dark:hover:bg-white/5"
    >
      <Icon className="size-4 text-muted dark:text-dark-muted" />
      <span className="flex-1">{label}</span>
      {suffix && <span className="text-xs text-muted dark:text-dark-muted">{suffix}</span>}
    </a>
  )
}
