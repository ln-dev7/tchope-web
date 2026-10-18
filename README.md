<!-- Ce projet est sous licence GPL-3.0. Voir le fichier LICENSE pour plus de détails. -->

# Tchopé — Website & Web App

Landing page, privacy policy and web version of **Tchopé**, the app for authentic Cameroonian recipes.

**Live:** [tchope.lndev.me](https://tchope.lndev.me)

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript
- [TailwindCSS 4](https://tailwindcss.com/)
- [Framer Motion](https://motion.dev/) for scroll animations
- [Lucide React](https://lucide.dev/) for icons
- [shadcn/ui](https://ui.shadcn.com/) components
- [react-masonry-css](https://github.com/paulcollett/react-masonry-css) for masonry layout

## Features

- Static landing page and recipe pages, plus the AI API of the mobile app (see below)
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

## Web app (`/fr/app`, `/en/app`)

The web version of the mobile app (`../tchope`, the source of truth: `pnpm sync` copies its data, types and translations here):

- Recipes by region, search, recipe pages (adjustable servings, share), cookbook (favorites, own recipes), settings
- **Cuisine avec ce que j'ai**: recipes from the ingredients you have (simple local search, no AI)
- **Mon Plan**: saved plans, meal swap, PDF export, shopping list
- **Notes** (block editor), **cooking mode** (step by step, step timers, read aloud), **timers**

No AI runs on the website: TchopAI, photo analysis, AI search, AI meal planning and TchopAI Live are part of Tchopé Pro
in the mobile app. Every AI entry point opens the "TchopAI is in the app" dialog (`components/app-only.tsx`).

Everything the user creates is kept in the browser (`localStorage`, keys `tchope_*`).

### AI API of the mobile app (`app/api/**`)

Used only by the Tchopé app (≥ 2.0.0); calls from a browser are refused (`lib/server/app-only.ts`).

- `POST /api/claude`: relays requests to the Anthropic API, only allowed models (Haiku 4.5 by default), max 2048 tokens,
  bounded size (`lib/server/claude-policy.ts`)
- `POST /api/fetch-recipe-url`: reads the text of a recipe page pasted in the chat (internal addresses refused)
- `GET /api/pro-status`: diagnostic of the subscription check (no secrets)
- `GET /api/version`: minimum app version (`MIN_APP_VERSION`, `LATEST_APP_VERSION`, `FORCE_UPDATE`)

Tchopé Pro is checked server-side (`lib/server/pro-check.ts`): the app sends its anonymous RevenueCat id, the server asks
the RevenueCat API v2 whether the `tchope_pro` entitlement is active. Only the text chat has a free taste; everything else
requires the subscription. Closed by default: without keys the routes answer 503.

Environment variables (Vercel project settings, `.env` locally): `ANTHROPIC_API_KEY`,
`REVENUECAT_SECRET_KEY` (RevenueCat v2 secret key, read access to customers and project configuration),
`REVENUECAT_PROJECT_ID`, optionally `ALLOWED_MODELS`, `MIN_APP_VERSION`. Tests: `pnpm test:pro`.

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
