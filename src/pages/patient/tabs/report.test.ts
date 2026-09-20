import { describe, expect, it } from 'vitest'
import { createSeed } from '../../../mocks/seed.ts'
import type { Anamnese } from '../../../types/domain.ts'
import { answeredSections, patientFields } from './report.ts'

const seed = createSeed()
const miguel = seed.patients.find((p) => p.id === 'p-001')!
const carlos = seed.patients.find((p) => p.id === 'p-005')!
const anamnese = seed.anamneses[0]!

describe('patientFields', () => {
  it('criança: campos de criança, CPF mascarado e responsável financeiro', () => {
    const fields = Object.fromEntries(patientFields(miguel).map((f) => [f.label, f.value]))
    expect(fields['Escola']).toBe('Escola Municipal Aurora')
    expect(fields['Responsáveis']).toContain('Renata Andrade Lopes (Mãe)')
    expect(fields['CPF']).toBe('***.921.348-**')
    expect(fields['Responsável financeiro']).toBe('Renata Andrade Lopes — CPF ***.256.335-**')
    expect(fields['Profissão/ocupação']).toBeUndefined()
    expect(Object.values(fields).join('|')).not.toContain('05792134804')
  })

  it('adulto: profissão em vez de escola, e omite campos vazios', () => {
    const labels = patientFields(carlos).map((f) => f.label)
    expect(labels).toContain('Profissão/ocupação')
    expect(labels).not.toContain('Escola')
    expect(labels).not.toContain('Responsável financeiro')
  })
})

describe('answeredSections', () => {
  it('lista só o que foi respondido, formatando sim/não com detalhe', () => {
    const sections = answeredSections(miguel, anamnese)
    expect(sections.map((s) => s.id)).toEqual(['queixa', 'gestacao', 'historico'])
    expect(sections[1]!.lines).toEqual([{ label: 'Icterícia?', text: 'Sim — Fototerapia por 2 dias.' }])
  })

  it('ao virar adulto, oculta respostas de perguntas só de criança sem apagá-las', () => {
    const asAdult = { ...miguel, kind: 'adulto' as const }
    expect(answeredSections(asAdult, anamnese).map((s) => s.id)).toEqual(['queixa', 'historico'])
    expect(anamnese.answers['gestacao_ictericia']).toBeDefined()
  })

  it('Voz só entra se estiver aplicável', () => {
    const withVoice: Anamnese = { ...anamnese, voiceApplicable: false, answers: { voz_rouquidao: 'Ao fim do dia' } }
    expect(answeredSections(miguel, withVoice)).toEqual([])
    expect(answeredSections(miguel, { ...withVoice, voiceApplicable: true }).map((s) => s.id)).toEqual(['voz'])
  })

  it('sem anamnese salva, nada a imprimir', () => {
    expect(answeredSections(miguel, null)).toEqual([])
  })
})
