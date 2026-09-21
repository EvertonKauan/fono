import type { Payment, Session } from '../types/domain.ts'
import { newId } from '../utils/id.ts'

// Regras do RF-08 (plan §6), sem acesso ao banco: dado o estado anterior e o novo da sessão, devolve a sessão
// (com `counted` correto) e a lista de lançamentos do paciente já ajustada.

const cents = (value: number) => Math.round(value * 100)
const money = (value: number) => Math.round(value * 100) / 100
const competence = (date: string) => date.slice(0, 7)

// mais recente primeiro: data, horário (sem horário conta como o fim do dia), depois criação
export const byMostRecent = (a: Session, b: Session) =>
  `${b.date} ${b.time ?? '99:99'} ${b.createdAt}`.localeCompare(`${a.date} ${a.time ?? '99:99'} ${a.createdAt}`)

// Valor sugerido para uma sessão nova: o da sessão mais recente do paciente (a primeira da lista da aba Sessões),
// de qualquer status. Sem histórico (ou sem valor utilizável nela), não há sugestão.
export function suggestedValue(sessions: Session[]): number | undefined {
  const latest = [...sessions].sort(byMostRecent)[0]
  return latest && latest.value > 0 ? latest.value : undefined
}

type Result = { session: Session; payments: Payment[] }

export function applySessionBilling(previous: Session | undefined, next: Session, payments: Payment[]): Result {
  const counted = previous?.counted
  const wasDone = previous?.status === 'realizada'
  const isDone = next.status === 'realizada'
  const withCounted = (value: Session['counted']): Session => {
    const copy: Session = { ...next }
    delete copy.counted
    if (value) copy.counted = value
    return copy
  }
  const unchanged: Result = { session: withCounted(counted), payments }
  const linked = counted ? payments.find((p) => p.id === counted.paymentId) : undefined

  if (isDone && !wasDone) {
    // Voltou a Realizada já vinculada (o lançamento estava Pago quando saiu): só acerta a diferença de valor, se Pendente.
    if (counted && linked) return adjustValue(next, counted, linked, payments, withCounted)
    return count(next, payments, withCounted)
  }
  if (isDone && wasDone) {
    if (counted && linked && next.value !== counted.amount) return adjustValue(next, counted, linked, payments, withCounted)
    return unchanged
  }
  if (!isDone && wasDone && counted) {
    if (!linked) return { session: withCounted(undefined), payments }
    return linked.status === 'pendente' ? uncount(counted, linked, payments, withCounted) : unchanged
  }
  return unchanged
}

// Entra em Realizada: soma no Pendente da competência (o último, se houver mais de um) ou cria um novo Pendente.
function count(next: Session, payments: Payment[], withCounted: (c: Session['counted']) => Session): Result {
  const period = competence(next.date)
  const target = [...payments].reverse().find((p) => p.patientId === next.patientId && p.period === period && p.status === 'pendente')
  if (target) {
    const updated: Payment = { ...target, sessions: target.sessions + 1, amount: money(target.amount + next.value) }
    return {
      session: withCounted({ paymentId: target.id, amount: next.value }),
      payments: payments.map((p) => (p.id === target.id ? updated : p)),
    }
  }
  const created: Payment = {
    id: newId(),
    tenantId: next.tenantId,
    patientId: next.patientId,
    period,
    sessions: 1,
    amount: next.value,
    status: 'pendente',
  }
  return { session: withCounted({ paymentId: created.id, amount: next.value }), payments: [...payments, created] }
}

// Valor mudou (ou a sessão voltou a Realizada): só o lançamento Pendente acompanha; o Pago não é tocado.
function adjustValue(
  next: Session,
  counted: NonNullable<Session['counted']>,
  linked: Payment,
  payments: Payment[],
  withCounted: (c: Session['counted']) => Session,
): Result {
  if (linked.status !== 'pendente') return { session: withCounted(counted), payments }
  const amount = Math.max(0, money(linked.amount + (next.value - counted.amount)))
  return {
    session: withCounted({ paymentId: linked.id, amount: next.value }),
    payments: payments.map((p) => (p.id === linked.id ? { ...p, amount } : p)),
  }
}

// Deixou de ser Realizada com o lançamento Pendente: tira 1 sessão e o valor que entrou; sem sessões, o lançamento some.
function uncount(
  counted: NonNullable<Session['counted']>,
  linked: Payment,
  payments: Payment[],
  withCounted: (c: Session['counted']) => Session,
): Result {
  const sessions = linked.sessions - 1
  const rest = payments.filter((p) => p.id !== linked.id)
  if (sessions <= 0) return { session: withCounted(undefined), payments: rest }
  const amount = Math.max(0, (cents(linked.amount) - cents(counted.amount)) / 100)
  return {
    session: withCounted(undefined),
    payments: payments.map((p) => (p.id === linked.id ? { ...linked, sessions, amount } : p)),
  }
}
