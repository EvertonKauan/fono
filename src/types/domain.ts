export type Tenant = {
  id: string
  name: string
  professional: { name: string; registry: string }
}

// só mock; na Fase 2 a autenticação passa a ser do back-end
export type User = { id: string; tenantId: string; username: string; password: string }

export type Session = { userId: string; tenantId: string; username: string; tenant: Tenant }

export type PatientKind ='crianca' | 'adulto'

export type Patient = {
  id: string
  tenantId: string
  kind: PatientKind
  fullName: string
  birthDate: string // ISO yyyy-mm-dd
  gender?: string
  city?: string
  address?: string
  phone?: string
  email?: string
  referredBy?: string
  schooling?: string
  school?: string // criança
  occupation?: string // adulto
  guardians: { name: string; relationship: string; phone?: string }[]
  cpf?: string
  financialGuardian?: { name: string; cpf: string } // obrigatório se menor
  visit: { fee: number; weekdays: number[]; time?: string } // 0=dom … 6=sáb
  createdAt: string
}

export type AnamneseAnswer = string | { yes: boolean; detail?: string }

export type Anamnese = {
  id: string
  tenantId: string
  patientId: string
  answers: Record<string, AnamneseAnswer> // chave = questionId
  voiceApplicable: boolean
  updatedAt: string
}

export type Prescription = {
  id: string
  tenantId: string
  patientId: string
  date: string
  exercises: { title: string; description: string }[]
  frequency: string
}

export type PaymentStatus = 'pago' | 'pendente'
export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao' | 'outro'

export type Payment = {
  id: string
  tenantId: string
  patientId: string
  period: string // 'yyyy-mm' (competência)
  sessions: number
  amount: number
  status: PaymentStatus
  paidAt?: string
  method?: PaymentMethod
}
