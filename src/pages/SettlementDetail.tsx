import { useParams } from 'react-router-dom'
import { SettlementDetailPage } from '@/features/administration/SettlementDetailPage'

export default function SettlementDetail() {
  const { settlementId } = useParams<{ settlementId: string }>()
  return <SettlementDetailPage settlementId={settlementId} />
}
