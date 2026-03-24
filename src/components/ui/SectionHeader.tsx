import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  moreLink?: {
    label: string
    href: string
  }
  className?: string
}

export default function SectionHeader({
  title,
  subtitle,
  moreLink,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('w-full text-center mb-8', className)}>
      {/* Title with decorative lines */}
      <div className="flex items-center justify-center gap-4 mb-3">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-accent/50" />
        <h2 className="font-display text-2xl md:text-3xl font-bold text-accent whitespace-nowrap tracking-wider">
          {title}
        </h2>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-accent/50" />
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-foreground/70 text-sm md:text-base mb-4">
          {subtitle}
        </p>
      )}

      {/* More Link */}
      {moreLink && (
        <div className="flex justify-center">
          <Link
            href={moreLink.href}
            className="text-accent hover:text-accent-dim text-sm font-medium transition-colors duration-200"
          >
            {moreLink.label} →
          </Link>
        </div>
      )}
    </div>
  )
}
