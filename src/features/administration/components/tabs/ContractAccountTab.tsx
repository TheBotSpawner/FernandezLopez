import { Wallet2 } from 'lucide-react'

export function ContractAccountTab() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Wallet2 className="size-6" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-sm font-medium text-foreground">Cuenta mensual</p>
        <p className="text-sm text-muted-foreground">
          La cuenta mensual detallará alquiler, expensas, servicios, pagos y saldos. Disponible en el próximo milestone del prototipo.
        </p>
      </div>
    </div>
  )
}
