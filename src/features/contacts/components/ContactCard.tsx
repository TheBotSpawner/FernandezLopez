import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatVisitDay } from '@/lib/format'
import { getUserForContact } from '@/mocks/contacts'
import { ContactRoleBadges } from './ContactRoleBadges'
import type { Contact } from '@/types/contact'

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function ContactCard({ contact }: { contact: Contact }) {
  const agent = getUserForContact(contact.assignedUserId)

  return (
    <Link
      to={`/contacts/${contact.id}`}
      className="flex flex-col gap-2 rounded-lg border border-border p-3 transition-colors hover:border-primary/40"
    >
      <div className="flex items-center gap-2.5">
        <Avatar className="size-9">
          <AvatarFallback>{initials(contact.fullName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{contact.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{contact.phone}</p>
        </div>
      </div>
      <ContactRoleBadges roles={contact.roles} />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{agent?.name ?? '—'}</span>
        <span>{formatVisitDay(contact.lastActivityAt)}</span>
      </div>
    </Link>
  )
}
