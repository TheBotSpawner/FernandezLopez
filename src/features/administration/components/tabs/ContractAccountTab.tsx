import { CheckCircle2, ChevronLeft, ChevronRight, Pencil, Plus, Receipt as ReceiptIcon, Sparkles, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '@/app/toast-context'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatARS, formatDateOnly } from '@/lib/format'
import { CHARGE_STATUS_LABELS, CHARGE_STATUS_TONES, CHARGE_TYPE_LABELS } from '../../account-labels'
import { currentPeriod, effectiveChargeStatus, formatPeriodLabel, remainingAmount, shiftPeriod } from '../../account-utils'
import { useContractAccount } from '../../use-contract-account'
import { deleteCharge, generatePeriodCharges } from '@/services/contract-charge-service'
import { createPayment, createPeriodReceipt } from '@/services/payment-service'
import { getReceiptsByContract } from '@/services/receipt-service'
import { ChargeFormSheet } from '../ChargeFormSheet'
import type { ContractCharge } from '@/types/contract-account'

export function ContractAccountTab({ contractId, onChanged: onChangedProp }: { contractId: string; onChanged?: () => void }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [period, setPeriod] = useState(currentPeriod())
  const { charges, previousDebt, creditBalance, refetch } = useContractAccount(contractId, period)
  const [chargeSheet, setChargeSheet] = useState<{ open: boolean; charge?: ContractCharge | null }>({ open: false })
  const [generating, setGenerating] = useState(false)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [generatingReceipt, setGeneratingReceipt] = useState(false)

  const receipts = getReceiptsByContract(contractId)

  const totalPeriod = charges.reduce((sum, c) => sum + c.amount, 0)
  const paidPeriod = charges.reduce((sum, c) => sum + c.paidAmount, 0)
  const pendingPeriod = totalPeriod - paidPeriod
  const currentBalance = pendingPeriod + previousDebt - creditBalance

  function onChanged() {
    refetch()
    onChangedProp?.()
  }

  async function handleGenerateCharges() {
    setGenerating(true)
    await generatePeriodCharges(contractId, period)
    setGenerating(false)
    onChanged()
  }

  async function handleQuickPay(charge: ContractCharge) {
    setPayingId(charge.id)
    await createPayment({
      contractId,
      date: new Date().toISOString().slice(0, 10),
      amount: remainingAmount(charge),
      method: 'TRANSFER',
      allocations: [{ chargeId: charge.id, amount: remainingAmount(charge) }],
    })
    setPayingId(null)
    onChanged()
  }

  async function handleDelete(charge: ContractCharge) {
    const label = charge.description || CHARGE_TYPE_LABELS[charge.type]
    if (!window.confirm(`¿Eliminar "${label}"? Esta acción no se puede deshacer.`)) return
    await deleteCharge(charge.id)
    onChanged()
  }

  async function handleGenerateReceipt() {
    setGeneratingReceipt(true)
    const receipt = await createPeriodReceipt(contractId, period)
    setGeneratingReceipt(false)
    if (receipt) {
      showToast('Recibo generado')
      onChanged()
      navigate(`/administration/contracts/${contractId}/receipts/${receipt.id}`)
    } else {
      showToast('No hay cargos pagados en este período')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" onClick={() => setPeriod((p) => shiftPeriod(p, -1))} aria-label="Período anterior">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="w-36 text-center text-sm font-medium text-foreground capitalize">{formatPeriodLabel(period)}</span>
          <Button variant="outline" size="icon" onClick={() => setPeriod((p) => shiftPeriod(p, 1))} aria-label="Período siguiente">
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateReceipt}
            disabled={generatingReceipt || paidPeriod === 0}
            className="gap-1.5"
          >
            <ReceiptIcon className="size-4" />
            Generar recibo
          </Button>
          <Button variant="outline" size="sm" onClick={() => setChargeSheet({ open: true, charge: null })} className="gap-1.5">
            <Plus className="size-4" />
            Agregar cargo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Total del período" value={totalPeriod} />
        <SummaryCard label="Pagado" value={paidPeriod} tone="success" />
        <SummaryCard label="Pendiente" value={pendingPeriod} tone={pendingPeriod > 0 ? 'warning' : undefined} />
        {previousDebt > 0 && <SummaryCard label="Saldo anterior" value={previousDebt} tone="danger" />}
        {creditBalance > 0 && <SummaryCard label="Saldo a favor" value={creditBalance} tone="info" />}
        <SummaryCard
          label="Saldo actual"
          value={Math.abs(currentBalance)}
          tone={currentBalance > 0 ? 'danger' : currentBalance < 0 ? 'info' : 'success'}
          prefix={currentBalance < 0 ? 'a favor · ' : undefined}
        />
      </div>

      {charges.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-10 text-center">
          <EmptyState message="No hay cargos para este período." />
          <Button size="sm" onClick={handleGenerateCharges} disabled={generating} className="gap-1.5">
            <Sparkles className="size-4" />
            Generar cargos del período
          </Button>
          <p className="max-w-sm text-xs text-muted-foreground">
            Crea un cargo por cada concepto habilitado en "Conceptos". El alquiler se genera con su importe actual; el resto
            queda con monto pendiente hasta que llegue el comprobante del proveedor.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {charges.map((charge) => {
            const status = effectiveChargeStatus(charge)
            const remaining = remainingAmount(charge)
            const amountPending = charge.amount === 0
            const payable = !amountPending && status !== 'PAID'
            return (
              <div key={charge.id} className="flex flex-col gap-1.5 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{charge.description || CHARGE_TYPE_LABELS[charge.type]}</p>
                    {charge.source === 'MANUAL' && (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Manual</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Vence {formatDateOnly(charge.dueDate)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    {amountPending ? (
                      <p className="text-sm font-medium text-warning">Monto pendiente</p>
                    ) : (
                      <p className="text-sm font-semibold text-foreground">{formatARS(charge.amount)}</p>
                    )}
                    {status === 'PARTIAL' && (
                      <p className="text-xs text-muted-foreground">
                        Pagado {formatARS(charge.paidAmount)} · Pendiente {formatARS(remaining)}
                      </p>
                    )}
                  </div>
                  {!amountPending && <StatusBadge tone={CHARGE_STATUS_TONES[status]}>{CHARGE_STATUS_LABELS[status]}</StatusBadge>}
                  {payable && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickPay(charge)}
                      disabled={payingId === charge.id}
                      className="gap-1.5"
                    >
                      <CheckCircle2 className="size-3.5" />
                      Pagado
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => setChargeSheet({ open: true, charge })}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Editar cargo"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(charge)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger"
                    aria-label="Eliminar cargo"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {receipts.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Recibos</span>
          <div className="flex flex-wrap gap-2">
            {receipts.slice(0, 6).map((receipt) => (
              <Link
                key={receipt.id}
                to={`/administration/contracts/${contractId}/receipts/${receipt.id}`}
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
              >
                <ReceiptIcon className="size-3.5" />
                Nº {receipt.number}
              </Link>
            ))}
          </div>
        </div>
      )}

      <ChargeFormSheet
        open={chargeSheet.open}
        onOpenChange={(open) => setChargeSheet({ open })}
        contractId={contractId}
        period={period}
        charge={chargeSheet.charge}
        onSaved={onChanged}
      />
    </div>
  )
}

function SummaryCard({
  label,
  value,
  tone,
  prefix,
}: {
  label: string
  value: number
  tone?: 'success' | 'warning' | 'danger' | 'info'
  prefix?: string
}) {
  const toneClass =
    tone === 'success'
      ? 'text-success'
      : tone === 'warning'
        ? 'text-warning'
        : tone === 'danger'
          ? 'text-danger'
          : tone === 'info'
            ? 'text-info'
            : 'text-foreground'
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold ${toneClass}`}>
        {prefix}
        {formatARS(value)}
      </p>
    </div>
  )
}
