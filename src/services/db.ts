import type { Anamnese, Patient, Payment, Prescription, Tenant, User } from '../types/domain.ts'
import { createSeed } from '../mocks/seed.ts'

type TenantTables = {
  patients: Patient
  anamneses: Anamnese
  prescriptions: Prescription
  payments: Payment
}
type TenantTable = keyof TenantTables

type TenantDb = { [K in TenantTable]: TenantTables[K][] }

export type Db = { tenants: Tenant[]; users: User[] } & TenantDb

const STORAGE_KEY = 'fono:db'
const TABLES: (keyof Db)[] = ['tenants', 'users', 'patients', 'anamneses', 'prescriptions', 'payments']

function isDb(value: unknown): value is Db {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return TABLES.every((table) => Array.isArray(record[table]))
}

export function saveDb(db: Db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

export function loadDb(): Db {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (isDb(parsed)) return parsed
    }
  } catch {
    // dados ilegíveis: recria a partir do seed
  }
  const db = createSeed()
  saveDb(db)
  return db
}

export function selectRows<K extends TenantTable>(table: K, tenantId: string): TenantTables[K][] {
  const rows: TenantTables[K][] = (loadDb() as TenantDb)[table]
  return rows.filter((row) => row.tenantId === tenantId)
}

export function upsertRow<K extends TenantTable>(table: K, tenantId: string, row: TenantTables[K]) {
  if (row.tenantId !== tenantId) throw new Error('Registro pertence a outro tenant.')
  const db = loadDb()
  const rows: TenantTables[K][] = (db as TenantDb)[table]
  const index = rows.findIndex((r) => r.id === row.id && r.tenantId === tenantId)
  if (index >= 0) rows[index] = row
  else rows.push(row)
  saveDb(db)
}
