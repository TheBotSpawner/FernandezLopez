import { ArrowLeft, CalendarDays, ExternalLink, FileText, SearchX, Wrench } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SectionCard } from '@/components/data-display/SectionCard'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatPeriodLabel } from '@/features/administration/account-utils'
import { formatARS, formatDateOnly, formatShortDate, formatTime } from '@/lib/format'
import { getConsorcioDetail, type ConsorcioDetail } from '@/services/consorcio-service'
import { findContactSync } from '@/services/contact-service'
import { findUserSync } from '@/services/user-service'
import type { ConsorcioUnit } from '@/types/consorcio'
import { CollectionBar } from './ConsorciosPage'
import { ASSEMBLY_TYPE, CONSORCIO_STATUS, MAINTENANCE_STATUS, UNIT_EXPENSE_STATUS, collectionState } from './consorcio-labels'

function ContactLink({ id, fallback = '—' }: { id?: string; fallback?: string }) {
  const contact = id ? findContactSync(id) : undefined
  if (!contact) return <span className="text-muted-foreground">{fallback}</span>
  return (
    <Link to={`/contacts/${contact.id}`} className="text-foreground hover:text-primary hover:underline">
      {contact.fullName}
    </Link>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="text-sm font-semibold text-foreground">{children}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className={strong ? 'font-medium text-foreground' : 'text-muted-foreground'}>{label}</span>
      <span className={strong ? 'font-semibold text-foreground tabular-nums' : 'text-foreground tabular-nums'}>{value}</span>
    </div>
  )
}

function UnitStatus({ unit }: { unit: ConsorcioUnit }) {
  if (!unit.expenseStatus) return null
  const status = UNIT_EXPENSE_STATUS[unit.expenseStatus]
  return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
}

