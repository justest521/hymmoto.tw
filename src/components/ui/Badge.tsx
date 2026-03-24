import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'secondary' | 'outline' | 's' | 'a' | 'b' | 'c' | 'd'

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-accent text-black',
  secondary: 'bg-muted/30 text-foreground',
  outline: 'border border-accent text-accent',
  s: 'bg-accent text-black shadow-lg shadow-accent/50',
  a: 'bg-info text-white shadow-lg shadow-blue-500/50',
  b: 'bg-purple-600 text-white shadow-lg shadow-purple-600/50',
  c: 'bg-muted text-foreground/80',
  d: 'bg-stone-700 text-foreground/60',
}

export default function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center text-center rounded-full font-medium text-xs px-3 py-1 transition-all duration-200',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
