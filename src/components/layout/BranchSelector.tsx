import { useSession } from '@/app/session-context'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function BranchSelector() {
  const { branches, branchScope, setBranchScope } = useSession()

  return (
    <Select value={branchScope} onValueChange={(value) => setBranchScope(value as string)}>
      <SelectTrigger size="sm" className="w-44">
        <SelectValue placeholder="Sede">
          {(value: string) =>
            value === 'all' ? 'Todas las sedes' : (branches.find((branch) => branch.id === value)?.name ?? value)
          }
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
  )
}
