import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatPeriod } from './format.ts'

describe('format', () => {
  it('formata data como dd/mm/aaaa', () => {
    expect(formatDate('2026-09-05')).toBe('05/09/2026')
    expect(formatDate('2026-09-05T13:00:00.000Z')).toBe('05/09/2026')
  })

  it('formata competência como mm/aaaa', () => {
    expect(formatPeriod('2026-09')).toBe('09/2026')
  })

  it('formata moeda em BRL', () => {
    expect(formatCurrency(1234.5).replace(/\s/g, ' ')).toBe('R$ 1.234,50')
  })
})
