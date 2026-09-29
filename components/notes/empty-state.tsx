import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

/** Équivalent web de tchope/components/EmptyState.tsx (icône ronde, titre, sous-titre). */
export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-surface dark:bg-dark-surface">
        <Icon className="size-9 text-muted dark:text-dark-muted" strokeWidth={1.75} />
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground dark:text-white">{title}</h3>
      {subtitle && (
        <p className="mt-1.5 max-w-xs text-sm leading-5 text-muted dark:text-dark-muted">
          {subtitle}
        </p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}
