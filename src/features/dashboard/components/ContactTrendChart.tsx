import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import type { ContactTrendPoint } from '@/types/dashboard'

function monthLabel(month: string): string {
  // Construct from local Y/M components — parsing "YYYY-MM-01" directly
  // would be read as UTC midnight and roll back a day in negative-offset zones.
  const [year, monthNumber] = month.split('-').map(Number)
  return format(new Date(year, monthNumber - 1, 1), 'MMM', { locale: es })
}

export function ContactTrendChart({ data, loading }: { data: ContactTrendPoint[] | null; loading: boolean }) {
  if (loading || !data) {
    return <Skeleton className="h-56 w-full" />
  }

  const chartData = data.map((point) => ({ label: monthLabel(point.month), count: point.count }))

  return (
    <ResponsiveContainer width="100%" height={224}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: 'var(--muted)' }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const count = payload[0].value
            return (
              <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
                <p className="mb-0.5 font-medium text-popover-foreground capitalize">{label}</p>
                <p className="text-muted-foreground">
                  {count} contacto{count === 1 ? '' : 's'}
                </p>
              </div>
            )
          }}
        />
        <Bar dataKey="count" name="Contactos" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  )
}
