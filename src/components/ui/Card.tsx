import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export default function Card({
  title,
  subtitle,
  children,
  className,
}: CardProps) {
  return (
    <div
      className={cn(
        'glass-card p-6 transition-all duration-300 hover:border-accent/30 hover:card-glow',
        className
      )}
    >
      {title && (
        <h3 className="font-display text-lg font-semibold text-center text-accent mb-2 tracking-wide">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="text-center text-sm text-foreground/60 mb-4">
          {subtitle}
        </p>
      )}
      <div className="text-center">{children}</div>
    </div>
  )
}
