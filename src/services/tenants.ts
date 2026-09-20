import type { Tenant } from '../types/domain.ts'
import { loadDb } from './db.ts'

export async function getTenant(tenantId: string): Promise<Tenant> {
  const tenant = loadDb().tenants.find((t) => t.id === tenantId)
  if (!tenant) throw new Error('Clínica não encontrada.')
  return tenant
}
