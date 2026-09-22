import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/feedback/EmptyState'
import { setBranchStatus } from '@/services/organization-service'
import { BRANCH_STATUS_LABELS } from '../settings-labels'
import { BranchFormSheet } from './BranchFormSheet'
import type { Branch, User } from '@/types/session'

export function BranchesSection({
  branches,
  users,
  canEdit,
  onChanged,
}: {
  branches: Branch[]
  users: User[]
  canEdit: boolean
  onChanged: (branches: Branch[]) => void
}) {
  const [sheet, setSheet] = useState<{ open: boolean; branch?: Branch | null }>({ open: false })

  function userCount(branchId: string) {
    return users.filter((u) => u.branchId === branchId).length
  }

  function replaceBranch(updated: Branch) {
    const exists = branches.some((b) => b.id === updated.id)
    onChanged(exists ? branches.map((b) => (b.id === updated.id ? updated : b)) : [...branches, updated])
  }

  async function toggleStatus(branch: Branch) {
    const updated = await setBranchStatus(branch.id, branch.status === 'active' ? 'inactive' : 'active')
    replaceBranch(updated)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Sedes de la inmobiliaria.</p>
        {canEdit && (
          <Button size="sm" onClick={() => setSheet({ open: true, branch: null })} className="gap-1.5">
            <Plus className="size-4" />
            Nueva sede
          </Button>
        )}
      </div>

      {branches.length === 0 ? (
        <EmptyState message="No hay sedes cargadas." />
      ) : (
        <>
          <div className="flex flex-col gap-2 md:hidden">
            {branches.map((branch) => (
              <div key={branch.id} className="flex flex-col gap-1.5 rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{branch.name}</span>
                  <StatusBadge tone={branch.status === 'active' ? 'success' : 'muted'}>
                    {BRANCH_STATUS_LABELS[branch.status]}
                  </StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground">{branch.address || 'Sin dirección'}</p>
                <p className="text-xs text-muted-foreground">{branch.phone || 'Sin teléfono'}</p>
                <p className="text-xs text-muted-foreground">
                  {userCount(branch.id)} usuario{userCount(branch.id) === 1 ? '' : 's'}
                </p>
                {canEdit && (
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => setSheet({ open: true, branch })}>
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleStatus(branch)}>
                      {branch.status === 'active' ? 'Desactivar' : 'Activar'}
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
                  <th className="px-3 py-2 font-medium">Dirección</th>
                  <th className="px-3 py-2 font-medium">Teléfono</th>
                  <th className="px-3 py-2 font-medium">Usuarios</th>
                  <th className="px-3 py-2 font-medium">Estado</th>
                  {canEdit && <th className="px-3 py-2 font-medium" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {branches.map((branch) => (
                  <tr key={branch.id}>
                    <td className="px-3 py-2 font-medium text-foreground">{branch.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{branch.address || '—'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{branch.phone || '—'}</td>
                    <td className="px-3 py-2 text-muted-foreground">{userCount(branch.id)}</td>
                    <td className="px-3 py-2">
                      <StatusBadge tone={branch.status === 'active' ? 'success' : 'muted'}>
                        {BRANCH_STATUS_LABELS[branch.status]}
                      </StatusBadge>
                    </td>
                    {canEdit && (
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSheet({ open: true, branch })}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label="Editar sede"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <Button variant="outline" size="sm" onClick={() => toggleStatus(branch)}>
                            {branch.status === 'active' ? 'Desactivar' : 'Activar'}
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
        <BranchFormSheet
          open={sheet.open}
          onOpenChange={(open) => setSheet({ open })}
          branch={sheet.branch}
          onSaved={replaceBranch}
        />
      )}
    </div>
  )
}
