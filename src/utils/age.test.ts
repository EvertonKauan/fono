import { describe, expect, it } from 'vitest'
import { ageOf, isMinor } from './age.ts'

const today = new Date(2026, 8, 20) // 20/09/2026

describe('ageOf', () => {
  it('conta anos completos', () => {
    expect(ageOf('2016-09-21', today)).toBe(9)
    expect(ageOf('2016-09-20', today)).toBe(10)
    expect(ageOf('2016-01-01', today)).toBe(10)
  })

  it('resolve virada de ano e nascimento em 29/02', () => {
    expect(ageOf('2026-01-01', today)).toBe(0)
    expect(ageOf('2008-02-29', new Date(2026, 1, 28))).toBe(17)
    expect(ageOf('2008-02-29', new Date(2026, 2, 1))).toBe(18)
  })
})

describe('isMinor', () => {
  it('é menor até o dia anterior aos 18 anos', () => {
    expect(isMinor('2008-09-21', today)).toBe(true)
    expect(isMinor('2008-09-20', today)).toBe(false)
  })
})
