"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import Masonry from "react-masonry-css"
import { Map, Search, Heart, WifiOff, ChefHat, Flame, ArrowRight, Check, Sparkles, Crown } from "lucide-react"
import NumberFlow from "@number-flow/react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StoreBadges } from "@/components/store-badges"
import { ScreenshotLightbox } from "@/components/screenshot-lightbox"
import {
  FadeInUp,
  ScaleIn,
  StaggerContainer,
  FadeInUpChild,
} from "@/components/motion-wrapper"
import { useLocale } from "@/lib/locale-context"
import type { LucideIcon } from "lucide-react"

const screenshots = [
  { src: "/mockups/home.png", alt: "Home" },
  { src: "/mockups/search.png", alt: "Search" },
  { src: "/mockups/recipe.png", alt: "Recipe" },
  { src: "/mockups/cookbook.png", alt: "Cookbook" },
  { src: "/mockups/recipe-video.png", alt: "Video" },
  { src: "/mockups/settings.png", alt: "Settings" },
]

const masonryBreakpoints = {
  default: 2,
  640: 1,
}

function PricingSection() {
  const { t } = useLocale()
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section id="pricing" className="bg-background">
      <div className="mx-auto max-w-5xl px-6 py-20 lg:py-28">
        <FadeInUp>
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-primary">
            {t.pricing.sectionLabel}
          </p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t.pricing.title}
          </h2>
        </FadeInUp>

        <StaggerContainer className="mt-14 grid items-start gap-6 md:grid-cols-2 lg:gap-8">
          {/* Free Card */}
          <FadeInUpChild className="order-2 md:order-1">
            <div className="rounded-3xl border border-foreground/5 bg-surface p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-tags text-primary">
                <ChefHat className="size-5" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-foreground">
                {t.pricing.free}
              </h3>
              <p className="mt-1.5 text-sm text-muted">
                {t.pricing.freeDesc}
              </p>

              <div className="mt-6">
                <span className="text-4xl font-extrabold tracking-tight text-foreground">
                  {t.pricing.freePrice}
                </span>
                <span className="ml-2 text-sm text-muted">
                  {t.pricing.freePeriod}
                </span>
              </div>

              <ul className="mt-8 space-y-3">
                {t.pricing.freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-secondary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#download"
                className="mt-8 block rounded-full border border-foreground/10 py-3 text-center text-sm font-bold text-foreground transition-all hover:bg-foreground/5"
              >
                {t.pricing.freeCta}
              </a>
            </div>
          </FadeInUpChild>

          {/* Plus Card */}
          <FadeInUpChild className="order-1 md:order-2">
            <div className="relative rounded-3xl border-2 border-primary bg-surface p-8 shadow-xl shadow-primary/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/15">
              {/* Popular badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white shadow-lg">
                  <Sparkles className="size-3" />
                  {t.pricing.popular}
                </span>
              </div>

              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-white">
                <Crown className="size-5" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-foreground">
                {t.pricing.plus}
              </h3>
              <p className="mt-1.5 text-sm text-muted">
                {t.pricing.plusDesc}
              </p>

              {/* Toggle */}
              <div className="mt-6 flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsYearly(false)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    !isYearly
                      ? "bg-primary text-white shadow-md"
                      : "bg-tags text-muted hover:text-foreground"
                  }`}
                >
                  {t.pricing.monthly}
                </button>
                <button
                  type="button"
                  onClick={() => setIsYearly(true)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    isYearly
                      ? "bg-primary text-white shadow-md"
                      : "bg-tags text-muted hover:text-foreground"
                  }`}
                >
                  {t.pricing.yearly}
                </button>
                {isYearly && (
                  <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary inline-block">
                    {t.pricing.plusSave}
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-baseline gap-1">
                <NumberFlow
                  value={isYearly ? 20000 : 2000}
                  format={{ useGrouping: true }}
                  className="text-4xl font-extrabold tracking-tight text-foreground [font-variant-numeric:tabular-nums]"
                />
                <span className="text-4xl font-extrabold tracking-tight text-foreground">
                  {" FCFA"}
                </span>
                <span className="ml-1 text-sm text-muted">
                  {isYearly ? t.pricing.plusPeriodYearly : t.pricing.plusPeriodMonthly}
                </span>
              </div>

              <ul className="mt-8 space-y-3">
                {t.pricing.plusFeatures.map((feature, i) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-foreground">
                    <Check className={`mt-0.5 size-4 shrink-0 ${i === 0 ? "text-secondary" : "text-primary"}`} />
                    <span className={i === 0 ? "" : "font-medium"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={isYearly ? "https://ecaefmew.mychariow.shop/prd_eg9w2m" : "https://ecaefmew.mychariow.shop/prd_nty5tx"}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 block rounded-full bg-primary py-3 text-center text-sm font-bold text-white transition-all hover:brightness-110"
              >
                {t.pricing.plusCta}
              </a>
            </div>
          </FadeInUpChild>
        </StaggerContainer>
      </div>
    </section>
  )
}

export default function Home() {
  const { locale, t } = useLocale()
  const [lightbox, setLightbox] = useState<{
    src: string
    alt: string
  } | null>(null)

  const features: {
    icon: LucideIcon
    title: string
    desc: string
    accent?: boolean
    tall?: boolean
  }[] = [
    {
      icon: Map,
      title: t.features.regionTitle,
      desc: t.features.regionDesc,
      tall: true,
    },
    {
      icon: Search,
      title: t.features.searchTitle,
      desc: t.features.searchDesc,
    },
    {
      icon: Heart,
      title: t.features.favTitle,
      desc: t.features.favDesc,
      accent: true,
    },
    {
      icon: WifiOff,
      title: t.features.offlineTitle,
      desc: t.features.offlineDesc,
      tall: true,
    },
  ]

  return (
    <>
      <Header />

      {/* Hero — white background, pt to account for floating header */}
      <section className="relative overflow-hidden bg-surface">
        <div className="pointer-events-none absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-primary/6 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-secondary/4 blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 pt-28 pb-20 lg:flex-row lg:gap-16 lg:pt-36 lg:pb-28">
          <div className="flex-1 text-center lg:text-left">
            <FadeInUp>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-tags px-4 py-1.5">
                <ChefHat className="size-4 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  {t.hero.badge}
                </span>
                <Flame className="size-3.5 text-primary/60" />
              </div>
            </FadeInUp>

            <FadeInUp delay={0.1}>
              <h1 className="text-[2.5rem] leading-[1.1] font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {t.hero.title}
              </h1>
            </FadeInUp>

            <FadeInUp delay={0.2}>
              <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg lg:mx-0">
                {t.hero.subtitle}
              </p>
            </FadeInUp>

            <FadeInUp delay={0.3}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Link
                  href={`/${locale}/app`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-all hover:brightness-110"
                >
                  {t.nav.openApp}
                  <ArrowRight className="size-4" />
                </Link>
                <StoreBadges />
              </div>
            </FadeInUp>
          </div>

          <FadeInUp delay={0.2} className="relative shrink-0">
            <div className="relative">
              <div className="absolute inset-0 -z-10 translate-y-4 scale-90 rounded-[3rem] bg-primary/20 blur-2xl" />
              <button
                type="button"
                onClick={() =>
                  setLightbox({ src: "/mockups/home.png", alt: "Tchopé app" })
                }
                className="cursor-pointer"
              >
                <Image
                  src="/mockups/home.png"
                  alt="Tchopé app"
                  width={280}
                  height={560}
                  className="w-[240px] rounded-[2.5rem] shadow-2xl transition-transform duration-300 hover:scale-[1.02] sm:w-[270px] lg:w-[300px]"
                  priority
                />
              </button>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Features — Masonry */}
      <section id="features" className="bg-background">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:py-28">
          <FadeInUp>
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-primary">
              {t.features.sectionLabel}
            </p>
            <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {t.features.title}
            </h2>
          </FadeInUp>

          <StaggerContainer className="mt-16">
            <Masonry
              breakpointCols={masonryBreakpoints}
              className="masonry-grid"
              columnClassName="masonry-grid_column"
            >
              {features.map((f) => (
                <FadeInUpChild key={f.title}>
                  <div
                    className={`group rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                      f.accent
                        ? "border-primary/20 bg-gradient-to-br from-primary/10 via-tags to-surface"
                        : "border-foreground/5 bg-surface"
                    } ${f.tall ? "p-8 pb-12" : "p-7"}`}
                  >
                    <div
                      className={`flex size-12 items-center justify-center rounded-2xl transition-colors ${
                        f.accent
                          ? "bg-primary text-white"
                          : "bg-tags text-primary group-hover:bg-primary group-hover:text-white"
                      }`}
                    >
                      <f.icon className="size-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-foreground">
                      {f.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted">
                      {f.desc}
                    </p>
                  </div>
                </FadeInUpChild>
              ))}
            </Masonry>
          </StaggerContainer>
        </div>
      </section>

      {/* Screenshots — Grid display, click to enlarge */}
      <section id="screenshots" className="bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <FadeInUp>
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-primary">
              {t.screenshots.sectionLabel}
            </p>
            <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {t.screenshots.title}
            </h2>
          </FadeInUp>

          <StaggerContainer className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6 lg:gap-5">
            {screenshots.map((m, i) => (
              <FadeInUpChild key={m.alt}>
                <button
                  type="button"
                  onClick={() => setLightbox(m)}
                  className="group w-full cursor-pointer"
                  style={{
                    transform: `translateY(${i % 2 === 0 ? 0 : 12}px)`,
                  }}
                >
                  <Image
                    src={m.src}
                    alt={m.alt}
                    width={260}
                    height={520}
                    className="w-full rounded-[1.5rem] shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl sm:rounded-[2rem]"
                  />
                </button>
              </FadeInUpChild>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Lightbox */}
      <ScreenshotLightbox
        src={lightbox?.src ?? ""}
        alt={lightbox?.alt ?? ""}
        open={!!lightbox}
        onClose={() => setLightbox(null)}
      />

      {/* Stats */}
      <section className="relative overflow-hidden bg-primary">
        <div className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-[200px] w-[200px] rounded-full bg-black/10 blur-3xl" />

        <StaggerContainer className="relative mx-auto flex max-w-4xl flex-col items-center justify-around gap-12 px-6 py-20 text-center text-white md:flex-row md:gap-0">
          {[
            { value: "10", label: t.stats.regions },
            { value: "2", label: t.stats.languages },
            { value: "100%", label: t.stats.free },
          ].map((stat) => (
            <FadeInUpChild key={stat.label}>
              <p className="text-6xl font-extrabold tracking-tight md:text-7xl">
                {stat.value}
              </p>
              <p className="mt-3 text-sm font-medium text-white/80">
                {stat.label}
              </p>
            </FadeInUpChild>
          ))}
        </StaggerContainer>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* CTA */}
      <section id="download" className="bg-background">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <ScaleIn>
            <div className="rounded-[2rem] border border-foreground/5 bg-surface px-8 py-14 shadow-2xl shadow-foreground/5 sm:px-14">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {t.cta.title}
              </h2>
              <p className="mt-4 text-base text-muted sm:text-lg">
                {t.cta.subtitle}
              </p>
              <div className="mt-8 flex flex-col items-center gap-4">
                <Link
                  href={`/${locale}/app`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white transition-all hover:brightness-110"
                >
                  {t.cta.openWeb}
                  <ArrowRight className="size-4" />
                </Link>
                <StoreBadges />
              </div>
            </div>
          </ScaleIn>
        </div>
      </section>

      <Footer />
    </>
  )
}
