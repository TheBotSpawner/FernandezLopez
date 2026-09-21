import { Clock, FileText } from 'lucide-react'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { Button } from '@/components/ui/button'
import type { ContractDocument } from '../../contract-detail-derivations'

export function ContractDocumentsTab({ documents }: { documents: ContractDocument[] }) {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {documents.map((document) => (
        <li key={document.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          {document.status === 'available' ? (
            <FileText className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <Clock className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className="flex-1 text-sm text-foreground">{document.label}</span>
          <StatusBadge tone={document.status === 'available' ? 'success' : 'warning'}>
            {document.status === 'available' ? 'Disponible' : 'Pendiente'}
          </StatusBadge>
          <Button
            variant="ghost"
            size="sm"
            disabled={document.status !== 'available'}
            title="Vista previa no disponible en el prototipo"
          >
            Ver
          </Button>
        </li>
      ))}
    </ul>
  )
}
