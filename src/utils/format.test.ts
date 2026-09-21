import { describe, expect, it } from 'vitest'
import { formatAge, formatCurrency, formatDate, formatPeriod, billingLabel, formatWeekdays, normalizeText, parseMoney, sessionStatusLabel } from './format.ts'

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

  it('formata idade e dias da semana', () => {
    expect(formatAge(1)).toBe('1 ano')
    expect(formatAge(8)).toBe('8 anos')
    expect(formatWeekdays([4, 2])).toBe('Ter, Qui')
    expect(formatWeekdays([])).toBe('—')
  })

  it('normaliza texto sem acentos e maiúsculas', () => {
    expect(normalizeText('LÍVIA Cardoso')).toBe('livia cardoso')
  })

  it('descreve status e cobrança da sessão', () => {
    expect(sessionStatusLabel.agendada).toBe('Agendada')
    expect(billingLabel({ billing: 'particular' })).toBe('Particular')
    expect(billingLabel({ billing: 'convenio', insurer: 'Convênio Exemplo' })).toBe('Convênio: Convênio Exemplo')
  })

  it('interpreta valores digitados em reais', () => {
    expect(parseMoney('1.234,50')).toBe(1234.5)
    expect(parseMoney('150,5')).toBe(150.5)
    expect(parseMoney('150.50')).toBe(150.5)
    expect(parseMoney('1.234')).toBe(1234)
    expect(parseMoney('150')).toBe(150)
    expect(parseMoney('')).toBe(0)
  })
})
