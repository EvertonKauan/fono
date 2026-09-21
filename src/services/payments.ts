import type { Payment } from '../types/domain.ts'
import { selectRows, upsertRow } from './db.ts'
import { newId } from '../utils/id.ts'

export async function listPayments(tenantId: string, patientId?: string): Promise<Payment[]> {
  const payments = selectRows('payments', tenantId)
  return patientId ? payments.filter((p) => p.patientId === patientId) : payments
}

export async function createPayment(
  tenantId: string,
  input: Omit<Payment, 'id' | 'tenantId'>,
): Promise<Payment> {
  const payment: Payment = { ...input, id: newId(), tenantId }
  upsertRow('payments', tenantId, payment)
  return payment
}

export async function savePayment(tenantId: string, payment: Payment): Promise<Payment> {
  upsertRow('payments', tenantId, payment)
  return payment
}
