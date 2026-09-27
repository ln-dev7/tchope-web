"use client"

import { useSyncExternalStore } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChefHat,
  Globe,
  Mic,
  Smartphone,
  Sparkles,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StoreQrCard } from "@/components/store-qr-card"
import {
  FadeInUp,
  FadeInUpChild,
  ScaleIn,
  StaggerContainer,
} from "@/components/motion-wrapper"
import { useLocale } from "@/lib/locale-context"
import { storeLinks } from "@/lib/store-links"

type Platform = "ios" | "android" | null

// The platform never changes during a visit: nothing to subscribe to.
const subscribe = () => () => {}

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios"
  // iPadOS 13+ presents itself as a Mac with a touch screen
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return "ios"
  if (/Android/i.test(ua)) return "android"
  return null
}

const extraIcons: LucideIcon[] = [Sparkles, Mic, CalendarDays, ChefHat]

export default function DownloadPage() {
  const { locale, t } = useLocale()
  const d = t.download
  // null on the server and during hydration, then the visitor's platform
  const platform = useSyncExternalStore(subscribe, detectPlatform, () => null)

  const stores = [
    {
      store: "app-store" as const,
      name: "App Store",
      devices: d.appStoreDevices,
      href: storeLinks.appStore,
      platform: "ios" as const,
    },
    {
      store: "play-store" as const,
      name: "Google Play",
      devices: d.playStoreDevices,
      href: storeLinks.playStore,
      platform: "android" as const,
    },
  ].filter((s) => !!s.href)

  const detected = stores.find((s) => s.platform === platform)

  return (
    <>
      <Header />

      <main>
        {/* Hero + stores */}
        <section className="relative overflow-hidden bg-surface">
          <div className="pointer-events-none absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-primary/6 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-secondary/4 blur-3xl" />

          <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-14 px-6 pt-28 pb-20 lg:flex-row lg:items-center lg:gap-16 lg:pt-36 lg:pb-28">
            <div className="w-full flex-1">
              <FadeInUp>
                <Link
                  href={`/${locale}`}
                  className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary"
                >
                  <ArrowLeft className="size-4" />
                  {d.back}
                </Link>
              </FadeInUp>

              <div className="text-center lg:text-left">
                <FadeInUp>
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-tags px-4 py-1.5">
                    <Smartphone className="size-4 text-primary" />
                    <span className="text-xs font-semibold text-primary">
                      {d.badge}
                    </span>
                  </div>
                </FadeInUp>

                <FadeInUp delay={0.1}>
                  <h1 className="text-[2.5rem] leading-[1.1] font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {d.title}
                  </h1>
                </FadeInUp>

                <FadeInUp delay={0.2}>
                  <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg lg:mx-0">
                    {d.subtitle}
                  </p>
                </FadeInUp>
              </div>

              {/* On a phone: one big button for the right store */}
              {detected && (
                <FadeInUp delay={0.25}>
                  <div className="mt-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-tags to-surface p-5 text-center sm:p-6 lg:text-left">
                    <p className="text-sm font-semibold text-foreground">
                      {platform === "ios" ? d.detectedIos : d.detectedAndroid}
                    </p>
                    <a
                      href={detected.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white transition-all hover:brightness-110 sm:w-auto"
                    >
                      {platform === "ios" ? d.openIos : d.openAndroid}
                      <ArrowRight className="size-4" />
                    </a>
                  </div>
                </FadeInUp>
              )}

              <StaggerContainer className="mt-10 grid gap-5 sm:grid-cols-2">
                {stores.map((s) => (
                  <FadeInUpChild key={s.store}>
                    <StoreQrCard
                      store={s.store}
                      name={s.name}
                      devices={s.devices}
                      href={s.href}
                      highlighted={s.platform === platform}
                    />
                  </FadeInUpChild>
                ))}
              </StaggerContainer>
            </div>

            <FadeInUp delay={0.2} className="relative hidden shrink-0 lg:block">
              <div className="relative">
                <div className="absolute inset-0 -z-10 translate-y-4 scale-90 rounded-[3rem] bg-primary/20 blur-2xl" />
                <Image
                  src="/mockups/home.png"
                  alt="Tchopé app"
                  width={280}
                  height={560}
                  className="w-[300px] rounded-[2.5rem] shadow-2xl"
                  priority
                />
              </div>
            </FadeInUp>
          </div>
        </section>

        {/* Mobile-only features */}
        <section className="bg-background">
          <div className="mx-auto max-w-5xl px-6 py-20 lg:py-24">
            <FadeInUp>
              <p className="text-center text-sm font-semibold tracking-widest text-primary uppercase">
                {d.extrasLabel}
              </p>
              <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {d.extrasTitle}
              </h2>
            </FadeInUp>

            <StaggerContainer className="mt-12 grid gap-5 sm:grid-cols-2">
              {d.extras.map((x, i) => {
                const Icon = extraIcons[i]
                return (
                  <FadeInUpChild key={x.title}>
                    <div className="flex h-full gap-4 rounded-3xl border border-foreground/5 bg-surface p-6">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-tags text-primary">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">
                          {x.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted">
                          {x.desc}
                        </p>
                      </div>
                    </div>
                  </FadeInUpChild>
                )
              })}
            </StaggerContainer>
          </div>
        </section>

        {/* Web version */}
        <section className="bg-background">
          <div className="mx-auto max-w-3xl px-6 pb-24 text-center">
            <ScaleIn>
              <div className="rounded-[2rem] border border-foreground/5 bg-surface px-8 py-12 shadow-2xl shadow-foreground/5 sm:px-14">
                <Globe className="mx-auto size-8 text-primary" />
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  {d.webTitle}
                </h2>
                <p className="mt-3 text-base text-muted">{d.webSubtitle}</p>
                <Link
                  href={`/${locale}/app`}
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white transition-all hover:brightness-110"
                >
                  {d.webCta}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </ScaleIn>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
