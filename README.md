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

- Static landing page and recipe pages, plus two small API routes for TchopAI (see below)
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
- **TchopAI** chat (text, photo, recipe links, save a recipe or a note from the answer, history)
- **Cuisine avec ce que j'ai**: recipes from the ingredients you have, or a free-text request (local search when offline)
- **Mon Plan**: AI meal plan for the week, meal swap, saved plans, PDF export, shopping list
- **Notes** (block editor), **cooking mode** (step by step, step timers, read aloud), **timers**, **TchopAI Live** (voice with the Web Speech API, camera)

Everything the user creates is kept in the browser (`localStorage`, keys `tchope_*`).

### TchopAI (API routes)

- `POST /api/claude`: relays requests to the Anthropic API with the server key, only for `claude-haiku-4-5-20251001`, max 2048 tokens
- `POST /api/fetch-recipe-url`: reads the text of a recipe page pasted in the chat (internal addresses refused)

Both only accept calls from the site's own pages (same origin) and are rate-limited per IP (`lib/server/ai-guard.ts`).
They need `TCHOPE_SECRET_KEY` (an Anthropic API key) in `.env` locally and in the Vercel project settings. `ANTHROPIC_API_KEY` also works.

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
