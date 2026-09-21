import { describe, expect, it } from 'vitest'
import { buildMonthGrid, dayLabel, groupByDate, monthLabel, parseMonth, shiftMonth } from './calendar.ts'

describe('buildMonthGrid', () => {
  it('cobre setembro/2026 com semanas de domingo a sábado', () => {
    const weeks = buildMonthGrid('2026-09')
    expect(weeks).toHaveLength(5)
    expect(weeks.every((week) => week.length === 7)).toBe(true)
    expect(weeks[0]![0]).toBe('2026-08-30') // domingo
    expect(weeks[0]![2]).toBe('2026-09-01') // 1º de setembro é terça
    expect(weeks[4]![6]).toBe('2026-10-03') // sábado
  })

  it('mês que começa no domingo e termina no sábado tem exatamente 4 semanas', () => {
    const weeks = buildMonthGrid('2026-02')
    expect(weeks).toHaveLength(4)
    expect(weeks[0]![0]).toBe('2026-02-01')
    expect(weeks[3]![6]).toBe('2026-02-28')
  })

  it('atravessa a virada de ano', () => {
    const weeks = buildMonthGrid('2026-12')
    expect(weeks.at(-1)!.at(-1)!.startsWith('2027-01')).toBe(true)
  })
})

describe('mês', () => {
  it('avança e volta, inclusive entre anos', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(shiftMonth('2026-09', 0)).toBe('2026-09')
  })

  it('aceita só yyyy-mm válido, senão usa o mês atual', () => {
    expect(parseMonth('2026-09')).toBe('2026-09')
    for (const bad of [null, '', '2026-13', '2026-9', 'abc', '2026-09-01']) {
      expect(parseMonth(bad)).toMatch(/^\d{4}-\d{2}$/)
      expect(parseMonth(bad)).not.toBe(bad)
    }
  })

  it('rótulos em pt-BR', () => {
    expect(monthLabel('2026-09')).toBe('setembro de 2026')
    expect(dayLabel('2026-09-15')).toBe('terça-feira, 15/09')
  })
})

describe('groupByDate', () => {
  it('agrupa por dia mantendo a ordem dos itens e ordena os dias', () => {
    const groups = groupByDate([
      { date: '2026-09-02', n: 1 },
      { date: '2026-09-01', n: 2 },
      { date: '2026-09-02', n: 3 },
    ])
    expect(groups.map((g) => g.date)).toEqual(['2026-09-01', '2026-09-02'])
    expect(groups[1]!.items.map((i) => i.n)).toEqual([1, 3])
  })
})
