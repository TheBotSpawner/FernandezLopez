import { SectionCard } from '@/components/data-display/SectionCard'
import { ROLE_LABELS, ROLE_MATRIX } from '../settings-labels'
import type { UserRole } from '@/types/session'

const ROLES: UserRole[] = ['ADMIN', 'MANAGER', 'ADMINISTRATION', 'AGENT']

export function RoleMatrix() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ROLES.map((role) => (
          <SectionCard key={role} title={ROLE_LABELS[role]}>
            <p className="text-xs text-muted-foreground">{role}</p>
          </SectionCard>
        ))}
      </div>

      <SectionCard title="Qué puede ver cada rol" description="Resumen a nivel de prototipo — no reemplaza un motor de permisos.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">Módulo</th>
                {ROLES.map((role) => (
                  <th key={role} className="px-3 py-2 font-medium whitespace-nowrap">
                    {ROLE_LABELS[role]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ROLE_MATRIX.map((row) => (
                <tr key={row.module}>
                  <td className="px-3 py-2 font-medium whitespace-nowrap text-foreground">{row.module}</td>
                  {ROLES.map((role) => (
                    <td key={role} className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                      {row.access[role]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}
