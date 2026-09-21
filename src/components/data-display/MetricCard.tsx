import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: number
  unit: string
  icon: LucideIcon
  trend?: { direction: 'up' | 'down'; label: string }
}

export function MetricCard({ label, value, unit, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-foreground">{value.toLocaleString('es-AR')}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend.direction === 'up' ? 'text-success' : 'text-danger',
            )}
          >
            {trend.direction === 'up' ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {trend.label}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function MetricCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  )
}
