import { SendHorizontal, Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useSession } from '@/app/session-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

// Future-capability preview only: no AI is called — every question gets the same
// "próxima etapa" reply. See docs/requirements.md (asistente IA).
const SUGGESTIONS = [
  '¿Qué contratos vencen este mes?',
  'Mostrame los alquileres con deuda',
  '¿Qué visitas tengo hoy?',
  'Buscá propiedades disponibles en Coghlan',
]

const PREVIEW_REPLY = 'Esta funcionalidad estará disponible en una próxima etapa.'

interface Message {
  from: 'user' | 'assistant'
  text: string
}

export function AssistantLauncher() {
  const { user } = useSession()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<Message[]>([])

  function ask(text: string) {
    const question = text.trim()
    if (!question) return
    setMessages((prev) => [...prev, { from: 'user', text: question }, { from: 'assistant', text: PREVIEW_REPLY }])
    setDraft('')
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    ask(draft)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir asistente IA"
        title="Asistente IA (próximamente)"
        className="fixed right-4 bottom-20 z-30 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/15 transition-transform outline-none hover:scale-105 focus-visible:ring-ring/60 md:right-6 md:bottom-6"
      >
        <Sparkles className="size-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full gap-0 sm:max-w-md data-[side=right]:w-full data-[side=right]:sm:max-w-md">
          <SheetHeader className="border-b border-border pr-12">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-4.5" />
              </div>
              <div className="min-w-0">
                <SheetTitle>Asistente Fernández López</SheetTitle>
                <SheetDescription>Versión de demostración · Próximamente</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-sm text-foreground">
              <p>Hola {user.name.split(' ')[0]} 👋</p>
              <p className="mt-1.5">
                En una próxima etapa vas a poder pedirme información o acciones directamente sobre Fernández López. Por
                ejemplo:
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => ask(suggestion)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-left text-xs font-medium text-foreground transition-colors outline-none hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {messages.map((message, i) =>
              message.from === 'user' ? (
                <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">
                  {message.text}
                </div>
              ) : (
                <div key={i} className="max-w-[90%] rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2 text-sm text-muted-foreground">
                  {message.text}
                </div>
              ),
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-border p-4">
            <p className="text-xs text-muted-foreground">
              En una futura versión, el asistente podrá consultar información, buscar propiedades, resumir contratos y
              acelerar cargas y acciones dentro del sistema.
            </p>
            <form onSubmit={onSubmit} className="flex items-center gap-2">
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Preguntale algo al sistema..."
                aria-label="Mensaje para el asistente"
                className="h-9"
              />
              <Button type="submit" size="icon" className="size-9" aria-label="Enviar" disabled={!draft.trim()}>
                <SendHorizontal className="size-4" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
