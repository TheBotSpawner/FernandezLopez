import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { REPORT_PERIODS, REPORT_PERIOD_LABELS } from '../report-format'
import type { Branch, User } from '@/types/session'
import type { ReportPeriod } from '@/types/report'

export function ReportFilterBar({
  period,
  onPeriodChange,
  branches,
  branchId,
  onBranchChange,
  showBranch,
  agents,
  assignedUserId,
  onAssignedUserChange,
  showResponsible,
}: {
  period: ReportPeriod
  onPeriodChange: (period: ReportPeriod) => void
  branches: Branch[]
  branchId: string | 'all'
  onBranchChange: (branchId: string | 'all') => void
  showBranch: boolean
  agents: User[]
  assignedUserId: string | 'all'
  onAssignedUserChange: (id: string | 'all') => void
  showResponsible: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={period} onValueChange={(v) => onPeriodChange(v as ReportPeriod)}>
        <SelectTrigger size="sm" className="w-44" aria-label="Período">
          <SelectValue>{(v: string) => REPORT_PERIOD_LABELS[v as ReportPeriod]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {REPORT_PERIODS.map((p) => (
            <SelectItem key={p} value={p}>
              {REPORT_PERIOD_LABELS[p]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showBranch && (
        <Select value={branchId} onValueChange={(v) => onBranchChange(v as string)}>
          <SelectTrigger size="sm" className="w-44" aria-label="Sede">
            <SelectValue placeholder="Sede">
              {(v: string) => (v === 'all' ? 'Todas las sedes' : (branches.find((b) => b.id === v)?.name ?? v))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las sedes</SelectItem>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showResponsible && (
        <Select value={assignedUserId} onValueChange={(v) => onAssignedUserChange(v as string)}>
          <SelectTrigger size="sm" className="w-44" aria-label="Responsable">
            <SelectValue placeholder="Responsable">
              {(v: string) => (v === 'all' ? 'Todos los responsables' : (agents.find((a) => a.id === v)?.name ?? v))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los responsables</SelectItem>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
