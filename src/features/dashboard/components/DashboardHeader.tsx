import { format } from 'date-fns'
import { es } from 'date-fns/locale'

function getGreeting(hour: number): string {
  if (hour < 12) return 'Buenos días'
  if (hour < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export function DashboardHeader({ firstName }: { firstName: string }) {
  const now = new Date()

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold text-foreground">
        {getGreeting(now.getHours())}, {firstName}
      </h1>
      <p className="text-sm text-muted-foreground capitalize">
        {format(now, "EEEE d 'de' MMMM", { locale: es })}
      </p>
    </div>
  )
}
