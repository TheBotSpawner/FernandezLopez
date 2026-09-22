import { useParams } from 'react-router-dom'
import { ReceiptPage } from '@/features/administration/ReceiptPage'

export default function ContractReceipt() {
  const { contractId, receiptId } = useParams<{ contractId: string; receiptId: string }>()
  return <ReceiptPage contractId={contractId} receiptId={receiptId} />
}
