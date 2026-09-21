import { User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { findContactByPhone } from '@/services/contact-service'
import type { PropertyOwner } from '@/types/property'

export function PropertyOwnerCard({ owners }: { owners: PropertyOwner[] }) {
  if (owners.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-foreground">{owners.length > 1 ? 'Propietarios' : 'Propietario'}</h3>
      <div className="flex flex-col gap-3">
        {owners.map((owner) => {
          const contact = findContactByPhone(owner.phone)
          const info = (
            <div>
              <p className="text-sm font-medium text-foreground">{owner.name}</p>
              <p className="text-xs text-muted-foreground">{owner.phone}</p>
            </div>
          )
          return (
            <div key={owner.id} className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <User className="size-4" />
              </div>
              {contact ? (
                <Link to={`/contacts/${contact.id}`} className="hover:underline">
                  {info}
                </Link>
              ) : (
                info
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
