/* Version minimale de l'app (components/UpdateModal.tsx de l'app ≥ 2.0.0 l'appelle toutes les 24 h).
   MIN_APP_VERSION (Vercel) : en dessous, l'app propose la mise à jour avec le lien de son store ; FORCE_UPDATE=on la rend
   obligatoire. Sans variable : aucune invitation. Les versions ≤ 1.10 lisent la même route sur tchope-api.vercel.app. */
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export function GET() {
  const min = process.env.MIN_APP_VERSION?.trim() || "0.0.0"
  return NextResponse.json(
    {
      minVersion: min,
      latestVersion: process.env.LATEST_APP_VERSION?.trim() || min,
      forceUpdate: /^(on|true|1)$/i.test(process.env.FORCE_UPDATE?.trim() ?? ""),
    },
    { headers: { "cache-control": "public, max-age=300" } }
  )
}
