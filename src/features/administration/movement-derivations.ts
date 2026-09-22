import { getChargesByContract } from '@/services/contract-charge-service'
import { getPaymentsByContract } from '@/services/payment-service'
import { getReceiptsByContract } from '@/services/receipt-service'
import { getSettlementsByContract } from '@/services/owner-settlement-service'
import { CHARGE_TYPE_LABELS, PAYMENT_METHOD_LABELS } from './account-labels'
import { formatPeriodLabel } from './account-utils'
import type { ContractMovement } from '@/types/contract-account'

/**
 * A contract's movement history is always derived from `ContractCharge`/
 * `Payment`/`Receipt`/`OwnerSettlement` records rather than stored
 * separately — see docs/data-model.md#contractmovement.
 */
export function buildContractMovements(contractId: string): ContractMovement[] {
  const charges = getChargesByContract(contractId)
  const payments = getPaymentsByContract(contractId)
  const receipts = getReceiptsByContract(contractId)
  const settlements = getSettlementsByContract(contractId)

  const chargeLabel = (id: string) => {
    const charge = charges.find((c) => c.id === id)
    if (!charge) return 'concepto'
    return `${charge.description || CHARGE_TYPE_LABELS[charge.type]} · ${formatPeriodLabel(charge.period)}`
  }

  const movements: ContractMovement[] = []

  for (const charge of charges) {
    movements.push({
      id: `mv-charge-${charge.id}`,
      contractId,
      date: charge.createdAt,
      period: charge.period,
      type: 'CHARGE_CREATED',
      description: `${chargeLabel(charge.id)} generado`,
      amount: charge.amount,
      direction: 'DEBIT',
      chargeId: charge.id,
    })
  }

  for (const payment of payments) {
    if (payment.isCreditApplication) {
      const target = payment.allocations.find((a) => a.chargeId)
      if (target?.chargeId) {
        movements.push({
          id: `mv-credit-${payment.id}`,
          contractId,
          date: payment.createdAt,
          type: 'CREDIT_APPLIED',
          description: `Saldo a favor aplicado a ${chargeLabel(target.chargeId)}`,
          amount: target.amount,
          direction: 'NEUTRAL',
          paymentId: payment.id,
          chargeId: target.chargeId,
        })
      }
      continue
    }

    movements.push({
      id: `mv-payment-${payment.id}`,
      contractId,
      date: payment.createdAt,
      type: 'PAYMENT_RECEIVED',
      description: `Pago recibido — ${PAYMENT_METHOD_LABELS[payment.method]}`,
      amount: payment.amount,
      direction: 'CREDIT',
      paymentId: payment.id,
    })

    for (const allocation of payment.allocations) {
      if (!allocation.chargeId || allocation.amount <= 0) continue
      movements.push({
        id: `mv-applied-${payment.id}-${allocation.chargeId}`,
        contractId,
        date: payment.createdAt,
        type: 'PAYMENT_APPLIED',
        description: `Pago aplicado a ${chargeLabel(allocation.chargeId)}`,
        amount: allocation.amount,
        direction: 'NEUTRAL',
        paymentId: payment.id,
        chargeId: allocation.chargeId,
      })
    }
  }

  for (const receipt of receipts) {
    movements.push({
      id: `mv-receipt-${receipt.id}`,
      contractId,
      date: receipt.createdAt,
      period: receipt.period,
      type: 'RECEIPT_ISSUED',
      description: `Recibo Nº ${receipt.number} emitido`,
      amount: receipt.total,
      direction: 'NEUTRAL',
      receiptId: receipt.id,
    })
  }

  for (const settlement of settlements) {
    movements.push({
      id: `mv-settlement-${settlement.id}`,
      contractId,
      date: settlement.createdAt,
      period: settlement.period,
      type: 'SETTLEMENT_CREATED',
      description: `Liquidación ${formatPeriodLabel(settlement.period)} generada`,
      amount: settlement.netAmount,
      direction: 'NEUTRAL',
      settlementId: settlement.id,
    })
  }

  return movements.sort((a, b) => b.date.localeCompare(a.date))
}
