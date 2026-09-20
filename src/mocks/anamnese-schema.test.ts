import { describe, expect, it } from 'vitest'
import { anamneseSchema, questionsFor, visibleSections } from './anamnese-schema.ts'
import { createSeed } from './seed.ts'

const ids = (kind: 'crianca' | 'adulto') =>
  visibleSections(kind).flatMap(({ questions }) => questions.map((question) => question.id))

describe('schema da anamnese', () => {
  it('perguntas [C] só aparecem para criança e [A] só para adulto', () => {
    expect(ids('crianca')).toContain('alimentacao_amamentacao')
    expect(ids('adulto')).not.toContain('alimentacao_amamentacao')
    expect(ids('adulto')).toContain('voz_uso_profissional')
    expect(ids('crianca')).not.toContain('voz_uso_profissional')
  })

  it('perguntas sem marca aparecem para os dois', () => {
    expect(ids('crianca')).toContain('queixa_motivo')
    expect(ids('adulto')).toContain('queixa_motivo')
  })

  it('seções sem pergunta aplicável ficam ocultas', () => {
    const adultSections = visibleSections('adulto').map(({ section }) => section.id)
    expect(adultSections).not.toContain('gestacao')
    expect(adultSections).not.toContain('desenvolvimento')
    expect(visibleSections('crianca').map(({ section }) => section.id)).toEqual(
      expect.arrayContaining(['gestacao', 'desenvolvimento']),
    )
  })

  it('a seção de alimentação continua visível para adulto, só com as perguntas dele', () => {
    const alimentacao = anamneseSchema.find((section) => section.id === 'alimentacao')!
    expect(questionsFor(alimentacao, 'adulto')).toHaveLength(4)
    expect(questionsFor(alimentacao, 'crianca')).toHaveLength(7)
  })

  it('só Voz é opcional e os ids são únicos', () => {
    expect(anamneseSchema.filter((section) => section.optional).map((section) => section.id)).toEqual(['voz'])
    const all = anamneseSchema.flatMap((section) => section.questions.map((question) => question.id))
    expect(new Set(all).size).toBe(all.length)
  })

  it('usa os mesmos ids das respostas do seed', () => {
    const known = new Set(anamneseSchema.flatMap((section) => section.questions.map((question) => question.id)))
    for (const { answers } of createSeed().anamneses) {
      for (const id of Object.keys(answers)) expect(known.has(id), id).toBe(true)
    }
  })
})
