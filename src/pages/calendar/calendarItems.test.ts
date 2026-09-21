import { describe, expect, it } from 'vitest'
import { createSeed } from '../../mocks/seed.ts'
import { toCalendarItems } from './calendarItems.ts'

const seed = createSeed()
const clau = (rows: { tenantId: string }[]) => rows.filter((r) => r.tenantId === 'claudionaria')

describe('toCalendarItems', () => {
  const sessions = clau(seed.sessions) as typeof seed.sessions
  const items = toCalendarItems(sessions, seed.patients)

  it('não inclui sessões de paciente arquivado (Otávio, p-009)', () => {
    expect(sessions.some((s) => s.patientId === 'p-009')).toBe(true)
    expect(items.some((i) => i.session.patientId === 'p-009')).toBe(false)
    expect(items).toHaveLength(sessions.length - sessions.filter((s) => s.patientId === 'p-009').length)
  })

  it('volta a incluir quando o paciente é desarquivado', () => {
    const unarchived = seed.patients.map((p) => (p.id === 'p-009' ? { ...p, archivedAt: undefined } : p))
    expect(toCalendarItems(sessions, unarchived).some((i) => i.session.patientId === 'p-009')).toBe(true)
  })

  it('só junta sessão e paciente do mesmo tenant', () => {
    const mixed = toCalendarItems(seed.sessions, seed.patients.filter((p) => p.tenantId === 'demo'))
    expect(mixed.every((i) => i.session.tenantId === 'demo')).toBe(true)
    expect(mixed.length).toBe(3)
  })

  it('traz o nome do paciente e mantém a ordem recebida', () => {
    expect(items[0]!.patientName).toBe(seed.patients.find((p) => p.id === items[0]!.session.patientId)!.fullName)
    expect(items.map((i) => i.session.id)).toEqual(sessions.filter((s) => s.patientId !== 'p-009').map((s) => s.id))
  })
})
