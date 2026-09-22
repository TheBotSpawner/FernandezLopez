import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { OBLIGATION_TYPE_LABELS, RESPONSIBILITY_LABELS } from '../../account-labels'
import { updateContractObligations } from '@/services/rental-contract-service'
import type { ContractObligation, ObligationResponsibility } from '@/types/rental-contract'

const RESPONSIBILITY_OPTIONS: ObligationResponsibility[] = ['TENANT', 'OWNER', 'BY_CONTRACT']
const ELECTRICITY_PROVIDERS = ['Edenor', 'Edesur']

export function ContractObligationsTab({ contractId, obligations }: { contractId: string; obligations: ContractObligation[] }) {
  const [items, setItems] = useState(obligations)
  const [saving, setSaving] = useState(false)

  async function persist(next: ContractObligation[]) {
    setItems(next)
    setSaving(true)
    await updateContractObligations(contractId, next)
    setSaving(false)
  }

  function updateOne(type: ContractObligation['type'], patch: Partial<ContractObligation>) {
    const next = items.map((item) => (item.type === type ? { ...item, ...patch } : item))
    persist(next)
  }

  function toggleEnabled(item: ContractObligation) {
    const enabling = !item.enabled
    const defaultProvider = item.type === 'GAS' ? 'Metrogas' : item.type === 'ELECTRICITY' ? 'Edenor' : undefined
    updateOne(item.type, {
      enabled: enabling,
      responsibility: enabling ? (item.responsibility ?? 'TENANT') : undefined,
      provider: enabling ? (item.provider ?? defaultProvider) : undefined,
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Qué conceptos aplican a este contrato, quién es responsable de cada uno y con qué proveedor — configuración por
        contrato, no una regla general de la agencia.
      </p>

      {/* Mobile: cards */}
      <div className="flex flex-col gap-2 md:hidden">
        {items.map((item) => (
          <div key={item.type} className="flex flex-col gap-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{OBLIGATION_TYPE_LABELS[item.type]}</span>
              <button
                type="button"
                aria-pressed={item.enabled}
                onClick={() => toggleEnabled(item)}
                disabled={item.type === 'RENT'}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60',
                  item.enabled ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground',
                )}
              >
                {item.enabled ? 'Aplica' : 'No aplica'}
              </button>
            </div>
            {item.enabled && (
              <div className="flex flex-col gap-2">
                <ResponsibilitySelect value={item.responsibility} onChange={(value) => updateOne(item.type, { responsibility: value })} />
                {(item.type === 'ELECTRICITY' || item.type === 'GAS') && (
                  <ProviderControl type={item.type} value={item.provider} onChange={(value) => updateOne(item.type, { provider: value })} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">Concepto</th>
              <th className="px-3 py-2 font-medium">Aplica</th>
              <th className="px-3 py-2 font-medium">Responsable</th>
              <th className="px-3 py-2 font-medium">Proveedor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.type}>
                <td className="px-3 py-2 font-medium text-foreground">{OBLIGATION_TYPE_LABELS[item.type]}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    aria-pressed={item.enabled}
                    onClick={() => toggleEnabled(item)}
                    disabled={item.type === 'RENT'}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60',
                      item.enabled ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground',
                    )}
                  >
                    {item.enabled ? 'Sí' : 'No'}
                  </button>
                </td>
                <td className="px-3 py-2">
                  {item.enabled ? (
                    <ResponsibilitySelect value={item.responsibility} onChange={(value) => updateOne(item.type, { responsibility: value })} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {item.enabled && (item.type === 'ELECTRICITY' || item.type === 'GAS') ? (
                    <ProviderControl type={item.type} value={item.provider} onChange={(value) => updateOne(item.type, { provider: value })} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {saving && <p className="text-xs text-muted-foreground">Guardando…</p>}
    </div>
  )
}

function ResponsibilitySelect({
  value,
  onChange,
}: {
  value: ObligationResponsibility | undefined
  onChange: (value: ObligationResponsibility) => void
}) {
  return (
    <Select value={value ?? 'TENANT'} onValueChange={(v) => onChange(v as ObligationResponsibility)}>
      <SelectTrigger className="w-40">
        <SelectValue>{(v: string) => RESPONSIBILITY_LABELS[v as ObligationResponsibility]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {RESPONSIBILITY_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {RESPONSIBILITY_LABELS[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ProviderControl({
  type,
  value,
  onChange,
}: {
  type: 'ELECTRICITY' | 'GAS'
  value: string | undefined
  onChange: (value: string) => void
}) {
  if (type === 'GAS') {
    return <span className="text-sm text-foreground">Metrogas</span>
  }
  return (
    <Select value={value ?? 'Edenor'} onValueChange={(v) => onChange(v as string)}>
      <SelectTrigger className="w-32">
        <SelectValue>{(v: string) => v}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {ELECTRICITY_PROVIDERS.map((provider) => (
          <SelectItem key={provider} value={provider}>
            {provider}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
