/* Routes réservées à l'app mobile Tchopé (app/api/claude, app/api/fetch-recipe-url) : le site n'a plus aucune IA
   (17 oct. 2026, components/app-only.tsx). Comme travora/lib/app-only.ts : un navigateur envoie toujours `Origin` sur un
   POST fetch (et `Sec-Fetch-Mode`, souvent `Referer`) ; le fetch natif de l'app n'en envoie aucun. Ce n'est pas une
   protection contre un script (curl passe) : le vrai contrôle est l'abonnement vérifié (lib/server/pro-check.ts). */
export function isBrowserRequest(headers: Headers): boolean {
  return Boolean(headers.get("origin") || headers.get("referer") || headers.get("sec-fetch-mode"))
}
