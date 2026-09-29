import { create } from "zustand"
import { persist } from "zustand/middleware"

/** Photos envoyées à TchopAI par jour (chat et Live), comme services/imageQuota.ts sur mobile. */
export const IMAGE_DAILY_LIMIT = 20

function today(): string {
  const now = new Date()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${m}-${d}`
}

type ImageQuotaStore = {
  count: number
  date: string
  increment: () => void
}

export const useImageQuotaStore = create<ImageQuotaStore>()(
  persist(
    (set, get) => ({
      count: 0,
      date: today(),
      increment: () => {
        const d = today()
        const { count, date } = get()
        set({ count: date === d ? count + 1 : 1, date: d })
      },
    }),
    { name: "tchope_image_quota" }
  )
)

/** Quota du jour : le compteur repart à zéro quand la date change. */
export function useImageQuota() {
  const { count, date, increment } = useImageQuotaStore()
  const used = date === today() ? count : 0
  const remaining = Math.max(0, IMAGE_DAILY_LIMIT - used)
  return { used, limit: IMAGE_DAILY_LIMIT, remaining, canSend: used < IMAGE_DAILY_LIMIT, increment }
}
