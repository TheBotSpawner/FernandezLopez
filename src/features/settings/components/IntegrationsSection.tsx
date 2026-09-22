import { Bell, Calendar, MessageCircle, Building, Receipt } from 'lucide-react'
import { SectionCard } from '@/components/data-display/SectionCard'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import type { LucideIcon } from 'lucide-react'

const INTEGRATIONS: { name: string; description: string; icon: LucideIcon }[] = [
  { name: 'WhatsApp', description: 'Mensajería con contactos e inquilinos.', icon: MessageCircle },
  { name: 'Email', description: 'Envío automático de recibos y notificaciones.', icon: MessageCircle },
  { name: 'Google Calendar', description: 'Sincronización de visitas agendadas.', icon: Calendar },
  { name: 'Portales inmobiliarios', description: 'Publicación automática de propiedades.', icon: Building },
  { name: 'ARCA', description: 'Facturación electrónica.', icon: Receipt },
]

const NOTIFICATIONS = ['Alertas por WhatsApp', 'Alertas por email', 'Recordatorios']

export function IntegrationsSection() {
  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Integraciones" description="Funcionalidad planificada para una fase futura — no operativa en este prototipo.">
        <div className="grid gap-3 sm:grid-cols-2">
          {INTEGRATIONS.map((integration) => (
            <div key={integration.name} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
              <div className="flex items-start gap-2.5">
                <integration.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{integration.name}</p>
                  <p className="text-xs text-muted-foreground">{integration.description}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <StatusBadge tone="muted">No configurado</StatusBadge>
                <Button variant="outline" size="sm" disabled>
                  Próximamente
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Notificaciones" description="Sección futura — la entrega real de notificaciones no está implementada.">
        <div className="flex flex-col gap-2">
          {NOTIFICATIONS.map((label) => (
            <div key={label} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-2.5">
                <Bell className="size-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{label}</span>
              </div>
              <StatusBadge tone="muted">Próximamente</StatusBadge>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
