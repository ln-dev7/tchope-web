/**
 * Protection des routes IA (/api/claude, /api/fetch-recipe-url).
 *
 * - Origine : seules les pages du site lui-même peuvent appeler ces routes
 *   (en-tête Origin, ou Referer, dont l'hôte doit être celui de la requête).
 *   Ça bloque les autres sites et les appels « nus » sans en-tête ; un script
 *   qui falsifie ses en-têtes reste freiné par la limite par IP.
 * - Limite par IP : fenêtre glissante en mémoire. Sur Vercel, chaque instance a
 *   sa propre mémoire : c'est un frein raisonnable, pas un quota exact.
 */

import { isIP } from "node:net"

type Bucket = { hits: number[] }

const buckets = new Map<string, Bucket>()
let lastSweep = Date.now()

export type Limit = { max: number; windowMs: number }

export const LIMITS = {
  /** Requêtes texte vers Claude (chat, recherche IA, planning, Live). */
  claude: [
    { max: 20, windowMs: 60_000 },
    { max: 300, windowMs: 24 * 60 * 60_000 },
  ],
  /** Requêtes avec photo (en plus des limites ci-dessus). */
  image: [
    { max: 5, windowMs: 60_000 },
    { max: 30, windowMs: 24 * 60 * 60_000 },
  ],
  /** Lecture d'une page de recette à partir d'un lien. */
  fetchUrl: [
    { max: 10, windowMs: 60_000 },
    { max: 100, windowMs: 24 * 60 * 60_000 },
  ],
} satisfies Record<string, Limit[]>

function sweep(now: number) {
  if (now - lastSweep < 5 * 60_000) return
  lastSweep = now
  const oldest = now - 24 * 60 * 60_000
  for (const [key, bucket] of buckets) {
    bucket.hits = bucket.hits.filter((t) => t > oldest)
    if (bucket.hits.length === 0) buckets.delete(key)
  }
}

/** Renvoie le nombre de secondes à attendre si une limite est dépassée, sinon 0 (et compte la requête). */
export function rateLimit(scope: string, ip: string, limits: Limit[]): number {
  const now = Date.now()
  sweep(now)
  const key = `${scope}:${ip}`
  const bucket = buckets.get(key) ?? { hits: [] }
  for (const { max, windowMs } of limits) {
    const inWindow = bucket.hits.filter((t) => t > now - windowMs)
    if (inWindow.length >= max) {
      const retry = Math.ceil((inWindow[0] + windowMs - now) / 1000)
      return Math.max(retry, 1)
    }
  }
  bucket.hits.push(now)
  buckets.set(key, bucket)
  return 0
}

/**
 * Préfixe /64 d'une adresse IPv6 : un seul abonné dispose en général de tout
 * un /64, il pourrait sinon changer d'adresse à chaque requête pour échapper
 * à la limite.
 */
function ipv6Prefix64(ip: string): string {
  const [head, tail] = ip.toLowerCase().split("::")
  const left = head ? head.split(":") : []
  const right = tail ? tail.split(":") : []
  const groups =
    tail === undefined ? left : [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right]
  return `${groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, "")).join(":")}::/64`
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
  const ip = forwarded || req.headers.get("x-real-ip")?.trim() || ""
  if (!ip) return "unknown"
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip)
  if (mapped) return mapped[1]
  return isIP(ip) === 6 ? ipv6Prefix64(ip) : ip
}

/** true si l'appel vient d'une page servie par ce même site. */
export function isSameOrigin(req: Request): boolean {
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0].trim()
  const host = (forwardedHost || req.headers.get("host") || "").toLowerCase()
  if (!host) return false
  const source = req.headers.get("origin") ?? req.headers.get("referer")
  if (!source) return false
  try {
    return new URL(source).host.toLowerCase() === host
  } catch {
    return false
  }
}

export function jsonError(status: number, error: string, headers?: Record<string, string>) {
  return Response.json({ error }, { status, headers })
}
