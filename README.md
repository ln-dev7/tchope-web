# Tchopé — Landing Page & Privacy Policy

Landing page and privacy policy for **Tchopé**, a mobile app for authentic Cameroonian recipes.

**Live:** [tchope.lndev.me](https://tchope.lndev.me)

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript
- [TailwindCSS 4](https://tailwindcss.com/)
- [Framer Motion](https://motion.dev/) for scroll animations
- [Lucide React](https://lucide.dev/) for icons
- [shadcn/ui](https://ui.shadcn.com/) components
- [react-masonry-css](https://github.com/paulcollett/react-masonry-css) for masonry layout

## Features

- Fully static, no backend
- Bilingual (French / English) with route-based i18n (`/fr`, `/en`)
- Responsive design (mobile-first)
- Screenshot lightbox on click
- Floating glassmorphism header
- Store badges auto-hidden when no link is set

## Project Structure

```
app/
├── layout.tsx                 # Root layout (font, globals)
├── globals.css                # Tailwind theme & custom styles
└── [locale]/
    ├── layout.tsx             # Locale layout (metadata, i18n provider)
    ├── page.tsx               # Landing page
    └── privacy/
        └── page.tsx           # Privacy policy page

components/
├── header.tsx                 # Floating header with nav & language toggle
├── footer.tsx                 # Footer with links
├── store-badges.tsx           # App Store & Google Play badges
├── screenshot-lightbox.tsx    # Fullscreen image lightbox
├── motion-wrapper.tsx         # Framer Motion animation wrappers
└── ui/                        # shadcn/ui components

lib/
├── i18n.ts                    # Translation dictionaries (FR/EN)
├── locale-context.tsx         # React context for locale
├── store-links.ts             # Store URLs config
└── utils.ts                   # cn() utility

middleware.ts                  # Redirects / → /fr

public/
├── brand/                     # Logo assets
├── mockups/                   # App screenshots
└── store/                     # App Store & Play Store badges (SVG, per locale)
```

## i18n

- `/` redirects to `/fr` (default locale)
- `/fr` and `/en` serve the localized landing page
- `/fr/privacy` and `/en/privacy` serve the localized privacy policy
- Language toggle in the header switches between locales via navigation
- All translations live in `lib/i18n.ts`

## Store Links

Edit `lib/store-links.ts` to control which store badges appear:

```ts
export const storeLinks = {
  playStore: "https://play.google.com/store/apps/details?id=com.lndev.tchope",
  appStore: "", // empty = badge hidden
}
```

Store badge SVGs are in `public/store/{apple-store,play-store}/{fr,en}.svg`.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) (redirects to `/fr`).

## Build

```bash
pnpm build
pnpm start
```

## Author

**LNDEV** — [lndev.me](https://lndev.me)
