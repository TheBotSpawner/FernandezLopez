import { Inbox, type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  message: string
  icon?: LucideIcon
}

export function EmptyState({ message, icon: Icon = Inbox }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
      <Icon className="size-6" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
