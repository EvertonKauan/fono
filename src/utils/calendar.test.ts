import { describe, expect, it } from 'vitest'
import {
  buildMonthGrid,
  dayLabel,
  fullDayLabel,
  groupByDate,
  monthLabel,
  parseDate,
  parseMonth,
  parseView,
  rangeLabel,
  shiftDate,
  shiftMonth,
  slotOf,
  slotRange,
  viewRange,
  weekOf,
} from './calendar.ts'

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

describe('visões', () => {
  it('aceita só visões conhecidas e datas que existem', () => {
    expect(parseView('semana')).toBe('semana')
    expect(parseView('dia')).toBe('dia')
    for (const bad of [null, '', 'ano', 'MES']) expect(parseView(bad)).toBe('mes')
    expect(parseDate('2026-09-22')).toBe('2026-09-22')
    for (const bad of [null, '', '2026-02-30', '2026-13-01', '22/09/2026', 'x']) {
      expect(parseDate(bad)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(parseDate(bad)).not.toBe(bad)
    }
  })

  it('semana de domingo a sábado', () => {
    expect(weekOf('2026-09-22')).toEqual([
      '2026-09-20',
      '2026-09-21',
      '2026-09-22',
      '2026-09-23',
      '2026-09-24',
      '2026-09-25',
      '2026-09-26',
    ])
    expect(weekOf('2026-09-20')[0]).toBe('2026-09-20') // domingo abre a própria semana
    expect(weekOf('2026-09-26')[0]).toBe('2026-09-20') // sábado fecha a semana
    expect(weekOf('2026-01-01')[0]).toBe('2025-12-28') // atravessa o ano
  })

  it('intervalo a buscar por visão', () => {
    expect(viewRange('2026-09-22', 'dia')).toEqual({ from: '2026-09-22', to: '2026-09-22' })
    expect(viewRange('2026-09-22', 'semana')).toEqual({ from: '2026-09-20', to: '2026-09-26' })
    expect(viewRange('2026-09-22', 'mes')).toEqual({ from: '2026-08-30', to: '2026-10-03' })
  })

  it('anterior/próximo andam um mês, uma semana ou um dia', () => {
    expect(shiftDate('2026-09-22', 'dia', 1)).toBe('2026-09-23')
    expect(shiftDate('2026-09-30', 'dia', 1)).toBe('2026-10-01')
    expect(shiftDate('2026-09-22', 'semana', -1)).toBe('2026-09-15')
    expect(shiftDate('2026-12-30', 'semana', 1)).toBe('2027-01-06')
    expect(shiftDate('2026-01-31', 'mes', 1)).toBe('2026-02-28') // não pula para março
    expect(shiftDate('2026-01-15', 'mes', -1)).toBe('2025-12-15')
  })

  it('rótulos do período em pt-BR', () => {
    expect(rangeLabel('2026-09-22', 'mes')).toBe('setembro de 2026')
    expect(rangeLabel('2026-09-22', 'semana')).toBe('20 a 26 de setembro de 2026')
    expect(rangeLabel('2026-09-30', 'semana')).toBe('27 de setembro a 3 de outubro de 2026')
    expect(rangeLabel('2026-12-30', 'semana')).toBe('27 de dezembro de 2026 a 2 de janeiro de 2027')
    expect(rangeLabel('2026-09-22', 'dia')).toBe('terça-feira, 22 de setembro de 2026')
    expect(fullDayLabel('2026-09-15')).toBe('terça-feira, 15/09/2026')
  })
})

describe('fatias de horário', () => {
  it('arredonda para baixo aos 30 minutos', () => {
    expect(slotOf('15:00')).toBe('15:00')
    expect(slotOf('15:29')).toBe('15:00')
    expect(slotOf('15:30')).toBe('15:30')
    expect(slotOf('09:59')).toBe('09:30')
    expect(slotOf('7:05')).toBe('07:00')
  })

  it('faixa padrão 07:00–20:30 (28 fatias), estendida para conter qualquer horário', () => {
    const base = slotRange([])
    expect(base).toHaveLength(28)
    expect(base[0]).toBe('07:00')
    expect(base.at(-1)).toBe('20:30')
    expect(slotRange(['15:00', '08:30'])).toEqual(base)
    expect(slotRange(['06:15'])[0]).toBe('06:00')
    expect(slotRange(['06:15'])).toHaveLength(30)
    expect(slotRange(['22:10']).at(-1)).toBe('22:00')
    expect(slotRange(['22:10'])).toHaveLength(31)
  })
})
