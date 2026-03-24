import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-black hover:bg-accent-dim shadow-lg hover:shadow-[0_0_20px_rgba(184,245,62,0.4)] active:scale-95',
  secondary:
    'border-2 border-accent text-accent hover:bg-accent/10 active:scale-95',
  ghost:
    'text-foreground/80 hover:text-foreground hover:bg-card-hover active:scale-95',
  danger:
    'bg-danger text-white hover:bg-red-600 shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs h-8',
  md: 'px-4 py-2 text-sm h-10',
  lg: 'px-6 py-3 text-base h-12',
}

export default function Button({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center text-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
