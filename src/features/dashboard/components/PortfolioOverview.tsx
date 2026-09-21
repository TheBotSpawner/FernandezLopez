import { Skeleton } from '@/components/ui/skeleton'
import type { PortfolioSummary } from '@/types/dashboard'

const LABELS: Record<keyof PortfolioSummary, string> = {
  forRent: 'En alquiler',
  forSale: 'En venta',
  reserved: 'Reservadas',
  underValuation: 'En tasación',
}

export function PortfolioOverview({ portfolio, loading }: { portfolio: PortfolioSummary | null; loading: boolean }) {
  if (loading || !portfolio) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {(Object.keys(LABELS) as (keyof PortfolioSummary)[]).map((key) => (
        <div key={key} className="rounded-lg bg-muted/50 p-3">
          <p className="text-xl font-semibold text-foreground">{portfolio[key]}</p>
          <p className="text-xs text-muted-foreground">{LABELS[key]}</p>
        </div>
      ))}
    </div>
  )
}
