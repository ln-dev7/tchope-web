"use client"

import { useEffect } from "react"
import { AnimatePresence, motion, useReducedMotion, useSpring, type Transition } from "framer-motion"
import { Hourglass, Mic, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LiveState } from "@/hooks/use-live-cooking"

type Props = {
  state: LiveState
  /** Niveau du micro 0 → 1 (écoute). */
  volume: number
  className?: string
}

/** Couleur de l'orbe par état (mêmes teintes que l'app mobile, clair/sombre). */
const PALETTE: Record<LiveState, string> = {
  idle: "[--orb:#E8762A] dark:[--orb:#F59E42]",
  listening: "[--orb:#E8762A] dark:[--orb:#F59E42]",
  thinking: "[--orb:#F97F06] dark:[--orb:#FFB347]",
  speaking: "[--orb:#0A6A1D] dark:[--orb:#4CAF50]",
}

const mix = (percent: number) => `color-mix(in srgb, var(--orb) ${percent}%, transparent)`

const EASE_IN_OUT = [0.42, 0, 0.58, 1] as const

function orbMotion(state: LiveState, reduce: boolean): { animate: { scale: number | number[] }; transition: Transition } {
  if (reduce) return { animate: { scale: 1 }, transition: { duration: 0.3 } }
  switch (state) {
    case "idle":
      return {
        animate: { scale: [1, 1.02] },
        transition: { duration: 2, repeat: Infinity, repeatType: "mirror", ease: EASE_IN_OUT },
      }
    case "thinking":
      return {
        animate: { scale: [0.95, 1.05] },
        transition: { duration: 0.6, repeat: Infinity, repeatType: "mirror", ease: EASE_IN_OUT },
      }
    case "speaking":
      return {
        animate: { scale: [0.98, 1.08] },
        transition: { duration: 0.5, repeat: Infinity, repeatType: "mirror", ease: EASE_IN_OUT },
      }
    default:
      return { animate: { scale: 1 }, transition: { duration: 0.2 } }
  }
}

function ringMotion(
  state: LiveState,
  reduce: boolean
): { animate: { opacity: number; scale: number | number[] }; transition: Transition } {
  const fade = { duration: 0.3 }
  switch (state) {
    case "listening":
      return { animate: { opacity: 0.4, scale: 1 }, transition: fade }
    case "thinking":
      return reduce
        ? { animate: { opacity: 0.6, scale: 1 }, transition: fade }
        : {
            animate: { opacity: 0.6, scale: [0.95, 1.1] },
            transition: {
              opacity: fade,
              scale: { duration: 0.8, repeat: Infinity, repeatType: "mirror", ease: EASE_IN_OUT },
            },
          }
    case "speaking":
      return reduce
        ? { animate: { opacity: 0.5, scale: 1 }, transition: fade }
        : {
            animate: { opacity: 0.5, scale: [0.96, 1.12] },
            transition: {
              opacity: fade,
              scale: { duration: 0.6, repeat: Infinity, repeatType: "mirror", ease: EASE_IN_OUT },
            },
          }
    default:
      return { animate: { opacity: 0, scale: 1 }, transition: fade }
  }
}

/**
 * Orbe vocale de TchopAI Live (équivalent de VoiceOrb.tsx) :
 * repos = respiration lente, écoute = suit le volume du micro,
 * réflexion = pulsation + arc qui tourne, parole = pulsation + ondes.
 */
export function VoiceOrb({ state, volume, className }: Props) {
  const reduce = useReducedMotion() ?? false
  const volumeScale = useSpring(1, { damping: 12, stiffness: 200 })
  const ringVolume = useSpring(1, { damping: 15, stiffness: 180 })

  // Écoute : l'orbe grossit avec la voix.
  useEffect(() => {
    const listening = state === "listening"
    volumeScale.set(listening ? 1 + volume * 0.25 : 1)
    ringVolume.set(listening ? 1 + volume * 0.15 : 1)
  }, [state, volume, volumeScale, ringVolume])

  const orb = orbMotion(state, reduce)
  const ring = ringMotion(state, reduce)
  const isIdle = state === "idle"
  const showWaves = !reduce && (state === "listening" || state === "speaking")

  const Icon = state === "thinking" ? Hourglass : state === "speaking" ? Volume2 : Mic

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        PALETTE[state],
        className
      )}
      aria-hidden
    >
      {/* Halo */}
      <motion.div
        className="absolute inset-[8%] rounded-full blur-2xl"
        style={{ background: "var(--orb)" }}
        initial={false}
        animate={{ opacity: isIdle ? 0 : state === "listening" ? 0.25 + volume * 0.35 : 0.3 }}
        transition={{ duration: 0.4 }}
      />

      {/* Anneau (suit le volume en écoute) */}
      <motion.div className="absolute inset-0" style={{ scale: ringVolume }}>
        <motion.div
          className="size-full rounded-full border-2"
          style={{ backgroundColor: mix(22), borderColor: mix(40) }}
          initial={false}
          animate={ring.animate}
          transition={ring.transition}
        />
      </motion.div>

      {/* Ondes (écoute et parole) */}
      {showWaves &&
        [0, 1].map((i) => (
          <motion.span
            key={`${state}-${i}`}
            className="absolute inset-[10%] rounded-full border-2"
            style={{ borderColor: mix(55) }}
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.45, opacity: 0 }}
            transition={{
              duration: state === "speaking" ? 1.6 : 2.2,
              repeat: Infinity,
              delay: i * (state === "speaking" ? 0.8 : 1.1),
              ease: "easeOut",
            }}
          />
        ))}

      {/* Arc de réflexion */}
      {state === "thinking" && (
        <motion.div
          className="absolute inset-[4%] rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent 0deg, transparent 200deg, var(--orb) 360deg)",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
          }}
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 1, rotate: reduce ? 0 : 360 }}
          transition={{
            opacity: { duration: 0.3 },
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          }}
        />
      )}

      {/* Orbe */}
      <motion.div className="relative size-[80%]" style={{ scale: volumeScale }}>
        <motion.div
          className={cn(
            "flex size-full items-center justify-center rounded-full transition-[background,box-shadow] duration-500",
            isIdle &&
              "border border-foreground/10 bg-white text-muted shadow-[0_10px_30px_-12px_rgba(0,0,0,0.18)] dark:border-transparent dark:bg-[#3A3A3A] dark:text-white dark:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]",
            !isIdle && "text-white"
          )}
          style={
            isIdle
              ? undefined
              : {
                  background:
                    "radial-gradient(circle at 32% 26%, color-mix(in srgb, var(--orb) 55%, white) 0%, var(--orb) 55%, color-mix(in srgb, var(--orb) 78%, black) 100%)",
                  boxShadow:
                    "0 18px 50px -12px color-mix(in srgb, var(--orb) 70%, transparent), inset 0 -10px 24px rgba(0,0,0,0.18), inset 0 8px 18px rgba(255,255,255,0.28)",
                }
          }
          initial={false}
          animate={orb.animate}
          transition={orb.transition}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={state}
              className="flex"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18 }}
            >
              <motion.span
                className="flex"
                animate={state === "thinking" && !reduce ? { rotate: 360 } : { rotate: 0 }}
                transition={
                  state === "thinking" && !reduce
                    ? { duration: 2, repeat: Infinity, ease: "linear" }
                    : { duration: 0.3 }
                }
              >
                <Icon
                  className="size-12"
                  strokeWidth={state === "idle" ? 1.75 : 2.25}
                />
              </motion.span>
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}
