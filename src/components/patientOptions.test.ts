import { describe, expect, it } from 'vitest'
import { createSeed } from '../mocks/seed.ts'
import { patientOptions } from './patientOptions.ts'

const { patients } = createSeed()
const names = (list: { fullName: string }[]) => list.map((p) => p.fullName)

describe('patientOptions', () => {
  it('lista só ativos do tenant, em ordem alfabética, sem o arquivado (Otávio) nem os de outro tenant', () => {
    const list = patientOptions(patients, 'claudionaria')
    expect(list).toHaveLength(8)
    expect(names(list)).toEqual([...names(list)].sort((a, b) => a.localeCompare(b, 'pt-BR')))
    expect(names(list)).not.toContain('Otávio Ramos Vieira')
    expect(list.every((p) => p.tenantId === 'claudionaria')).toBe(true)
    expect(names(patientOptions(patients, 'demo'))).toEqual(['Ana Demonstração Silva', 'Pedro Demonstração Souza'])
  })

  it('ignora acentos e maiúsculas e casa em qualquer parte do nome', () => {
    expect(names(patientOptions(patients, 'claudionaria', 'livia'))).toEqual(['Lívia Cardoso Prado'])
    expect(names(patientOptions(patients, 'claudionaria', 'LÍVIA'))).toEqual(['Lívia Cardoso Prado'])
    expect(names(patientOptions(patients, 'claudionaria', ' cardoso '))).toEqual(['Lívia Cardoso Prado'])
    expect(names(patientOptions(patients, 'claudionaria', 'MENEZES'))).toEqual(['Carlos Eduardo Menezes'])
  })

  it('arquivado não aparece nem buscando pelo nome; desarquivar devolve à lista', () => {
    expect(patientOptions(patients, 'claudionaria', 'otavio')).toEqual([])
    const back = patients.map((p) => (p.fullName.startsWith('Otávio') ? { ...p, archivedAt: undefined } : p))
    expect(names(patientOptions(back, 'claudionaria', 'otavio'))).toEqual(['Otávio Ramos Vieira'])
  })

  it('não mostra paciente de outro tenant mesmo pelo nome', () => {
    expect(patientOptions(patients, 'claudionaria', 'demonstra')).toEqual([])
    expect(patientOptions(patients, 'demo', 'miguel')).toEqual([])
  })

  it('sem resultado devolve lista vazia', () => {
    expect(patientOptions(patients, 'claudionaria', 'zzz')).toEqual([])
    expect(patientOptions([], 'claudionaria')).toEqual([])
  })
})
