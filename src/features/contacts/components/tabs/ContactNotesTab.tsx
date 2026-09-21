import { zodResolver } from '@hookform/resolvers/zod'
import { StickyNote } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useToast } from '@/app/toast-context'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatShortDate } from '@/lib/format'
import { getUserForContact } from '@/mocks/contacts'
import { addContactNote } from '@/services/contact-service'
import type { ContactNote } from '@/types/contact'

const noteSchema = z.object({ text: z.string().min(2, 'Escribí una nota antes de guardar') })
type NoteFormValues = z.infer<typeof noteSchema>

export function ContactNotesTab({
  contactId,
  authorUserId,
  notes,
  onAdded,
}: {
  contactId: string
  authorUserId: string
  notes: ContactNote[]
  onAdded: () => void
}) {
  const { showToast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormValues>({ resolver: zodResolver(noteSchema), defaultValues: { text: '' } })

  async function onSubmit(values: NoteFormValues) {
    await addContactNote(contactId, authorUserId, values.text)
    reset()
    showToast('Nota guardada')
    onAdded()
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <textarea
          {...register('text')}
          rows={3}
          placeholder="Agregar una nota..."
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        {errors.text && <p className="text-xs text-danger">{errors.text.message}</p>}
        <Button type="submit" size="sm" className="self-start" disabled={isSubmitting}>
          Guardar nota
        </Button>
      </form>

      {notes.length === 0 ? (
        <EmptyState icon={StickyNote} message="Todavía no hay notas para este contacto." />
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {notes.map((note) => {
            const author = getUserForContact(note.authorUserId)
            return (
              <li key={note.id} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm text-foreground">{note.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {author?.name ?? 'Usuario'} · {formatShortDate(note.createdAt)}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
