import { useState } from 'react'
import { useSession } from '@/app/session-context'
import { UsersSection } from '@/features/settings/components/UsersSection'
import { can } from '@/lib/permissions'
import { getBranches } from '@/services/organization-service'
import { getDemoUsers } from '@/services/user-service'

export default function SettingsUsers() {
  const { user } = useSession()
  const [users, setUsers] = useState(getDemoUsers)

  return (
    <UsersSection users={users} branches={getBranches()} canEdit={can(user.role, 'settings.users.edit')} onChanged={setUsers} />
  )
}
