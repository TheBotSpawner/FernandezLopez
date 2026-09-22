import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { monthLabel } from '../report-format'
import type { ContactTrendPoint } from '@/types/dashboard'

export function ReportTrendChart({
  data,
  loading,
  unitLabel,
}: {
  data: ContactTrendPoint[] | null
  loading: boolean
  unitLabel: string
}) {
  if (loading || !data) return <Skeleton className="h-56 w-full" />
  if (data.every((point) => point.count === 0)) return <EmptyState message="No hay datos para este período." />

  const chartData = data.map((point) => ({ label: monthLabel(point.month), count: point.count }))

  return (
    <ResponsiveContainer width="100%" height={224}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
        <Tooltip
          cursor={{ fill: 'var(--muted)' }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const count = payload[0].value
            return (
              <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
                <p className="mb-0.5 font-medium text-popover-foreground capitalize">{label}</p>
                <p className="text-muted-foreground">
                  {count} {unitLabel}
                  {count === 1 ? '' : 's'}
                </p>
              </div>
            )
          }}
        />
        <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  )
}
