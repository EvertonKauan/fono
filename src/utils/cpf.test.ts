import { describe, expect, it } from 'vitest'
import { formatCpf, isValidCpf, maskCpf } from './cpf.ts'

describe('isValidCpf', () => {
  it('aceita CPF válido, com ou sem máscara', () => {
    expect(isValidCpf('52998224725')).toBe(true)
    expect(isValidCpf('529.982.247-25')).toBe(true)
  })

  it('rejeita dígito verificador errado', () => {
    expect(isValidCpf('529.982.247-24')).toBe(false)
    expect(isValidCpf('529.982.246-25')).toBe(false)
  })

  it('rejeita tamanho errado e sequências repetidas', () => {
    expect(isValidCpf('')).toBe(false)
    expect(isValidCpf('5299822472')).toBe(false)
    expect(isValidCpf('111.111.111-11')).toBe(false)
  })
})

describe('formatCpf', () => {
  it('formata completo e parcial', () => {
    expect(formatCpf('52998224725')).toBe('529.982.247-25')
    expect(formatCpf('5299')).toBe('529.9')
    expect(formatCpf('529982')).toBe('529.982')
  })
})

describe('maskCpf', () => {
  it('oculta os três primeiros e os dois últimos dígitos', () => {
    expect(maskCpf('529.982.247-25')).toBe('***.982.247-**')
  })

  it('devolve vazio se o CPF for incompleto', () => {
    expect(maskCpf('5299')).toBe('')
  })
})
