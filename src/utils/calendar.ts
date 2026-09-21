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

// ---- visões (Mês · Semana · Dia)
export type CalendarView = 'mes' | 'semana' | 'dia'

const ISO = 'YYYY-MM-DD'
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export const parseView = (value: string | null): CalendarView => (value === 'semana' || value === 'dia' ? value : 'mes')

// yyyy-mm-dd de um dia que existe, senão hoje (para ?data= vindo da URL)
export const parseDate = (value: string | null) =>
  value && ISO_DATE.test(value) && dayjs(value).format(ISO) === value ? value : todayIso()

// domingo a sábado
export function weekOf(date: string): string[] {
  const day = dayjs(date)
  const start = day.subtract(day.day(), 'day')
  return Array.from({ length: 7 }, (_, i) => start.add(i, 'day').format(ISO))
}

// intervalo de datas a buscar; no mês, a grade inteira (com os dias vizinhos)
export function viewRange(date: string, view: CalendarView) {
  if (view === 'dia') return { from: date, to: date }
  if (view === 'semana') {
    const week = weekOf(date)
    return { from: week[0]!, to: week[6]! }
  }
  const weeks = buildMonthGrid(date.slice(0, 7))
  return { from: weeks[0]![0]!, to: weeks.at(-1)!.at(-1)! }
}

// anterior/próximo: um mês, uma semana ou um dia
export function shiftDate(date: string, view: CalendarView, delta: number) {
  const day = dayjs(date)
  const next = view === 'mes' ? day.add(delta, 'month') : day.add(view === 'semana' ? delta * 7 : delta, 'day')
  return next.format(ISO)
}

// "setembro de 2026" · "20 a 26 de setembro de 2026" · "terça-feira, 22 de setembro de 2026"
export function rangeLabel(date: string, view: CalendarView) {
  if (view === 'mes') return monthLabel(date.slice(0, 7))
  if (view === 'dia') return dayjs(date).locale('pt-br').format('dddd, D [de] MMMM [de] YYYY')
  const week = weekOf(date)
  const first = dayjs(week[0]).locale('pt-br')
  const last = dayjs(week[6]).locale('pt-br')
  if (first.year() !== last.year()) return `${first.format('D [de] MMMM [de] YYYY')} a ${last.format('D [de] MMMM [de] YYYY')}`
  if (first.month() !== last.month()) return `${first.format('D [de] MMMM')} a ${last.format('D [de] MMMM [de] YYYY')}`
  return `${first.format('D')} a ${last.format('D [de] MMMM [de] YYYY')}`
}

// "terça-feira, 15/09/2026"
export const fullDayLabel = (date: string) => dayjs(date).locale('pt-br').format('dddd, DD/MM/YYYY')

// ---- fatias de 30 minutos; a sessão não tem duração e ocupa a fatia do seu horário
const pad = (n: number) => String(n).padStart(2, '0')
const toMinutes = (slot: string) => Number(slot.slice(0, 2)) * 60 + Number(slot.slice(3))
const fromMinutes = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`

export function slotOf(time: string) {
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  return `${pad(hours)}:${minutes >= 30 ? '30' : '00'}`
}

// faixa padrão 07:00–20:30 (grade até 21:00), estendida para conter qualquer horário recebido
export function slotRange(times: string[]): string[] {
  const minutes = times.map((time) => toMinutes(slotOf(time)))
  const first = Math.min(toMinutes('07:00'), ...minutes)
  const last = Math.max(toMinutes('20:30'), ...minutes)
  return Array.from({ length: (last - first) / 30 + 1 }, (_, i) => fromMinutes(first + i * 30))
}
