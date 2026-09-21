import { describe, expect, it } from 'vitest'
import { caretAfterDigits, editPhone, formatPhone } from './phone.ts'

describe('formatPhone', () => {
  it('monta a máscara enquanto digita', () => {
    const full = '11987654321'
    const steps = Array.from({ length: full.length + 1 }, (_, n) => full.slice(0, n))
    expect(steps.map(formatPhone)).toEqual([
      '',
      '(1',
      '(11',
      '(11) 9',
      '(11) 9 8',
      '(11) 9 87',
      '(11) 9 876',
      '(11) 9 8765',
      '(11) 9 8765-4',
      '(11) 9 8765-43',
      '(11) 9 8765-432',
      '(11) 9 8765-4321',
    ])
  })

  it('formata um número completo com dígitos diferentes', () => {
    expect(formatPhone('19987654321')).toBe('(19) 9 8765-4321')
  })

  it('ignora letras e símbolos e limita a 11 dígitos', () => {
    expect(formatPhone('(19) 9 8765-4321')).toBe('(19) 9 8765-4321')
    expect(formatPhone('a1b9c')).toBe('(19')
    expect(formatPhone('199876543219999')).toBe('(19) 9 8765-4321')
    expect(formatPhone('   ')).toBe('')
  })

  it('reformata telefone no formato antigo (sem o espaço depois do 9)', () => {
    expect(formatPhone('(19) 99999-0101')).toBe('(19) 9 9999-0101')
  })

  it('descarta o código do país ao colar, sem confundir com DDD 55', () => {
    expect(formatPhone('+55 (11) 9 1234-5678')).toBe('(11) 9 1234-5678')
    expect(formatPhone('5511912345678')).toBe('(11) 9 1234-5678')
    expect(formatPhone('55912345678')).toBe('(55) 9 1234-5678')
    expect(formatPhone('5555912345678')).toBe('(55) 9 1234-5678')
  })
})

describe('caretAfterDigits', () => {
  it('fica logo depois do n-ésimo dígito', () => {
    expect(caretAfterDigits('(11) 1 1111-1111', 2)).toBe(3)
    expect(caretAfterDigits('(11) 1 1111-1111', 3)).toBe(6)
    expect(caretAfterDigits('(11) 1 1111-1111', 4)).toBe(8)
    expect(caretAfterDigits('(11) 1 1111-1111', 11)).toBe(16)
    expect(caretAfterDigits('(11', 2)).toBe(3)
  })

  it('sem dígitos antes, fica depois do parêntese; passando do fim, vai ao fim', () => {
    expect(caretAfterDigits('(11) 1', 0)).toBe(1)
    expect(caretAfterDigits('', 0)).toBe(0)
    expect(caretAfterDigits('(11) 1', 9)).toBe(6)
  })
})

describe('editPhone', () => {
  it('digitar no fim acrescenta o dígito e mantém o cursor no fim', () => {
    expect(editPhone('(11) 9', '(11) 98', 7)).toEqual({ value: '(11) 9 8', caret: 8 })
    expect(editPhone('', '9', 1)).toEqual({ value: '(9', caret: 2 })
  })

  it('letras digitadas são ignoradas e o cursor não anda', () => {
    expect(editPhone('(11) 9', '(11) 9a', 7)).toEqual({ value: '(11) 9', caret: 6 })
    expect(editPhone('(11) 9 8888', '(11) 9 8a888', 9)).toEqual({ value: '(11) 9 8888', caret: 8 })
  })

  it('apagar um dígito comum mantém o resto', () => {
    expect(editPhone('(11) 9 1234-5678', '(11) 9 1234-567', 15)).toEqual({ value: '(11) 9 1234-567', caret: 15 })
    expect(editPhone('(11) 9', '(11) ', 5)).toEqual({ value: '(11', caret: 3 })
  })

  it('apagar só a máscara apaga o dígito anterior (o backspace não fica preso)', () => {
    // "(11) 1 1": apaga o espaço do índice 6 (cursor em 6 depois de apagar)
    expect(editPhone('(11) 9 8', '(11) 98', 6)).toEqual({ value: '(11) 8', caret: 3 })
    // "(11) 1 1111-1": apaga o hífen
    expect(editPhone('(11) 9 1111-1', '(11) 9 11111', 11)).toEqual({ value: '(11) 9 1111', caret: 10 })
    // "(11) 1": apaga o ") "
    expect(editPhone('(11) 9', '(119', 3)).toEqual({ value: '(19', caret: 2 })
  })

  it('editar no meio reformata e deixa o cursor depois do dígito digitado', () => {
    expect(editPhone('(19) 9 8888', '(179) 9 8888', 3)).toEqual({ value: '(17) 9 9888-8', caret: 3 })
  })

  it('colar substitui tudo e leva o cursor ao fim', () => {
    expect(editPhone('', '+55 (11) 9 1234-5678', 20)).toEqual({ value: '(11) 9 1234-5678', caret: 16 })
    expect(editPhone('(11) 1', '11987654321', 11)).toEqual({ value: '(11) 9 8765-4321', caret: 16 })
  })
})
