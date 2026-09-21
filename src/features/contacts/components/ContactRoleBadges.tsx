import { StatusBadge } from '@/components/data-display/StatusBadge'
import { CONTACT_ROLE_LABELS, CONTACT_ROLE_TONES } from '../contact-labels'
import type { ContactRole } from '@/types/contact'

export function ContactRoleBadges({ roles }: { roles: ContactRole[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <StatusBadge key={role} tone={CONTACT_ROLE_TONES[role]}>
          {CONTACT_ROLE_LABELS[role]}
        </StatusBadge>
      ))}
    </div>
  )
}
