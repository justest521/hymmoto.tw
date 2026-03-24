'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: ReactNode
  number: number
  label: string
  suffix?: string
  className?: string
}

export default function StatCard({
  icon,
  number,
  label,
  suffix = '',
  className,
}: StatCardProps) {
  const numberRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!numberRef.current || hasAnimated.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          animateCount(number)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(numberRef.current)

    return () => observer.disconnect()
  }, [number])

  const animateCount = (target: number) => {
    if (!numberRef.current) return

    const duration = 2000 // 2 seconds
    const start = Date.now()
    const startValue = 0

    const updateCount = () => {
      const now = Date.now()
      const progress = Math.min((now - start) / duration, 1)
      const current = Math.floor(startValue + (target - startValue) * progress)

      if (numberRef.current) {
        numberRef.current.textContent = current.toLocaleString('zh-TW')
      }

      if (progress < 1) {
        requestAnimationFrame(updateCount)
      }
    }

    updateCount()
  }

  return (
    <div
      className={cn(
        'stat-card flex flex-col items-center justify-center gap-3',
        className
      )}
    >
      <div className="text-accent text-4xl">{icon}</div>
      <div
        ref={numberRef}
        className="font-display text-3xl font-bold text-accent tracking-wide"
      >
        0
      </div>
      <div className="text-sm text-foreground/70 font-medium">
        {label}
        {suffix && <span className="text-xs ml-1">{suffix}</span>}
      </div>
    </div>
  )
}
