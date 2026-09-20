import { visibleSections } from '../../../mocks/anamnese-schema.ts'
import type { Anamnese, Patient } from '../../../types/domain.ts'
import { ageOf } from '../../../utils/age.ts'
import { maskCpf } from '../../../utils/cpf.ts'
import { formatAge, formatDate, kindLabel } from '../../../utils/format.ts'

export const REPORT_SECTIONS = [
  { key: 'dados', label: 'Dados' },
  { key: 'anamnese', label: 'Anamnese' },
  { key: 'prescricoes', label: 'Prescrições' },
  { key: 'financeiro', label: 'Financeiro' },
] as const

export type ReportSectionKey = (typeof REPORT_SECTIONS)[number]['key']
export type ReportInclude = Record<ReportSectionKey, boolean>

export type Field = { label: string; value: string }

// Campos preenchidos do paciente; o CPF sai mascarado (LGPD), também no papel.
export function patientFields(patient: Patient): Field[] {
  const guardians = patient.guardians
    .map((g) => [g.name, g.relationship && `(${g.relationship})`, g.phone && `— ${g.phone}`].filter(Boolean).join(' '))
    .join('\n')
  const financial = patient.financialGuardian
  const fields: { label: string; value?: string }[] = [
    { label: 'Nome completo', value: patient.fullName },
    { label: 'Data de nascimento', value: `${formatDate(patient.birthDate)} (${formatAge(ageOf(patient.birthDate))})` },
    { label: 'Tipo', value: kindLabel[patient.kind] },
    { label: 'Sexo/gênero', value: patient.gender },
    { label: 'Cidade', value: patient.city },
    { label: 'Endereço', value: patient.address },
    { label: 'Telefone', value: patient.phone },
    { label: 'E-mail', value: patient.email },
    { label: 'Quem encaminhou', value: patient.referredBy },
    ...(patient.kind === 'crianca'
      ? [
          { label: 'Escolaridade (série)', value: patient.schooling },
          { label: 'Escola', value: patient.school },
          { label: 'Responsáveis', value: guardians },
        ]
      : [
          { label: 'Escolaridade', value: patient.schooling },
          { label: 'Profissão/ocupação', value: patient.occupation },
        ]),
    { label: 'CPF', value: patient.cpf && maskCpf(patient.cpf) },
    {
      label: 'Responsável financeiro',
      value: financial && `${financial.name} — CPF ${maskCpf(financial.cpf)}`.trim(),
    },
  ]
  return fields.filter((f): f is Field => Boolean(f.value))
}

export type AnsweredSection = { id: string; title: string; lines: { label: string; text: string }[] }

// Só o que foi respondido, nas perguntas que valem para o tipo atual; Voz só se estiver aplicável.
export function answeredSections(patient: Patient, anamnese: Anamnese | null): AnsweredSection[] {
  if (!anamnese) return []
  return visibleSections(patient.kind)
    .filter(({ section }) => !section.optional || anamnese.voiceApplicable)
    .map(({ section, questions }) => ({
      id: section.id,
      title: section.title,
      lines: questions.flatMap((question) => {
        const answer = anamnese.answers[question.id]
        if (answer === undefined) return []
        const text = typeof answer === 'string' ? answer : answer.yes ? `Sim${answer.detail ? ` — ${answer.detail}` : ''}` : 'Não'
        return [{ label: question.label, text }]
      }),
    }))
    .filter((section) => section.lines.length > 0)
}