function ResumenTab({ detail }: { detail: ConsorcioDetail }) {
  const { consorcio, summary, issues } = detail
  const administrator = consorcio.administratorUserId ? findUserSync(consorcio.administratorUserId) : undefined
  const state = collectionState(summary.collectedPct)
  const openIssues = issues.filter((i) => i.status !== 'RESOLVED')

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="Unidades">{summary.unitCount}</Field>
          <Field label="Período actual">{formatPeriodLabel(consorcio.currentPeriod)}</Field>
          <Field label="Responsable">{administrator?.name ?? '—'}</Field>
          <Field label="Encargado">{consorcio.managerName ?? '—'}</Field>
          <Field label="CUIT">{consorcio.taxId ?? '—'}</Field>
          {consorcio.reserveFund != null && <Field label="Fondo de reserva">{formatARS(consorcio.reserveFund)}</Field>}
        </div>
        {consorcio.notes && (
          <div className="flex flex-col gap-1.5">
            <h3 className="text-sm font-medium text-foreground">Notas</h3>
            <p className="text-sm text-muted-foreground">{consorcio.notes}</p>
          </div>
        )}
        <SectionCard title="Reclamos abiertos">
          {openIssues.length === 0 ? (
            <EmptyState icon={Wrench} message="No hay reclamos abiertos." />
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {openIssues.map((issue) => (
                <li key={issue.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="text-foreground">{issue.title}</span>
                  <StatusBadge tone={MAINTENANCE_STATUS[issue.status].tone}>{MAINTENANCE_STATUS[issue.status].label}</StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Estado del período" description={formatPeriodLabel(consorcio.currentPeriod)}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <StatusBadge tone={state.tone}>{state.label}</StatusBadge>
            <CollectionBar pct={summary.collectedPct} />
          </div>
          <div className="divide-y divide-border">
            <SummaryRow label="Total a distribuir" value={formatARS(summary.totalToDistribute)} />
            <SummaryRow label="Cobrado" value={formatARS(summary.collected)} />
            <SummaryRow label="Pendiente" value={formatARS(summary.pending)} strong />
            <SummaryRow label="Unidades pendientes" value={String(summary.pendingUnits)} />
            <SummaryRow label="Reclamos abiertos" value={String(summary.openIssues)} />
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

function UnidadesTab({ units, periodLabel }: { units: ConsorcioUnit[]; periodLabel: string }) {
  const linkedProperty = (unit: ConsorcioUnit) =>
    unit.linkedPropertyId && (
      <Link
        to={`/properties/${unit.linkedPropertyId}`}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        Ver propiedad
        <ExternalLink className="size-3" />
      </Link>
    )
  const occupant = (unit: ConsorcioUnit) =>
    unit.occupantContactId === unit.ownerContactId && unit.occupantContactId ? (
      <span className="text-muted-foreground">Propietario</span>
    ) : (
      <ContactLink id={unit.occupantContactId} fallback="Desocupada" />
    )

  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:hidden">
        {units.map((unit) => (
          <div key={unit.id} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground">{unit.unitLabel}</span>
              <UnitStatus unit={unit} />
            </div>
            <p className="text-muted-foreground">
              Propietario: <ContactLink id={unit.ownerContactId} />
            </p>
            <p className="text-muted-foreground">Ocupante: {occupant(unit)}</p>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Coef. {unit.coefficient?.toLocaleString('es-AR')}%</span>
              <span className="font-medium text-foreground tabular-nums">{formatARS(unit.currentExpenseAmount ?? 0)}</span>
            </div>
            {linkedProperty(unit)}
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">Unidad</th>
              <th className="px-3 py-2 font-medium">Propietario</th>
              <th className="px-3 py-2 font-medium">Ocupante</th>
              <th className="px-3 py-2 text-right font-medium">Coeficiente</th>
              <th className="px-3 py-2 text-right font-medium">Expensas {periodLabel.toLowerCase()}</th>
              <th className="px-3 py-2 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {units.map((unit) => (
              <tr key={unit.id} className="hover:bg-muted/50">
                <td className="px-3 py-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{unit.unitLabel}</span>
                    {linkedProperty(unit)}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <ContactLink id={unit.ownerContactId} />
                </td>
                <td className="px-3 py-2">{occupant(unit)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{unit.coefficient?.toLocaleString('es-AR')}%</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatARS(unit.currentExpenseAmount ?? 0)}</td>
                <td className="px-3 py-2">
                  <UnitStatus unit={unit} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function ExpensasTab({ detail }: { detail: ConsorcioDetail }) {
  const { consorcio, summary, units } = detail
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <SectionCard title={formatPeriodLabel(consorcio.currentPeriod)} description="Liquidación del período (referencia)">
        <div className="divide-y divide-border">
          <SummaryRow label="Gastos del período" value={formatARS(summary.expensesTotal)} />
          <SummaryRow label="Fondo de reserva" value={formatARS(summary.reserveContribution)} />
          <SummaryRow label="Total a distribuir" value={formatARS(summary.totalToDistribute)} strong />
          <SummaryRow label="Cobrado" value={formatARS(summary.collected)} />
          <SummaryRow label="Pendiente" value={formatARS(summary.pending)} strong />
        </div>
      </SectionCard>
      <SectionCard title="Distribución por unidad" className="lg:col-span-2">
        <ul className="flex flex-col divide-y divide-border">
          {units.map((unit) => (
            <li key={unit.id} className="flex items-center gap-3 py-2 text-sm">
              <span className="w-14 shrink-0 font-medium text-foreground">{unit.unitLabel}</span>
              <span className="flex-1 text-right text-foreground tabular-nums">
                {formatARS(unit.currentExpenseAmount ?? 0)}
                {unit.expenseStatus === 'PARTIAL' && (
                  <span className="block text-xs text-muted-foreground">Pagó {formatARS(unit.paidAmount ?? 0)}</span>
                )}
              </span>
              <span className="flex w-24 justify-end">
                <UnitStatus unit={unit} />
              </span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  )
}

function GastosTab({ detail }: { detail: ConsorcioDetail }) {
  const expenses = detail.expenses.filter((e) => e.period === detail.consorcio.currentPeriod)
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <SectionCard
        title="Gastos comunes"
        description={formatPeriodLabel(detail.consorcio.currentPeriod)}
        className="lg:col-span-2"
      >
        <ul className="flex flex-col divide-y divide-border">
          {expenses.map((expense) => (
            <li key={expense.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{expense.description}</p>
                <p className="text-xs text-muted-foreground">
                  {expense.category}
                  {expense.provider ? ` · ${expense.provider}` : ''} · {formatDateOnly(expense.date, 'd MMM')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-foreground tabular-nums">{formatARS(expense.amount)}</span>
                <StatusBadge tone={expense.status === 'PAID' ? 'success' : 'warning'}>
                  {expense.status === 'PAID' ? 'Pagado' : 'A pagar'}
                </StatusBadge>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="Mantenimiento y reclamos">
        {detail.issues.length === 0 ? (
          <EmptyState icon={Wrench} message="Sin reclamos registrados." />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {detail.issues.map((issue) => (
              <li key={issue.id} className="flex flex-col gap-1 py-2.5 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-foreground">{issue.title}</span>
                  <StatusBadge tone={MAINTENANCE_STATUS[issue.status].tone}>{MAINTENANCE_STATUS[issue.status].label}</StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatShortDate(issue.reportedAt)}
                  {issue.unitLabel ? ` · ${issue.unitLabel}` : ''}
                  {issue.provider ? ` · Proveedor: ${issue.provider}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  )
}

function DocumentosTab({ detail }: { detail: ConsorcioDetail }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SectionCard title="Documentos" description="Vista de referencia — sin almacenamiento real de archivos.">
        <ul className="flex flex-col divide-y divide-border">
          {detail.documents.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 py-2.5 text-sm">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-foreground">{doc.name}</span>
              <span className="text-xs whitespace-nowrap text-muted-foreground">{formatDateOnly(doc.date, 'd MMM yyyy')}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="Asambleas">
        {detail.assemblies.length === 0 ? (
          <EmptyState icon={CalendarDays} message="Sin asambleas registradas." />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {detail.assemblies.map((assembly) => (
              <li key={assembly.id} className="flex flex-col gap-1 py-2.5 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-foreground">{ASSEMBLY_TYPE[assembly.type]}</span>
                  <StatusBadge tone={assembly.status === 'SCHEDULED' ? 'info' : 'muted'}>
                    {assembly.status === 'SCHEDULED' ? 'Programada' : 'Finalizada'}
                  </StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatShortDate(assembly.date)} · {formatTime(assembly.date)}
                </p>
                {assembly.notes && <p className="text-muted-foreground">{assembly.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  )
}

export function ConsorcioDetailPage({ consorcioId }: { consorcioId: string | undefined }) {
  const detail = useMemo(() => getConsorcioDetail(consorcioId), [consorcioId])

  if (!detail) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <SearchX className="size-6" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Consorcio no encontrado</h1>
            <p className="text-sm text-muted-foreground">Este consorcio no existe o ya no está administrado.</p>
            <Button nativeButton={false} render={<Link to="/consorcios" />}>
              Volver a consorcios
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { consorcio } = detail
  const status = CONSORCIO_STATUS[consorcio.status]

  return (
    <div className="flex flex-col gap-4">
      <Link to="/consorcios" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Volver a consorcios
      </Link>

      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-foreground">{consorcio.name}</h1>
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        </div>
        <p className="text-sm text-muted-foreground">
          {consorcio.address} · {consorcio.neighborhood}, {consorcio.city}
        </p>
      </div>

      <Tabs defaultValue="resumen">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="unidades">Unidades</TabsTrigger>
          <TabsTrigger value="expensas">Expensas</TabsTrigger>
          <TabsTrigger value="gastos">Gastos y mantenimiento</TabsTrigger>
          <TabsTrigger value="documentos">Documentos y asambleas</TabsTrigger>
        </TabsList>
        <TabsContent value="resumen" className="pt-4">
          <ResumenTab detail={detail} />
        </TabsContent>
        <TabsContent value="unidades" className="pt-4">
          <UnidadesTab units={detail.units} periodLabel={formatPeriodLabel(consorcio.currentPeriod).split(' ')[0]} />
        </TabsContent>
        <TabsContent value="expensas" className="pt-4">
          <ExpensasTab detail={detail} />
        </TabsContent>
        <TabsContent value="gastos" className="pt-4">
          <GastosTab detail={detail} />
        </TabsContent>
        <TabsContent value="documentos" className="pt-4">
          <DocumentosTab detail={detail} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
