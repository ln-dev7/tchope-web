/**
 * Sons des minuteurs (les mêmes fichiers que le mobile : assets/sounds →
 * public/sounds). Tout est créé à la demande, jamais pendant le rendu serveur.
 *
 * Les navigateurs bloquent le son tant que l'utilisateur n'a pas interagi avec
 * la page : on « amorce » donc l'alarme pendant un clic (démarrage d'un
 * minuteur) pour que Safari iOS accepte de la jouer plus tard, et toutes les
 * erreurs de lecture sont ignorées (la notification et le toast restent).
 */

const ALARM_SRC = "/sounds/alarm.mp3"
const TICK_SRC = "/sounds/tick.mp3"

/** Nombre de répétitions de l'alarme (le fichier dure ~1,5 s). */
const ALARM_REPEATS = 3

let alarm: HTMLAudioElement | null = null
let tick: HTMLAudioElement | null = null
let alarmPlaysLeft = 0
let primed = false

function canUseAudio(): boolean {
  return typeof window !== "undefined" && typeof Audio !== "undefined"
}

function getAlarm(): HTMLAudioElement | null {
  if (!canUseAudio()) return null
  if (!alarm) {
    alarm = new Audio(ALARM_SRC)
    alarm.preload = "auto"
    alarm.volume = 1
    alarm.addEventListener("ended", () => {
      if (!alarm) return
      alarmPlaysLeft -= 1
      if (alarmPlaysLeft > 0) {
        alarm.currentTime = 0
        alarm.play().catch(() => {
          alarmPlaysLeft = 0
        })
      }
    })
  }
  return alarm
}

function getTick(): HTMLAudioElement | null {
  if (!canUseAudio()) return null
  if (!tick) {
    tick = new Audio(TICK_SRC)
    tick.preload = "auto"
    tick.volume = 0.3
  }
  return tick
}

/**
 * À appeler dans un gestionnaire de clic : débloque la lecture audio pour la
 * suite (Safari iOS n'autorise un élément audio qu'après une première lecture
 * déclenchée par l'utilisateur).
 */
export function primeTimerAudio(): void {
  if (primed) return
  const a = getAlarm()
  const t = getTick()
  if (!a || !t) return
  primed = true
  for (const el of [a, t]) {
    const volume = el.volume
    el.muted = true
    el.play()
      .then(() => {
        el.pause()
        el.currentTime = 0
        el.muted = false
        el.volume = volume
      })
      .catch(() => {
        el.muted = false
        primed = false
      })
  }
}

/** Joue l'alarme de fin de minuteur (répétée quelques fois). */
export function playTimerAlarm(): void {
  const a = getAlarm()
  if (!a) return
  alarmPlaysLeft = ALARM_REPEATS
  a.muted = false
  a.currentTime = 0
  a.play().catch(() => {
    alarmPlaysLeft = 0
  })
}

export function stopTimerAlarm(): void {
  alarmPlaysLeft = 0
  if (alarm && !alarm.paused) {
    alarm.pause()
    alarm.currentTime = 0
  }
}

/** Tic-tac de la page minuteur (une fois par seconde). */
export function playTimerTick(): void {
  const t = getTick()
  if (!t) return
  // Pas de tic-tac par-dessus l'alarme.
  if (alarm && !alarm.paused) return
  t.muted = false
  t.currentTime = 0
  t.play().catch(() => {})
}
