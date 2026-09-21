import { Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { formatVisitDay } from '@/lib/format'
import { getUserForContact } from '@/mocks/contacts'
import { ContactCard } from './ContactCard'
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

export function ContactListView({
  contacts,
  loading,
  onClearFilters,
}: {
  contacts: Contact[]
  loading: boolean
  onClearFilters?: () => void
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (contacts.length === 0) {
    return (
      <div className="rounded-lg border border-border py-10">
        <EmptyState icon={Users} message="No encontramos contactos con estos filtros." />
        {onClearFilters && (
          <div className="flex justify-center">
            <button type="button" onClick={onClearFilters} className="text-sm font-medium text-primary hover:underline">
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:hidden">
        {contacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">Contacto</th>
              <th className="px-3 py-2 font-medium">Roles</th>
              <th className="px-3 py-2 font-medium">Teléfono</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Responsable</th>
              <th className="px-3 py-2 font-medium">Última actividad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {contacts.map((contact) => {
              const agent = getUserForContact(contact.assignedUserId)
              return (
                <tr key={contact.id} className="transition-colors hover:bg-muted/50">
                  <td className="px-3 py-2">
                    <Link to={`/contacts/${contact.id}`} className="flex items-center gap-2.5">
                      <Avatar className="size-8 shrink-0">
                        <AvatarFallback>{initials(contact.fullName)}</AvatarFallback>
                      </Avatar>
                      <span className="truncate font-medium text-foreground">{contact.fullName}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <ContactRoleBadges roles={contact.roles} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{contact.phone}</td>
                  <td className="px-3 py-2 text-muted-foreground">{contact.email}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{agent?.name ?? '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{formatVisitDay(contact.lastActivityAt)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
