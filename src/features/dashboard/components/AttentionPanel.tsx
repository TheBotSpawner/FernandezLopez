import { AlertTriangle, CalendarClock, Home, MessageCircleWarning, UserRoundSearch, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatusBadge, type StatusTone } from '@/components/data-display/StatusBadge'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import type { AttentionCategory, AttentionItem, AttentionSeverity } from '@/types/dashboard'

const CATEGORY_ICON: Record<AttentionCategory, LucideIcon> = {
  contact: MessageCircleWarning,
  opportunity: UserRoundSearch,
  reservation: AlertTriangle,
  'contract-expiration': CalendarClock,
  'rent-adjustment': Home,
}

const CATEGORY_ROUTE: Record<AttentionCategory, string> = {
  contact: '/contacts',
  opportunity: '/commercial/opportunities',
  reservation: '/commercial/opportunities',
  'contract-expiration': '/administration/expirations',
  'rent-adjustment': '/administration/expirations',
}

const SEVERITY_TONE: Record<AttentionSeverity, StatusTone> = {
  info: 'info',
  warning: 'warning',
  danger: 'danger',
}

const SEVERITY_LABEL: Record<AttentionSeverity, string> = {
  info: 'Info',
  warning: 'Atención',
  danger: 'Urgente',
}

export function AttentionPanel({ items, loading }: { items: AttentionItem[] | null; loading: boolean }) {
  if (loading || !items) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return <EmptyState message="No hay elementos que requieran atención." />
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => {
        const Icon = CATEGORY_ICON[item.category]
        return (
          <li key={item.id}>
            <Link
              to={CATEGORY_ROUTE[item.category]}
              className="flex items-center gap-3 rounded-lg px-2.5 py-3 transition-colors hover:bg-muted"
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-sm text-foreground">{item.message}</span>
              <StatusBadge tone={SEVERITY_TONE[item.severity]}>{SEVERITY_LABEL[item.severity]}</StatusBadge>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
