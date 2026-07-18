# Plan SEO — Tchopé (tchope-web)

> Audit réalisé le 18 juillet 2026. Chaque constat provient d'un fichier lu dans ce dépôt ou d'une page réellement consultée en ligne.

⚠️ **Signalement hors périmètre SEO mais urgent** : le fichier `.env` à la racine contient une clé API Anthropic en clair (`TCHOPE_SECRET_KEY=sk-ant-...`). Ce fichier est présent sur le disque d'un projet dont le dépôt GitHub (`ln-dev7/tchope-web`) est potentiellement public (licence GPL-3.0, README public). Vérifier si `.env` est bien ignoré par git ET si la clé n'a jamais été commitée ; la faire tourner dans le doute.

## 1. Contexte

- **Produit** : Tchopé, application mobile (Google Play : `com.lndev.tchope`, listing vérifié en ligne) de recettes camerounaises authentiques — 140+ recettes, gratuit, hors ligne. Le site web sert de landing page **et** de version web consultable des recettes (`/[locale]/app/...`).
- **Audience** : Camerounais et diaspora francophone (France, Belgique, Canada, Québec) en premier ; anglophones (diaspora + curieux de cuisine africaine) en second. Action attendue : installer l'app Play Store, ou consulter une recette.
- **Marché / langues** : FR (défaut, `x-default`) + EN. Requêtes cibles majoritairement françaises.
- **Stack** : Next.js 16 App Router, TypeScript, Tailwind 4. Données recettes locales (`data/recipes.ts`, 140 recettes). Déployé sur Vercel.
- **Mode de rendu** : SSG — `generateStaticParams` sur `[locale]` et `[locale]/app/recipe/[id]`, données 100 % statiques. Le contenu est bien présent dans le HTML initial (vérifié via curl sur `/fr` et `/fr/app/recipe/ndole`).
- **URL de production** : https://tchope.lndev.me
- **Indexation** : le site EST indexé — `site:tchope.lndev.me` renvoie de nombreuses pages recettes (FR et EN). En revanche, sur la requête `"tchopé" application recettes camerounaises`, le site n'apparaît pas : notoriété/backlinks quasi nuls.

## 2. État actuel

**Ce qui est en place et fonctionne** (vérifié dans le code ET sur le site en ligne) :
- Métadonnées complètes et propres : `metadataBase`, titles/descriptions localisés, OG + Twitter Cards avec image 1200×630, canonical par page, hreflang `fr`/`en`/`x-default` réciproques (`lib/seo.ts`, `app/[locale]/layout.tsx`).
- JSON-LD riche : `WebSite` + `Organization` sur la home (4 blocs constatés en ligne), `Recipe` + `BreadcrumbList` sur les pages recettes avec ingrédients, étapes, durées ISO — c'est rare chez les concurrents et c'est le principal atout.
- `app/sitemap.ts` dynamique (statiques + 140×2 recettes ×2 locales, avec alternates) et `app/robots.ts` corrects **dans le code**.
- Page 404 correcte (noindex, statut 404), HTTPS, responsive, `lang` sur `<html>`.

