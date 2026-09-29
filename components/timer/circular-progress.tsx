"use client"

const VIEWBOX = 300
const STROKE_WIDTH = 12
const RADIUS = (VIEWBOX - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Cercle de progression de la page Minuteur (Svg + Circle animé sur mobile).
 * `colorClassName` colore l'arc via `currentColor`.
 */
export function CircularProgress({
  progress,
  colorClassName,
  children,
}: {
  /** Entre 0 et 1. */
  progress: number
  colorClassName: string
  children: React.ReactNode
}) {
  const clamped = Math.min(1, Math.max(0, progress))
  return (
    <div className="relative flex aspect-square w-[min(72vw,300px)] items-center justify-center">
      <svg
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        className="absolute inset-0 size-full -rotate-90"
        aria-hidden
      >
        <circle
          cx={VIEWBOX / 2}
          cy={VIEWBOX / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          className="stroke-foreground/10 dark:stroke-white/10"
        />
        <circle
          cx={VIEWBOX / 2}
          cy={VIEWBOX / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
          className={`transition-[stroke-dashoffset,color] duration-[400ms] ease-out ${colorClassName}`}
        />
      </svg>
      <div className="relative flex flex-col items-center gap-1 text-center">{children}</div>
    </div>
  )
}
