"use client"

import Image from "next/image"
import Link from "next/link"
import { useLocale } from "@/lib/locale-context"

export function Footer() {
  const { locale, t } = useLocale()

  return (
    <footer className="bg-dark text-white">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-8">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Col 1 */}
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/brand/logo.png"
                alt="Tchopé"
                width={30}
                height={30}
                className="rounded-[8px]"
              />
              <span className="text-lg font-extrabold tracking-tight">
                Tchopé
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-dark-muted">
              {t.footer.tagline}
            </p>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-dark-muted">
              {t.footer.links}
            </p>
            <Link
              href={`/${locale}/privacy`}
              className="text-sm text-dark-muted transition-colors hover:text-white"
            >
              {t.footer.privacy}
            </Link>
            <a
              href="https://github.com/ln-dev7/tchope"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-dark-muted transition-colors hover:text-white"
            >
              GitHub
            </a>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-3 md:items-end">
            <p className="text-sm text-dark-muted">{t.footer.madeWith}</p>
            <p className="text-sm text-dark-muted">
              {t.footer.by}{" "}
              <a
                href="https://lndev.me"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white transition-colors hover:text-primary"
              >
                lndev.me
              </a>
            </p>
          </div>
        </div>

        <div className="mt-14 border-t border-white/8 pt-6 text-center text-xs text-dark-muted">
          {t.footer.rights}
        </div>
      </div>
    </footer>
  )
}
