export type Tenant = {
  id: string
  name: string
  professional: { name: string; registry: string }
}

// só mock; na Fase 2 a autenticação passa a ser do back-end
export type User = { id: string; tenantId: string; username: string; password: string }

export type AuthSession = { userId: string; tenantId: string; username: string; tenant: Tenant }

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
  createdAt: string
  archivedAt?: string // instante ISO; ausente = ativo
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

export type SessionStatus = 'agendada' | 'realizada' | 'cancelada'
export type BillingType = 'particular' | 'convenio'

// A sessão Realizada alimenta o lançamento da competência (RF-08); `counted` liga a sessão ao lançamento em que ela já foi somada.
export type Session = {
  id: string
  tenantId: string
  patientId: string
  date: string // ISO yyyy-mm-dd
  time?: string // HH:mm
  status: SessionStatus
  billing: BillingType
  insurer?: string // obrigatório se billing === 'convenio'; ausente se particular
  evolution?: string // texto livre: o que aconteceu na sessão
  value: number // R$ da sessão, maior que zero (RF-12)
  counted?: { paymentId: string; amount: number } // lançamento onde já foi somada e quanto entrou nele
  createdAt: string
  updatedAt: string
}

export type AttachmentOwner = { type: 'anamnese' | 'sessao' | 'material'; id: string } // anamnese → patientId; sessao → Session.id; material → tenantId

// Vive no IndexedDB (plan §12); a UI só recebe os metadados até baixar o arquivo.
export type AttachmentMeta = {
  id: string
  tenantId: string
  ownerType: AttachmentOwner['type']
  ownerId: string
  name: string
  mimeType: string
  size: number
  createdAt: string
}
export type Attachment = AttachmentMeta & { blob: Blob }
