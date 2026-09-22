import { useMemo, useState } from 'react'
import { getChargesByContract } from '@/services/contract-charge-service'
import { getCreditBalance } from '@/services/payment-service'
import { remainingAmount } from './account-utils'

export function useContractAccount(contractId: string, period: string) {
  const [refreshToken, setRefreshToken] = useState(0)

  const allCharges = useMemo(() => getChargesByContract(contractId), [contractId, refreshToken])
  const charges = useMemo(() => allCharges.filter((c) => c.period === period), [allCharges, period])
  const previousDebt = useMemo(
    () => allCharges.filter((c) => c.period < period).reduce((sum, c) => sum + remainingAmount(c), 0),
    [allCharges, period],
  )
  const creditBalance = useMemo(() => getCreditBalance(contractId), [contractId, refreshToken])

  const periods = useMemo(() => Array.from(new Set(allCharges.map((c) => c.period))).sort(), [allCharges])

  return {
    charges,
    previousDebt,
    creditBalance,
    periods,
    refetch: () => setRefreshToken((t) => t + 1),
  }
}
