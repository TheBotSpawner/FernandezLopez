import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'

interface ReportBarChartRow {
  label: string
  count: number
}

export function ReportBarChart({
  data,
  loading,
  layout = 'vertical',
  height = 224,
}: {
  data: ReportBarChartRow[] | null
  loading: boolean
  /** 'vertical' = upright bars (default); 'horizontal' = sideways bars, for long category lists like neighborhoods. */
  layout?: 'vertical' | 'horizontal'
  height?: number
}) {
  if (loading || !data) return <Skeleton className="w-full" style={{ height }} />
  if (data.length === 0 || data.every((row) => row.count === 0)) return <EmptyState message="No hay datos para este período." />

  const isHorizontal = layout === 'horizontal'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={isHorizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 4, right: 12, left: isHorizontal ? 8 : -20, bottom: 0 }}
      >
        <CartesianGrid horizontal={!isHorizontal} vertical={isHorizontal} strokeDasharray="3 3" stroke="var(--border)" />
        {isHorizontal ? (
          <>
            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              width={100}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
          </>
        ) : (
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
        )}
        <Tooltip
          cursor={{ fill: 'var(--muted)' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const row = payload[0].payload as ReportBarChartRow
            return (
              <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
                <p className="mb-0.5 font-medium text-popover-foreground">{row.label}</p>
                <p className="text-muted-foreground">{row.count}</p>
              </div>
            )
          }}
        />
        <Bar dataKey="count" fill="var(--primary)" radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}
