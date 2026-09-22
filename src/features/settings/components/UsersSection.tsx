import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/feedback/EmptyState'
import { setUserStatus } from '@/services/user-service'
import { ROLE_LABELS, USER_STATUS_LABELS } from '../settings-labels'
import { UserFormSheet } from './UserFormSheet'
import type { Branch, User } from '@/types/session'

export function UsersSection({
  users,
  branches,
  canEdit,
  onChanged,
}: {
  users: User[]
  branches: Branch[]
  canEdit: boolean
  onChanged: (users: User[]) => void
}) {
  const [sheet, setSheet] = useState<{ open: boolean; user?: User | null }>({ open: false })

  function branchName(branchId: string) {
    return branches.find((b) => b.id === branchId)?.name ?? '—'
  }

  function replaceUser(updated: User) {
    const exists = users.some((u) => u.id === updated.id)
    onChanged(exists ? users.map((u) => (u.id === updated.id ? updated : u)) : [...users, updated])
  }

  async function toggleStatus(user: User) {
    const updated = await setUserStatus(user.id, user.status === 'active' ? 'inactive' : 'active')
    replaceUser(updated)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Usuarios con acceso a la plataforma.</p>
        {canEdit && (
          <Button size="sm" onClick={() => setSheet({ open: true, user: null })} className="gap-1.5">
            <Plus className="size-4" />
            Nuevo usuario
          </Button>
        )}
      </div>

      {users.length === 0 ? (
        <EmptyState message="No hay usuarios cargados." />
      ) : (
        <>
          <div className="flex flex-col gap-2 md:hidden">
            {users.map((user) => (
              <div key={user.id} className="flex flex-col gap-1.5 rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{user.name}</span>
                  <StatusBadge tone={user.status === 'active' ? 'success' : 'muted'}>
                    {USER_STATUS_LABELS[user.status]}
                  </StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {ROLE_LABELS[user.role]} · {branchName(user.branchId)}
                </p>
                {canEdit && (
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => setSheet({ open: true, user })}>
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleStatus(user)}>
                      {user.status === 'active' ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-border md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Nombre</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Rol</th>
                  <th className="px-3 py-2 font-medium">Sede</th>
                  <th className="px-3 py-2 font-medium">Estado</th>
                  {canEdit && <th className="px-3 py-2 font-medium" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-3 py-2 font-medium text-foreground">{user.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{user.email}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{ROLE_LABELS[user.role]}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{branchName(user.branchId)}</td>
                    <td className="px-3 py-2">
                      <StatusBadge tone={user.status === 'active' ? 'success' : 'muted'}>
                        {USER_STATUS_LABELS[user.status]}
                      </StatusBadge>
                    </td>
                    {canEdit && (
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSheet({ open: true, user })}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label="Editar usuario"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <Button variant="outline" size="sm" onClick={() => toggleStatus(user)}>
                            {user.status === 'active' ? 'Desactivar' : 'Activar'}
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {canEdit && (
        <UserFormSheet
          open={sheet.open}
          onOpenChange={(open) => setSheet({ open })}
          user={sheet.user}
          branches={branches}
          onSaved={replaceUser}
        />
      )}
    </div>
  )
}
