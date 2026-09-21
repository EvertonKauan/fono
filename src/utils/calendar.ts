import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/

export const todayIso = () => dayjs().format('YYYY-MM-DD')
export const currentMonth = () => dayjs().format('YYYY-MM')

// yyyy-mm válido ou o mês atual (para ?mes= vindo da URL)
export const parseMonth = (value: string | null) => (value && MONTH.test(value) ? value : currentMonth())

export const shiftMonth = (month: string, delta: number) => dayjs(`${month}-01`).add(delta, 'month').format('YYYY-MM')

// "setembro de 2026"
export const monthLabel = (month: string) => dayjs(`${month}-01`).locale('pt-br').format('MMMM [de] YYYY')

// "terça-feira, 15/09"
export const dayLabel = (date: string) => dayjs(date).locale('pt-br').format('dddd, DD/MM')

// Semanas de domingo a sábado que cobrem o mês; os dias vizinhos completam a primeira e a última semana.
// Usa day() (0 = domingo) em vez de startOf('week'), que muda com o locale.
export function buildMonthGrid(month: string): string[][] {
  const first = dayjs(`${month}-01`)
  const last = first.endOf('month')
  const start = first.subtract(first.day(), 'day')
  const end = last.add(6 - last.day(), 'day')
  const weeks: string[][] = []
  for (let day = start; !day.isAfter(end); day = day.add(7, 'day')) {
    weeks.push(Array.from({ length: 7 }, (_, i) => day.add(i, 'day').format('YYYY-MM-DD')))
  }
  return weeks
}

export function groupByDate<T extends { date: string }>(items: T[]): { date: string; items: T[] }[] {
  const groups = new Map<string, T[]>()
  for (const item of items) groups.set(item.date, [...(groups.get(item.date) ?? []), item])
  return [...groups].map(([date, list]) => ({ date, items: list })).sort((a, b) => a.date.localeCompare(b.date))
}
