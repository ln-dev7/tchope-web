import { lookup } from "node:dns/promises"
import { BlockList, isIP } from "node:net"
import { LIMITS, clientIp, isSameOrigin, jsonError, rateLimit } from "@/lib/server/ai-guard"

/**
 * Lit le texte d'une page de recette à partir d'un lien collé dans TchopAI
 * (même rôle que server/api/fetch-recipe-url.ts de l'app mobile).
 * Les adresses internes (localhost, réseau privé, métadonnées cloud) sont refusées,
 * à chaque redirection.
 */

export const runtime = "nodejs"
export const maxDuration = 20

const MAX_REDIRECTS = 3
const MAX_HTML_BYTES = 2_000_000
const MAX_TEXT_CHARS = 4000

/**
 * Plages non publiques. BlockList applique aussi les règles IPv4 aux adresses
 * IPv6 « IPv4-mappées » (::ffff:7f00:1 = 127.0.0.1), quelle que soit leur écriture.
 */
const BLOCKED = new BlockList()
for (const [net, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16],
  ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.88.99.0", 24], ["192.168.0.0", 16],
  ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 3],
] as const) {
  BLOCKED.addSubnet(net, prefix, "ipv4")
}
for (const [net, prefix] of [
  ["::", 96], // ::, ::1 et IPv4-compatibles (::7f00:1)
  ["::ffff:0:0:0", 96], // IPv4 traduites
  ["64:ff9b::", 96], ["64:ff9b:1::", 48], // NAT64 (IPv4 embarquée)
  ["100::", 64], ["2001::", 32], ["2001:db8::", 32], ["2002::", 16], // discard, Teredo, doc, 6to4
  ["fc00::", 7], ["fe80::", 10], ["fec0::", 10], ["ff00::", 8],
] as const) {
  BLOCKED.addSubnet(net, prefix, "ipv6")
}

function isPrivateIp(ip: string): boolean {
  const version = isIP(ip)
  if (version === 0) return true
  return BLOCKED.check(ip, version === 6 ? "ipv6" : "ipv4")
}

async function isPublicUrl(url: URL): Promise<boolean> {
  if (url.protocol !== "http:" && url.protocol !== "https:") return false
  if (url.username || url.password) return false
  if (url.port && url.port !== "80" && url.port !== "443") return false
  const host = url.hostname.replace(/^\[|\]$/g, "")
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local")) return false
  if (isIP(host)) return !isPrivateIp(host)
  try {
    const addresses = await lookup(host, { all: true })
    return addresses.length > 0 && addresses.every((a) => !isPrivateIp(a.address))
  } catch {
    return false
  }
}

/**
 * Retire les blocs <tag>…</tag> comme `/<tag[\s\S]*?<\/tag>/gi`, mais en temps
 * linéaire : la regex paresseuse devient quadratique sur une page piégée
 * (des milliers de « <script » sans fermeture) et bloquerait la fonction.
 */
function stripElements(html: string, tag: string): string {
  const open = new RegExp(`<${tag}`, "gi")
  const close = new RegExp(`</${tag}>`, "gi")
  let out = ""
  let pos = 0
  for (;;) {
    open.lastIndex = pos
    const start = open.exec(html)
    if (!start) break
    close.lastIndex = start.index + tag.length + 1
    const end = close.exec(html)
    if (!end) break // plus aucune fermeture plus loin : la regex d'origine ne retirerait plus rien
    out += html.slice(pos, start.index)
    pos = end.index + end[0].length
  }
  return out + html.slice(pos)
}

function htmlToText(html: string): string {
  let text = html
  for (const tag of ["script", "style", "nav", "footer", "header"]) text = stripElements(text, tag)
  return text
    // [^<>] (et non [^>]) : une balise ne peut pas contenir « < », ce qui garde la regex linéaire
    .replace(/<[^<>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

/** Libère la connexion d'une réponse dont le corps ne sera pas lu. */
async function discard(response: Response) {
  try {
    await response.body?.cancel()
  } catch {
    // déjà fermé
  }
}

async function readLimited(response: Response): Promise<string> {
  const reader = response.body?.getReader()
  if (!reader) return ""
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > MAX_HTML_BYTES) {
      await reader.cancel()
      break
    }
    chunks.push(value)
  }
  return new TextDecoder().decode(Buffer.concat(chunks))
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return jsonError(403, "Forbidden")

  let url: string | undefined
  try {
    const body = (await req.json()) as { url?: unknown }
    url = typeof body.url === "string" ? body.url : undefined
  } catch {
    return jsonError(400, "Invalid JSON")
  }
  if (!url || url.length > 2048) return jsonError(400, "Missing url")

  let current: URL
  try {
    current = new URL(url)
  } catch {
    return jsonError(400, "Invalid URL")
  }

  const wait = rateLimit("fetch-url", clientIp(req), LIMITS.fetchUrl)
  if (wait) return jsonError(429, "Too many requests", { "Retry-After": String(wait) })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!(await isPublicUrl(current))) return jsonError(400, "URL not allowed")
      const response = await fetch(current, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Tchope/1.0)", Accept: "text/html" },
        redirect: "manual",
        signal: controller.signal,
      })
      if (response.status >= 300 && response.status < 400) {
        await discard(response)
        const location = response.headers.get("location")
        if (!location) return jsonError(400, "Bad redirect")
        current = new URL(location, current)
        continue
      }
      if (!response.ok) {
        await discard(response)
        return jsonError(400, `Failed to fetch: ${response.status}`)
      }
      const contentType = response.headers.get("content-type") ?? ""
      if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
        await discard(response)
        return jsonError(400, "URL does not point to an HTML page")
      }
      const text = htmlToText(await readLimited(response))
      const content = text.length > MAX_TEXT_CHARS ? text.slice(0, MAX_TEXT_CHARS) + "..." : text
      return Response.json({ content })
    }
    return jsonError(400, "Too many redirects")
  } catch (error) {
    if ((error as Error)?.name === "AbortError") return jsonError(408, "Request timeout")
    return jsonError(500, "Failed to fetch URL")
  } finally {
    clearTimeout(timeout)
  }
}
