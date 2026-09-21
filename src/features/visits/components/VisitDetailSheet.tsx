import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '@/app/toast-context'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { formatShortDate, formatTime } from '@/lib/format'
import { propertyTitle } from '@/features/properties/property-format'
import { findContactSync } from '@/services/contact-service'
import { changeStage, findOpportunitySync } from '@/services/opportunity-service'
import { findPropertySync } from '@/services/property-service'
import { getDemoUsers } from '@/services/user-service'
import { completeVisit, updateVisit } from '@/services/visit-service'
import { stagesFor } from '@/types/opportunity'
import { VISIT_OUTCOME_OPTIONS, VISIT_OUTCOME_STAGE_MAP, VISIT_STATUS_TONES } from '../visit-labels'
import type { Visit, VisitOutcome } from '@/types/visit'

export function VisitDetailSheet({
  visit,
  open,
  onOpenChange,
  onChanged,
}: {
  visit: Visit | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onChanged: () => void
}) {
  const { showToast } = useToast()
  const users = getDemoUsers()
  const [outcome, setOutcome] = useState<VisitOutcome | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setOutcome(null)
    setNote('')
  }, [open, visit?.id])

  if (!visit) return null

  const contact = findContactSync(visit.contactId)
  const property = findPropertySync(visit.propertyId)
  const agent = users.find((u) => u.id === visit.assignedUserId)
  const pending = visit.status === 'Programada' || visit.status === 'Confirmada'

  async function handleComplete() {
    if (!outcome) return
    setSubmitting(true)
    await completeVisit(visit!.id, outcome, note || undefined)

    const targetStage = VISIT_OUTCOME_STAGE_MAP[outcome]
    if (visit!.opportunityId && targetStage) {
      const opportunity = findOpportunitySync(visit!.opportunityId)
      if (opportunity && opportunity.stage !== targetStage && stagesFor(opportunity.type).includes(targetStage)) {
        await changeStage(opportunity.id, targetStage)
      }
    }

    setSubmitting(false)
    showToast('Visita completada')
    onChanged()
    onOpenChange(false)
  }

  async function handleCancel() {
    setSubmitting(true)
    await updateVisit(visit!.id, { status: 'Cancelada' })
    setSubmitting(false)
    showToast('Visita cancelada')
    onChanged()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0">
        <SheetHeader>
          <SheetTitle>Visita</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {formatShortDate(visit.startAt)} · {formatTime(visit.startAt)}
              </p>
              <p className="text-xs text-muted-foreground">{agent?.name ?? '—'}</p>
            </div>
            <StatusBadge tone={VISIT_STATUS_TONES[visit.status]}>{visit.status}</StatusBadge>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Contacto</span>
            {contact ? (
              <Link to={`/contacts/${contact.id}`} className="text-sm font-medium text-foreground hover:underline">
                {contact.fullName}
              </Link>
            ) : (
              <span className="text-sm text-foreground">—</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Propiedad</span>
            {property ? (
              <Link to={`/properties/${property.id}`} className="text-sm font-medium text-foreground hover:underline">
                {propertyTitle(property)}
              </Link>
            ) : (
              <span className="text-sm text-foreground">—</span>
            )}
          </div>

          {visit.notes && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Notas</span>
              <p className="text-sm text-foreground">{visit.notes}</p>
            </div>
          )}

          {visit.outcome && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Resultado</span>
              <p className="text-sm text-foreground">{visit.outcome}</p>
            </div>
          )}

          {pending && (
            <div className="flex flex-col gap-3 border-t border-border pt-4">
              <span className="text-sm font-medium text-foreground">Registrar resultado</span>
              <div className="flex flex-wrap gap-1.5">
                {VISIT_OUTCOME_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={outcome === option}
                    onClick={() => setOutcome(option)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      outcome === option
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Notas sobre la visita (opcional)"
                rows={2}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
          )}
        </div>

        {pending && (
          <SheetFooter className="flex-row">
            <Button variant="outline" className="flex-1" onClick={handleCancel} disabled={submitting}>
              Cancelar visita
            </Button>
            <Button className="flex-1" onClick={handleComplete} disabled={!outcome || submitting}>
              Guardar resultado
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
