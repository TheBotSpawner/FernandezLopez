import { Wallet2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function SettlementsPlaceholderPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Liquidaciones</h1>
        <p className="text-sm text-muted-foreground">Liquidaciones a propietarios.</p>
      </div>

      <Card>
        <CardContent className="flex min-h-[40svh] flex-col items-center justify-center gap-3 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Wallet2 className="size-6" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Próximamente</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            La gestión de liquidaciones a propietarios — cobros, deducciones, comisión de administración y monto neto — estará
            disponible en la próxima etapa del prototipo.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
