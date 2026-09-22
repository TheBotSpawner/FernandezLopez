import { RotateCcw } from 'lucide-react'
import { SectionCard } from '@/components/data-display/SectionCard'
import { Button } from '@/components/ui/button'
import { resetDemoData } from '@/lib/demo-reset'

export function DemoResetCard() {
  function handleReset() {
    const confirmed = window.confirm(
      '¿Restaurar los datos de demostración? Se perderán los cambios hechos en esta sesión (contactos, contratos, pagos, usuarios, etc.) y se van a volver a cargar los datos iniciales.',
    )
    if (confirmed) resetDemoData()
  }

  return (
    <SectionCard title="Zona de demostración" description="Datos del prototipo — no afecta ningún sistema real.">
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm text-muted-foreground">
          Restaura contactos, propiedades, oportunidades, visitas, contratos, cargos, pagos, recibos, liquidaciones,
          usuarios y preferencias a los datos de demostración originales.
        </p>
        <Button variant="destructive" size="sm" onClick={handleReset} className="gap-1.5">
          <RotateCcw className="size-4" />
          Restaurar datos de demostración
        </Button>
      </div>
    </SectionCard>
  )
}
