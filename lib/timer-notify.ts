/**
 * Notifications du navigateur pour la fin des minuteurs (équivalent de
 * scheduleTimerNotification dans context/TimerContext.tsx sur mobile).
 *
 * La permission est demandée une seule fois, au premier démarrage d'un
 * minuteur (donc pendant un clic) ; on n'affiche une notification que si
 * l'utilisateur l'a acceptée.
 */

function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window
}

/** Demande la permission si elle n'a jamais été donnée ni refusée. */
export function requestTimerNotificationPermission(): void {
  if (!notificationsSupported()) return
  if (Notification.permission !== "default") return
  try {
    const result = Notification.requestPermission()
    // Anciennes versions de Safari : API à callback, sans promesse.
    if (result && typeof result.catch === "function") result.catch(() => {})
  } catch {
    // Navigateur qui refuse la demande hors contexte sécurisé, etc.
  }
}

export function canShowTimerNotification(): boolean {
  return notificationsSupported() && Notification.permission === "granted"
}

type TimerNotification = {
  title: string
  body: string
  /** Identifiant du minuteur : remplace une notification précédente du même minuteur. */
  tag: string
  /** Page à ouvrir quand on touche la notification. */
  url: string
  /** Navigation interne (router.push) ; à défaut, chargement classique de `url`. */
  onOpen?: () => void
}

/**
 * Affiche la notification. `new Notification()` n'existe pas sur Chrome
 * Android : on passe alors par le service worker s'il y en a un.
 */
export function showTimerNotification({ title, body, tag, url, onOpen }: TimerNotification): void {
  if (!canShowTimerNotification()) return
  const options: NotificationOptions = {
    body,
    tag,
    icon: "/brand/logo.png",
    badge: "/brand/logo.png",
    data: { url },
  }
  try {
    const notification = new Notification(title, options)
    notification.onclick = () => {
      window.focus()
      if (onOpen) onOpen()
      else if (window.location.pathname + window.location.search !== url) window.location.assign(url)
      notification.close()
    }
  } catch {
    if (!("serviceWorker" in navigator)) return
    navigator.serviceWorker
      .getRegistration()
      .then((registration) => registration?.showNotification(title, options))
      .catch(() => {})
  }
}