**Ce qui est cassé** :
- 🔴 **`/robots.txt`, `/sitemap.xml` et `/manifest.webmanifest` sont inaccessibles en production** : le matcher de `middleware.ts` ne les exclut pas, ils sont donc redirigés en 307 vers `/fr/robots.txt` → **404** (vérifié par curl : `status: 307 → https://tchope.lndev.me/fr/robots.txt`, puis page 404). Google ne peut lire ni le robots ni le sitemap — la découverte des 560+ URLs repose uniquement sur le maillage interne.
- 🟠 Duplication de marque dans le title : `Tchopé — Recettes Camerounaises Authentiques | Tchopé` (le template `%s | Tchopé` du root layout s'applique par-dessus un title qui contient déjà la marque). Constaté sur `/fr` et `/en`.
- 🟠 Images très lourdes servies telles quelles : `public/brand/banner.png` (1,9 Mo) et `banner-en.png` (2 Mo) sont les images OG ; mockups PNG de 0,8 à 2,1 Mo (optimisés via `next/image` à l'affichage, mais les OG sont servies brutes).

**Ce qui manque** :
- H1 de `/fr/app` = « Bienvenue, » — aucune valeur sémantique pour la page hub qui liste les recettes par région.
- Pas de section « recettes populaires » sur la landing → les pages recettes ne reçoivent presque aucun lien interne depuis la page la plus forte du site.
- Pas de FAQ (ni visible ni `FAQPage`) alors que les SERP recettes affichent des blocs People Also Ask.
- Aucune notoriété : introuvable même sur des requêtes proches de la marque.

**Note globale : 7/10** — fondations techniques parmi les meilleures de sa niche, mais un bug de middleware prive Google du sitemap et le site n'a aucune autorité externe.

## 3. Mots-clés cibles

Difficultés estimées qualitativement d'après les SERP réellement consultées (juillet 2026) — aucun volume chiffré inventé.

| Mot-clé | Intention | Difficulté estimée | Page cible | Statut actuel |
|---|---|---|---|---|
| **recette ndolé** (principal) | Info | Moyenne — top 10 = blogs de niche sans schema (recettesafricaine.com, nkosiagro.com, boutiques d'épices) | `/fr/app/recipe/ndole` | Existante, non optimisée éditorialement |
| **recette poulet dg** (principal) | Info | Moyenne — même profil de SERP | `/fr/app/recipe/poulet-dg` | Existante, non optimisée |
| **recette eru / okok / mbongo tchobi / kondré** (principaux, 1 par page) | Info | Faible — très peu de pages dédiées sérieuses | pages recettes correspondantes | Existantes, non optimisées |
| **recettes camerounaises** (principal home) | Info | Élevée — top 10 : 750g, chefsimon, Pinterest, YouTube + blogs établis | `/fr` | Existante, partiellement optimisée (title OK, H1 partiel) |
| cuisine camerounaise (secondaire) | Info | Élevée — mêmes acteurs | `/fr` + `/fr/app` | Partiel |
| **application recettes camerounaises** (principal, requête transactionnelle) | Transactionnelle | Faible — SERP = petites apps Play Store et sites d'APK, aucun acteur fort | `/fr` | Non ciblée explicitement |
| application cuisine africaine (secondaire) | Transactionnelle | Faible-moyenne | `/fr` | Non ciblée |
| **cameroonian recipes** (principal EN) | Info | Moyenne — blogs diaspora anglophone | `/en` | Existante |
| ndole recipe / eru recipe (principaux EN par page) | Info | Faible-moyenne | `/en/app/recipe/*` | Existantes |

⚠️ Alignement d'intention : sur « recettes camerounaises », le top 10 est 100 % contenus (blogs, annuaires de recettes) — la landing « téléchargez l'app » seule ne suffira pas ; c'est la page hub `/fr/app` (liste des recettes) et les pages recettes qui peuvent ranker. La landing doit viser la requête transactionnelle « application recettes camerounaises ».

## 4. Concurrents

| Concurrent | URL | Ce qu'ils font mieux | Faille exploitable |
|---|---|---|---|
| Recettes Africaine | recettesafricaine.com | Ancienneté, large couverture Afrique, rankent sur « recette ndolé » | Pages minces (~600-700 mots), **aucun schema.org Recipe, pas de FAQ** (page ndolé analysée) — battables sur les rich snippets |
| Tchop-Afrik'A Cuisine | toimoietcuisine.com | Niche 100 % camerounaise, rankent sur ndolé | Site daté, HTTP non sécurisé constaté sur certaines URLs, UX faible |
| La Cuisinette de Laurette | lacuisinettedelaurette.fr | Blog perso soigné, section camerounaise qui ranke | Couverture partielle (quelques recettes), pas d'app, pas de version EN |
| La Tendresse en Cuisine | latendresseencuisine.com | Autorité de blog généraliste, page « 12 recettes camerounaises » bien positionnée | Page liste générique — une page par plat avec schema Recipe la dépasse sur les requêtes plat |
| App « Cuisine Camerounaise » | play.google.com/store/apps/details?id=com.cuisinecamerounaise | Concurrent direct sur le Play Store | Aucun site web SEO — tout le trafic web recette est à prendre |

Verrouillage constaté en tête de SERP « recettes camerounaises » : 750g, Chef Simon, Pinterest, YouTube — inatteignables à court terme, d'où la stratégie longue traîne par plat.

## 5. Plan d'action priorisé

| # | Action | Fichiers concernés | Impact | Effort | Priorité |
|---|---|---|---|---|---|
| 1 | Exclure `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `.well-known` du matcher du middleware | `middleware.ts` | **Fort** | S | P0 |
| 2 | Vérifier la propriété dans Google Search Console et soumettre le sitemap | (hors code) | **Fort** | S | P0 |
| 3 | Supprimer la duplication « \| Tchopé » dans les titles | `app/[locale]/layout.tsx` (ou `app/layout.tsx`) | Moyen | S | P1 |
| 4 | Ajouter une section « Recettes populaires » sur la landing avec 8 liens vers les pages recettes | `app/[locale]/page.tsx`, `lib/i18n.ts` | **Fort** | M | P1 |
| 5 | Compresser les images OG et mockups (WebP/PNG optimisé, < 300 Ko) | `public/brand/*.png`, `public/mockups/*.png` | Moyen | S | P1 |
| 6 | H1 et title sémantiques sur le hub `/app` | `app/[locale]/app/page.tsx`, `app/[locale]/app/layout.tsx` | Moyen | S | P1 |
| 7 | Enrichir les 10 recettes les plus recherchées : intro 120 mots, section origine, FAQ 3 questions + `FAQPage` | `data/recipes.ts`, `data/recipes-en.ts`, `app/[locale]/app/recipe/[id]/*` | **Fort** | L | P2 |
| 8 | Cibler « application recettes camerounaises » dans le title/H2 de la landing | `app/[locale]/layout.tsx`, `lib/i18n.ts` | Moyen | S | P2 |
| 9 | Alt descriptifs sur les mockups | `app/[locale]/page.tsx` | Faible | S | P3 |
| 10 | Campagne backlinks (voir §7) | (hors code) | **Fort** | L | P2, en continu |

## 6. Détail des actions

### Action 1 — Débloquer robots.txt et sitemap.xml (P0)
**Problème** : `middleware.ts` redirige toute URL sans préfixe de locale vers `/fr/...`, y compris `/robots.txt` et `/sitemap.xml` → 307 puis 404. Google n'a accès ni aux règles de crawl ni au sitemap des 560+ URLs.
**Correctif** : dans `middleware.ts`, remplacer le matcher par :
```ts
export const config = {
  matcher: [
    "/((?!_next|api|brand|mockups|fonts|store|favicon.ico|app-ads.txt|robots.txt|sitemap.xml|manifest.webmanifest|.well-known).*)",
  ],
}
```
**Vérification** : `curl -I https://tchope.lndev.me/robots.txt` doit renvoyer 200 avec `Content-Type: text/plain`, et `/sitemap.xml` un 200 XML.

### Action 2 — Google Search Console (P0)
Ajouter la propriété `tchope.lndev.me` (validation DNS via le compte gérant `lndev.me`), soumettre `https://tchope.lndev.me/sitemap.xml` (après l'action 1), puis surveiller Couverture → « Pages indexées ». Demander l'inspection d'URL + indexation pour `/fr` et les 10 recettes prioritaires.

### Action 3 — Titles dupliqués (P1)
**Problème** : `app/layout.tsx` définit `title.template: "%s | Tchopé"` et `app/[locale]/layout.tsx` fournit `Tchopé — Recettes Camerounaises Authentiques` → rendu final `... | Tchopé` avec la marque deux fois (constaté en ligne sur /fr et /en).
**Correctif** : dans `generateMetadata` de `app/[locale]/layout.tsx`, retourner `title: { absolute: "Tchopé — Recettes Camerounaises Authentiques" }` (idem EN). Garder le template pour les pages internes (recettes : `Ndolé Royal | Tchopé` est correct).

### Action 4 — Maillage landing → recettes (P1)
**Problème** : la landing (page la plus forte) ne fait aucun lien vers les pages recettes ; elles ne sont découvrables que par le hub `/app` et le sitemap (actuellement cassé).
**Correctif** : dans `app/[locale]/page.tsx`, ajouter après la section screenshots une section « Recettes populaires » (grille de 8 cartes) pointant vers ndolé, poulet DG, eru, mbongo tchobi, okok, kondré, koki, sauce arachide, avec ancres descriptives (« Recette du Ndolé », pas « Voir »), + un lien « Voir les 140 recettes → /fr/app ». Traductions dans `lib/i18n.ts`.

### Action 5 — Poids des images (P1)
`banner.png` (1,9 Mo) et `banner-en.png` (2 Mo) sont les images OG servies brutes à chaque partage ; mockups jusqu'à 2,1 Mo. Recompresser (objectif < 300 Ko par image, PNG optimisé ou JPEG qualité 80 pour les bannières — les OG doivent rester PNG/JPEG, pas de WebP pour compatibilité messageries), et convertir les mockups en WebP.

### Action 6 — Hub /app (P1)
**Problème** : H1 « Bienvenue, » (constaté en ligne sur `/fr/app`) sur la page qui liste 140 recettes par région — la page la plus à même de ranker sur « recettes camerounaises ».
**Correctif** : H1 → « Toutes les recettes camerounaises, région par région » (EN : « All Cameroonian recipes, region by region »), title dédié dans `app/[locale]/app/layout.tsx` : « 140+ Recettes Camerounaises par Région — Tchopé », + un paragraphe d'intro de 60-80 mots au-dessus de la grille.

### Action 7 — Enrichissement éditorial des recettes phares (P2)
**Problème** : les pages recettes ont les données structurées mais peu de texte visible unique (l'intro est courte) ; les concurrents rankent avec 600-700 mots.
**Correctif** : pour les 10 recettes à plus fort potentiel (ndolé, poulet DG, eru, mbongo tchobi, okok, kondré, koki, sauce arachide, achu, foufou manioc) : ajouter dans `data/recipes.ts`/`recipes-en.ts` un champ `longDescription` (120 mots : origine, région, occasions) et un champ `faq` (3 Q/R : substitutions d'ingrédients introuvables en Europe, conservation, accompagnements), rendus dans `recipe-detail.tsx` + bloc `FAQPage` JSON-LD dans `page.tsx`. C'est exactement ce que les People Also Ask des SERP demandent.

### Action 8 — Requête transactionnelle « application » (P2)
Ajouter sur la landing un H2 « L'application de recettes camerounaises, gratuite et hors ligne » et intégrer « application de recettes camerounaises » dans la meta description FR. C'est la requête où la landing est le bon format de page (SERP = apps).

### Action 9 — Alt descriptifs (P3)
Dans `app/[locale]/page.tsx`, les screenshots ont `alt: "Home"`, `"Search"`, etc. Remplacer par des alt descriptifs localisés (« Écran d'accueil de l'app Tchopé montrant les recettes par région »).

## 7. Backlinks

Cibles vérifiées (toutes vues en SERP ou consultées pendant l'audit) :

| Cible | Type | Approche | Effort |
|---|---|---|---|
| Product Hunt (producthunt.com) | Annuaire produit | Launch de l'app avec le site en lien ; catégorie Food & Drink | M |
| AlternativeTo (alternativeto.net) | Annuaire | Créer la fiche Tchopé (alternative aux apps « Cuisine Camerounaise », « Recettes Africaines ») | S |
| Afro Cuisine Magazine (afrocuisinemagazine.com) | Média de niche — publie déjà des recettes camerounaises (article ndolé vu en SERP) | Pitch : « une app gratuite qui préserve 140 recettes traditionnelles camerounaises » — angle patrimoine | M |
| TripConnexion (tripconnexion.com/magazine) | Magazine voyage — a un article ndolé | Pitch guest post « cuisine camerounaise » avec lien | M |
| Les Épices du Mboa (lesepicesdumboa.com) | Boutique + blog camerounais (Québec) | Partenariat croisé : leurs épices citées dans les recettes ↔ lien vers l'app | M |
| Nkosi Agro (nkosiagro.com) | Boutique + blog recettes camerounaises | Même approche partenariat | M |
| r/Cameroon, r/AfricanFood (reddit.com) | Communautés | Participation authentique + partage de l'app (pas de spam : répondre aux questions recettes avec lien vers la page recette précise) | L (continu) |
| Groupes Facebook diaspora camerounaise (« Camerounais de France », etc.) | Communautés | Partage des pages recettes (nofollow mais trafic + notoriété) | L (continu) |
| Chaînes YouTube cuisine camerounaise (playlist « Cuisine Camerounaise » vue en SERP) | Créateurs | Proposer l'app en description contre mise en avant de leurs vidéos sur les pages `/videos` du site (échange de valeur déjà naturel : le site a des pages vidéos par recette) | M |
| Uptodown / Aptoide / Softonic | Agrégateurs d'APK (vus en SERP sur « application recettes ») | Fiches app auto-générées ou à revendiquer — liens faciles | S |

## 8. Suivi

| Métrique | Outil | Fréquence |
|---|---|---|
| Pages indexées, impressions, clics, requêtes | Google Search Console | Hebdomadaire |
| Statut sitemap (URLs découvertes/indexées) | GSC → Sitemaps | Hebdo le 1er mois, puis mensuel |
| Positions sur les 10 requêtes cibles | GSC (filtre requête) ou recherche manuelle en navigation privée | Bimensuel |
| Trafic, pages d'entrée | Vercel Analytics (déjà installé) | Hebdomadaire |
| Core Web Vitals | PageSpeed Insights + rapport CWV de GSC | Mensuel |
| Rich results Recipe (éligibilité) | Test des résultats enrichis Google (search.google.com/test/rich-results) sur 3 pages recettes | Après chaque modif de JSON-LD |

**Délais réalistes** : correction robots/sitemap visible en GSC sous 1-2 semaines ; réindexation complète des 560 URLs : 3-6 semaines ; premières positions longue traîne (« recette okok », « recette kondré ») : 1-3 mois ; requêtes moyennes (« recette ndolé ») : 3-6 mois, conditionnées aux backlinks ; « recettes camerounaises » : 6-12 mois minimum, top 3 improbable sans autorité significative.
