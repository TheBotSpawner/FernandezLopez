import { CONTACTS } from './contacts'
import { DAYS_INTO_MONTH, demoDate } from './demo-clock'
import { BRANCH_IDS } from './organization'
import { currentPeriod } from '@/features/administration/account-utils'
import type {
  Consorcio,
  ConsorcioAssembly,
  ConsorcioDocument,
  ConsorcioExpense,
  ConsorcioIssue,
  ConsorcioUnit,
  UnitExpenseStatus,
} from '@/types/consorcio'

function mulberry32(seed: number) {
  let state = seed
  return function random() {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)]
}

function dateOnly(daysFromToday: number): string {
  const d = demoDate(daysFromToday)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const PERIOD = currentPeriod()
const OWNER_POOL = CONTACTS.filter((c) => c.roles.includes('owner'))
const TENANT_POOL = CONTACTS.filter((c) => c.roles.includes('tenant'))

// Share of the period's common expenses per line — amounts scale with each building's size.
const EXPENSE_TEMPLATE: { description: string; category: string; provider?: string; weight: number }[] = [
  { description: 'Edesur áreas comunes', category: 'Servicios', provider: 'Edesur', weight: 6 },
  { description: 'Metrogas áreas comunes', category: 'Servicios', provider: 'Metrogas', weight: 3 },
  { description: 'AySA', category: 'Servicios', provider: 'AySA', weight: 4 },
  { description: 'Ascensores — abono mensual', category: 'Mantenimiento', provider: 'Ascensores Norte', weight: 12 },
  { description: 'Limpieza', category: 'Limpieza', provider: 'Limpiezas Integrales SRL', weight: 22 },
  { description: 'Seguro integral', category: 'Seguros', provider: 'La Segunda Seguros', weight: 8 },
  { description: 'Mantenimiento general', category: 'Mantenimiento', provider: 'Servicios Edilicios Coghlan', weight: 18 },
  { description: 'Honorarios de administración', category: 'Administración', provider: 'Fernández López', weight: 15 },
]

interface ConsorcioSpec {
  id: string
  name: string
  address: string
  neighborhood: string
  branchId: string
  taxId: string
  floors: number
  unitsPerFloor: number
  hasGroundFloor: boolean
  /** Average monthly expense per unit, before the reserve contribution. */
  perUnitExpense: number
  reserveContribution: number
  reserveFund: number
  administratorUserId: string
  managerName?: string
  managerPhone?: string
  status?: Consorcio['status']
  notes?: string
  createdDaysAgo: number
  /** Units Fernández López also manages as a Property: unit label → property id + owner contact. */
  linkedUnits?: Record<string, { propertyId: string; ownerContactId: string }>
  extraExpenses?: { description: string; category: string; provider?: string; amount: number; status?: 'PAID' | 'PENDING' }[]
  issues?: { title: string; status: ConsorcioIssue['status']; provider?: string; unitLabel?: string; daysAgo: number }[]
  documents?: { name: string; type: string; daysAgo: number }[]
  assemblies?: { type: ConsorcioAssembly['type']; daysFromToday: number; status: ConsorcioAssembly['status']; notes?: string }[]
  seed: number
}

const SPECS: ConsorcioSpec[] = [
  {
    id: 'consorcio-monroe-2450',
    name: 'Consorcio Monroe 2450',
    address: 'Monroe 2450',
    neighborhood: 'Coghlan',
    branchId: BRANCH_IDS.coghlan,
    taxId: '30-71234567-1',
    floors: 8,
    unitsPerFloor: 2,
    hasGroundFloor: true,
    perUnitExpense: 172000,
    reserveContribution: 250000,
    reserveFund: 4850000,
    administratorUserId: 'user-martin',
    managerName: 'Raúl Benítez',
    managerPhone: '+54 11 4545-7720',
    notes: 'Edificio de 1998 con 2 ascensores. Encargado con vivienda en planta baja.',
    createdDaysAgo: 900,
    linkedUnits: { '4°A': { propertyId: 'prop-1', ownerContactId: 'contact-maria' } },
    extraExpenses: [{ description: 'Reparación de bomba de agua', category: 'Reparaciones', provider: 'Hidráulica Saavedra', amount: 185000, status: 'PENDING' }],
    issues: [
      { title: 'Ascensor 2 no funciona', status: 'IN_PROGRESS', provider: 'Ascensores Norte', daysAgo: 3 },
      { title: 'Humedad en hall de planta baja', status: 'PENDING', unitLabel: 'PB A', daysAgo: 6 },
      { title: 'Luz de escalera 5° piso', status: 'RESOLVED', provider: 'Servicios Edilicios Coghlan', daysAgo: 15 },
    ],
    documents: [
      { name: 'Acta Asamblea Ordinaria 2026', type: 'Acta', daysAgo: 160 },
      { name: 'Presupuesto ascensores', type: 'Presupuesto', daysAgo: 4 },
      { name: 'Factura mantenimiento', type: 'Factura', daysAgo: 2 },
    ],
    assemblies: [
      { type: 'ORDINARY', daysFromToday: 14, status: 'SCHEDULED', notes: 'Rendición de cuentas y renovación del seguro integral.' },
      { type: 'EXTRAORDINARY', daysFromToday: -81, status: 'DONE', notes: 'Aprobación del presupuesto de modernización de ascensores.' },
    ],
    seed: 2450,
  },
  {
    id: 'consorcio-congreso-2890',
    name: 'Consorcio Av. Congreso 2890',
    address: 'Av. Congreso 2890',
    neighborhood: 'Coghlan',
    branchId: BRANCH_IDS.coghlan,
    taxId: '30-70987654-3',
    floors: 10,
    unitsPerFloor: 3,
    hasGroundFloor: true,
    perUnitExpense: 138000,
    reserveContribution: 320000,
    reserveFund: 6200000,
    administratorUserId: 'user-martin',
    managerName: 'Graciela Ortiz',
    managerPhone: '+54 11 4543-1180',
    createdDaysAgo: 1400,
    extraExpenses: [{ description: 'Pintura de palieres (cuota 2/4)', category: 'Reparaciones', provider: 'Pinturas del Norte', amount: 420000 }],
    issues: [
      { title: 'Portero eléctrico con fallas', status: 'PENDING', unitLabel: '7°C', daysAgo: 2 },
      { title: 'Filtración en terraza', status: 'IN_PROGRESS', provider: 'Impermeabilizaciones BA', daysAgo: 9 },
    ],
    documents: [
      { name: 'Acta Asamblea Ordinaria 2026', type: 'Acta', daysAgo: 140 },
      { name: 'Presupuesto impermeabilización terraza', type: 'Presupuesto', daysAgo: 8 },
    ],
    assemblies: [{ type: 'ORDINARY', daysFromToday: -140, status: 'DONE', notes: 'Aprobación de pintura de palieres en 4 cuotas.' }],
    seed: 2890,
  },
  {
    id: 'consorcio-olazabal-2200',
    name: 'Consorcio Olazábal 2200',
    address: 'Olazábal 2200',
    neighborhood: 'Belgrano',
    branchId: BRANCH_IDS.belgrano,
    taxId: '30-71555222-8',
    floors: 12,
    unitsPerFloor: 2,
    hasGroundFloor: true,
    perUnitExpense: 195000,
    reserveContribution: 300000,
    reserveFund: 3100000,
    administratorUserId: 'user-lucia',
    managerName: 'Héctor Juárez',
    managerPhone: '+54 11 4782-3390',
    notes: 'Amenities: SUM y laundry. Pileta en terraza (temporada de noviembre a marzo).',
    createdDaysAgo: 620,
    extraExpenses: [{ description: 'Mantenimiento de pileta', category: 'Mantenimiento', provider: 'Piletas Belgrano', amount: 160000, status: 'PENDING' }],
    issues: [
      { title: 'Cambio de luminarias en cocheras', status: 'IN_PROGRESS', provider: 'Electricidad Juramento', daysAgo: 5 },
      { title: 'Ruidos molestos reportados', status: 'PENDING', unitLabel: '9°B', daysAgo: 1 },
    ],
    documents: [{ name: 'Acta Asamblea Ordinaria 2026', type: 'Acta', daysAgo: 120 }],
    assemblies: [
      { type: 'EXTRAORDINARY', daysFromToday: 21, status: 'SCHEDULED', notes: 'Tratamiento de presupuesto de puesta en valor de la pileta.' },
      { type: 'ORDINARY', daysFromToday: -120, status: 'DONE' },
    ],
    seed: 2200,
  },
  {
    id: 'consorcio-cabildo-3120',
    name: 'Consorcio Cabildo 3120',
    address: 'Av. Cabildo 3120',
    neighborhood: 'Belgrano',
    branchId: BRANCH_IDS.belgrano,
    taxId: '30-70444111-5',
    floors: 14,
    unitsPerFloor: 3,
    hasGroundFloor: false,
    perUnitExpense: 124000,
    reserveContribution: 380000,
    reserveFund: 7400000,
    administratorUserId: 'user-lucia',
    managerName: 'Miguel Ferreyra',
    managerPhone: '+54 11 4781-6602',
    createdDaysAgo: 2100,
    linkedUnits: { '2°B': { propertyId: 'prop-2', ownerContactId: 'contact-owner-2' } },
    issues: [{ title: 'Revisión de matafuegos', status: 'RESOLVED', provider: 'Matafuegos Belgrano', daysAgo: 12 }],
    seed: 3120,
  },
  {
    id: 'consorcio-blanco-encalada-2112',
    name: 'Consorcio Blanco Encalada 2112',
    address: 'Blanco Encalada 2112',
    neighborhood: 'Belgrano',
    branchId: BRANCH_IDS.belgrano,
    taxId: '30-71888999-0',
    floors: 6,
    unitsPerFloor: 3,
    hasGroundFloor: true,
    perUnitExpense: 118000,
    reserveContribution: 150000,
    reserveFund: 620000,
    administratorUserId: 'user-lucia',
    status: 'ONBOARDING',
    notes: 'Administración tomada este año. Pendiente recibir documentación histórica de la administración anterior.',
    createdDaysAgo: 45,
    issues: [{ title: 'Relevamiento inicial del edificio', status: 'IN_PROGRESS', daysAgo: 20 }],
    seed: 2112,
  },
  {
    id: 'consorcio-tamborini-3450',
    name: 'Consorcio Tamborini 3450',
    address: 'Tamborini 3450',
    neighborhood: 'Coghlan',
    branchId: BRANCH_IDS.coghlan,
    taxId: '30-70222333-6',
    floors: 7,
    unitsPerFloor: 2,
    hasGroundFloor: true,
    perUnitExpense: 146000,
    reserveContribution: 120000,
    reserveFund: 1850000,
    administratorUserId: 'user-martin',
    managerName: 'Oscar Peralta',
    managerPhone: '+54 11 4542-0918',
    createdDaysAgo: 760,
    seed: 3450,
  },
]

const STATUS_WEIGHTS: [UnitExpenseStatus, number][] = [
  ['PAID', 84],
  ['PENDING', 10],
  ['PARTIAL', 6],
]

function weightedPick<T>(weights: [T, number][], rng: () => number): T {
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = rng() * total
  for (const [value, weight] of weights) {
    roll -= weight
    if (roll <= 0) return value
  }
  return weights[0][0]
}

function round(value: number, step: number): number {
  return Math.round(value / step) * step
}

function buildExpenses(spec: ConsorcioSpec, unitCount: number, rng: () => number): ConsorcioExpense[] {
  const base = spec.perUnitExpense * unitCount
  const totalWeight = EXPENSE_TEMPLATE.reduce((sum, line) => sum + line.weight, 0)
  const lines = [
    ...EXPENSE_TEMPLATE.map((line) => ({ ...line, amount: round((base * line.weight) / totalWeight, 1000), status: undefined })),
    ...(spec.extraExpenses ?? []),
  ]
  return lines.map((line, i) => ({
    id: `${spec.id}-expense-${i + 1}`,
    consorcioId: spec.id,
    period: PERIOD,
    description: line.description,
    category: line.category,
    amount: line.amount,
    // Bills arrive across the month so far — never dated in the future.
    date: `${PERIOD}-${String(1 + Math.floor(rng() * Math.min(10, DAYS_INTO_MONTH + 1))).padStart(2, '0')}`,
    provider: line.provider,
    status: line.status ?? (rng() < 0.8 ? 'PAID' : 'PENDING'),
  }))
}

function unitLabels(spec: ConsorcioSpec): { label: string; floor: string }[] {
  const letters = ['A', 'B', 'C', 'D'].slice(0, spec.unitsPerFloor)
  const labels: { label: string; floor: string }[] = []
  if (spec.hasGroundFloor) for (const letter of letters) labels.push({ label: `PB ${letter}`, floor: 'PB' })
  for (let floor = 1; floor <= spec.floors; floor++) {
    for (const letter of letters) labels.push({ label: `${floor}°${letter}`, floor: `${floor}°` })
  }
  return labels
}

function buildUnits(spec: ConsorcioSpec, totalToDistribute: number, rng: () => number): ConsorcioUnit[] {
  const labels = unitLabels(spec)
  // Front units (A) are a bit larger, ground-floor units a bit smaller — enough to make coefficients look real.
  const weights = labels.map(({ label, floor }) => (label.endsWith('A') ? 1.12 : 0.94) * (floor === 'PB' ? 0.85 : 1))
  const weightSum = weights.reduce((sum, w) => sum + w, 0)

  let distributed = 0
  return labels.map(({ label, floor }, i) => {
    const coefficient = Math.round((weights[i] / weightSum) * 10000) / 100
    const isLast = i === labels.length - 1
    // The last unit absorbs rounding so units always add up to the period total.
    const amount = isLast ? totalToDistribute - distributed : round((totalToDistribute * weights[i]) / weightSum, 100)
    distributed += amount

    const linked = spec.linkedUnits?.[label]
    const ownerContactId = linked?.ownerContactId ?? pick(OWNER_POOL, rng).id
    const occupancyRoll = rng()
    const occupantContactId = linked
      ? undefined
      : occupancyRoll < 0.55
        ? ownerContactId
        : occupancyRoll < 0.9
          ? pick(TENANT_POOL, rng).id
          : undefined
    const expenseStatus = weightedPick(STATUS_WEIGHTS, rng)
    const paidAmount = expenseStatus === 'PAID' ? amount : expenseStatus === 'PARTIAL' ? round(amount * 0.5, 100) : 0

    return {
      id: `${spec.id}-unit-${i + 1}`,
      consorcioId: spec.id,
      unitLabel: label,
      floor,
      functionalUnitNumber: i + 1,
      ownerContactId,
      occupantContactId,
      coefficient,
      currentExpenseAmount: amount,
      paidAmount,
      expenseStatus,
      linkedPropertyId: linked?.propertyId,
    }
  })
}

export const CONSORCIOS: Consorcio[] = []
export const CONSORCIO_UNITS: ConsorcioUnit[] = []
export const CONSORCIO_EXPENSES: ConsorcioExpense[] = []
export const CONSORCIO_ISSUES: ConsorcioIssue[] = []
export const CONSORCIO_DOCUMENTS: ConsorcioDocument[] = []
export const CONSORCIO_ASSEMBLIES: ConsorcioAssembly[] = []

for (const spec of SPECS) {
  const rng = mulberry32(spec.seed)
  const unitCount = unitLabels(spec).length
  const expenses = buildExpenses(spec, unitCount, rng)
  const totalToDistribute = expenses.reduce((sum, e) => sum + e.amount, 0) + spec.reserveContribution

  CONSORCIOS.push({
    id: spec.id,
    organizationId: 'org-fl',
    branchId: spec.branchId,
    name: spec.name,
    address: spec.address,
    neighborhood: spec.neighborhood,
    city: 'Ciudad Autónoma de Buenos Aires',
    taxId: spec.taxId,
    administratorUserId: spec.administratorUserId,
    managerName: spec.managerName,
    managerPhone: spec.managerPhone,
    currentPeriod: PERIOD,
    status: spec.status ?? 'ACTIVE',
    reserveFund: spec.reserveFund,
    reserveContribution: spec.reserveContribution,
    notes: spec.notes,
    createdAt: demoDate(-spec.createdDaysAgo).toISOString(),
    updatedAt: demoDate(-1).toISOString(),
  })
  CONSORCIO_UNITS.push(...buildUnits(spec, totalToDistribute, rng))
  CONSORCIO_EXPENSES.push(...expenses)
  CONSORCIO_ISSUES.push(
    ...(spec.issues ?? []).map((issue, i) => ({
      id: `${spec.id}-issue-${i + 1}`,
      consorcioId: spec.id,
      title: issue.title,
      status: issue.status,
      provider: issue.provider,
      unitLabel: issue.unitLabel,
      reportedAt: demoDate(-issue.daysAgo, 10).toISOString(),
    })),
  )
  // Every building has its regulation and insurance policy on file.
  CONSORCIO_DOCUMENTS.push(
    ...[
      { name: 'Reglamento de copropiedad', type: 'Reglamento', daysAgo: spec.createdDaysAgo },
      { name: 'Seguro integral — póliza vigente', type: 'Seguro', daysAgo: 30 },
      ...(spec.documents ?? []),
    ].map((doc, i) => ({ id: `${spec.id}-doc-${i + 1}`, consorcioId: spec.id, name: doc.name, type: doc.type, date: dateOnly(-doc.daysAgo) })),
  )
  CONSORCIO_ASSEMBLIES.push(
    ...(spec.assemblies ?? []).map((assembly, i) => ({
      id: `${spec.id}-assembly-${i + 1}`,
      consorcioId: spec.id,
      type: assembly.type,
      date: demoDate(assembly.daysFromToday, 19).toISOString(),
      status: assembly.status,
      notes: assembly.notes,
    })),
  )
}
