import { useParams } from 'react-router-dom'
import { ContractDetailPage } from '@/features/administration/ContractDetailPage'

export default function ContractDetail() {
  const { contractId } = useParams<{ contractId: string }>()
  return <ContractDetailPage contractId={contractId} />
}
