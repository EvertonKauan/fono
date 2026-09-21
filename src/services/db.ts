import type { Anamnese, Patient, Payment, Prescription, Session, Tenant, User } from '../types/domain.ts'
import { createSeed } from '../mocks/seed.ts'

type TenantTables = {
  patients: Patient
  anamneses: Anamnese
  prescriptions: Prescription
  payments: Payment
  sessions: Session
}
type TenantTable = keyof TenantTables

type TenantDb = { [K in TenantTable]: TenantTables[K][] }

export type Db = { tenants: Tenant[]; users: User[] } & TenantDb

const STORAGE_KEY = 'fono:db'
const LEGACY_TABLES = ['tenants', 'users', 'patients', 'anamneses', 'prescriptions', 'payments'] as const

// Tabelas novas ausentes (hoje só `sessions`) são preenchidas pelo seed; as existentes não são recriadas.
// Exceções deliberadas (RF-08): sessão sem `value` recebe o antigo `visit.fee` do paciente (0 se não houver) e o
// campo `visit` é removido dos pacientes. Lançamentos não são tocados. Só um objeto ilegível (sem as tabelas
// originais) devolve null e é recriado por inteiro.
type LegacyPatient = Patient & { visit?: { fee?: number } }

function withoutVisit(patient: LegacyPatient): Patient {
  if (!('visit' in patient)) return patient
  const copy = { ...patient }
  delete copy.visit
  return copy
}

export function migrateDb(value: unknown): { db: Db; changed: boolean } | null {
  if (typeof value !== 'object' || value === null) return null
  const record = value as Record<string, unknown>
  if (!LEGACY_TABLES.every((table) => Array.isArray(record[table]))) return null
  const legacy = record.patients as LegacyPatient[]
  const feeOf = new Map(legacy.map((p) => [p.id, p.visit?.fee ?? 0]))
  const patients = legacy.map(withoutVisit)
  let changed = patients.some((p, i) => p !== legacy[i])
  if (!Array.isArray(record.sessions)) {
    const patientIds = new Set(patients.map((patient) => patient.id))
    const sessions = createSeed().sessions.filter((session) => patientIds.has(session.patientId))
    return { db: { ...record, patients, sessions } as unknown as Db, changed: true }
  }
  const sessions = (record.sessions as Session[]).map((session) => {
    if (typeof session.value === 'number') return session
    changed = true
    return { ...session, value: feeOf.get(session.patientId) ?? 0 }
  })
  return changed ? { db: { ...record, patients, sessions } as unknown as Db, changed: true } : { db: record as unknown as Db, changed: false }
}

export function saveDb(db: Db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

export function loadDb(): Db {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const migrated = migrateDb(JSON.parse(raw))
      if (migrated) {
        if (migrated.changed) {
          try {
            saveDb(migrated.db)
          } catch {
            // sem gravar agora; a migração se repete na próxima carga
          }
        }
        return migrated.db
      }
    }
  } catch {
    // dados ilegíveis: recria a partir do seed
  }
  const db = createSeed()
  saveDb(db)
  return db
}

// Várias tabelas numa só gravação: se ela falhar, nenhuma mudança fica pela metade.
export function updateDb(change: (db: Db) => void) {
  const db = loadDb()
  change(db)
  saveDb(db)
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
