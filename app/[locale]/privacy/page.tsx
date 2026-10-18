"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLocale } from "@/lib/locale-context"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  const { locale, t } = useLocale()
  const s = t.privacy.sections

  return (
    <div className="brand-site">
      <Header />

      <main id="content" className="brand-legal">
        <div className="brand-container">
          <>
            <Link
              href={`/${locale}`}
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary"
            >
              <ArrowLeft className="size-4" />
              {locale === "fr" ? "Retour" : "Back"}
            </Link>

            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {t.privacy.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
              <span>{t.privacy.lastUpdated}</span>
              <span className="text-foreground/20">|</span>
              <span>
                {t.privacy.developer}{" "}
                <a
                  href="https://lndev.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  lndev.me
                </a>
              </span>
            </div>
          </>

          <div className="mt-14 space-y-12">
            <>
              <Section title={s.intro.title}>
                <p>{s.intro.content}</p>
                <div className="mt-4 rounded-2xl border border-primary/15 bg-tags px-5 py-4">
                  <p className="text-sm font-semibold text-primary">
                    {s.intro.summary}
                  </p>
                </div>
              </Section>
            </>

            <>
              <Section title={s.data.title}>
                <p>{s.data.intro}</p>
                <ul className="mt-4 space-y-2">
                  {s.data.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-muted"
                    >
                      <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-primary/40" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>
            </>

            <>
              <Section title={s.camera.title}>
                <p>{s.camera.intro}</p>
                {s.camera.subsections.map((sub) => (
                  <div key={sub.subtitle} className="mt-5">
                    <p className="text-sm font-semibold text-foreground/80">
                      {sub.subtitle}
                    </p>
                    <p className="mt-1">{sub.description}</p>
                    <ul className="mt-3 space-y-2">
                      {sub.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-sm text-muted"
                        >
                          <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-primary/40" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </Section>
            </>

            <>
              <Section title={s.microphone.title}>
                <p>{s.microphone.intro}</p>
                <ul className="mt-4 space-y-2">
                  {s.microphone.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-muted"
                    >
                      <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-primary/40" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>
            </>

            <>
              <Section title={s.payment.title}>
                <p>{s.payment.intro}</p>
                <ul className="mt-4 space-y-2">
                  {s.payment.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-muted"
                    >
                      <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-primary/40" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>
            </>

            <>
              <Section title={s.storage.title}>
                <p>{s.storage.intro}</p>
                <ul className="mt-4 space-y-2">
                  {s.storage.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-muted"
                    >
                      <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-primary/40" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-sm font-medium text-foreground/70">
                  {locale === "fr" ? "Ces données :" : "This data:"}
                </p>
                <ul className="mt-2 space-y-2">
                  {s.storage.dataInfo.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-muted"
                    >
                      <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-secondary/40" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>
            </>

            <>
              <Section title={s.thirdParty.title}>
                <p>{s.thirdParty.content}</p>
              </Section>
            </>

            <>
              <Section title={s.ai.title}>
                <p>{s.ai.intro}</p>
                <ul className="mt-4 space-y-2">
                  {s.ai.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-muted"
                    >
                      <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-primary/40" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>
            </>

            <>
              <Section title={s.changes.title}>
                <p>{s.changes.content}</p>
              </Section>
            </>

            <>
              <Section title={s.contact.title}>
                <p>{s.contact.intro}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <ContactCard
                    label="Email"
                    value="leonelngoya@gmail.com"
                    href="mailto:leonelngoya@gmail.com"
                  />
                  <ContactCard
                    label="Site"
                    value="lndev.me"
                    href="https://lndev.me"
                  />
                  <ContactCard
                    label="Telegram"
                    value="@ln_dev7"
                    href="https://t.me/ln_dev7"
                  />
                </div>
              </Section>
            </>
          </div>
        </div>
      </main>

      <Footer />
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
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-foreground/70">
        {children}
      </div>
    </section>
  )
}

function ContactCard({
  label,
  value,
  href,
}: {
  label: string
  value: string
  href: string
}) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto") ? undefined : "_blank"}
      rel="noopener noreferrer"
      className="group rounded-2xl border border-foreground/5 bg-surface p-4 transition-colors hover:border-primary/30"
    >
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
        {value}
      </p>
    </a>
  )
}
