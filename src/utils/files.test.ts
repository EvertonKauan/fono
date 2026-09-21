import { describe, expect, it } from 'vitest'
import { MAX_ATTACHMENT_BYTES, attachmentKind, formatBytes, mimeTypeOf, validateAttachment } from './files.ts'

const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const file = (name: string, size = 1000, type = '') => ({ name, size, type })

describe('validateAttachment', () => {
  it('aceita .pdf e .docx, com ou sem tipo informado e em qualquer caixa', () => {
    expect(validateAttachment(file('laudo.pdf', 1000, 'application/pdf'))).toBeNull()
    expect(validateAttachment(file('relatorio.docx', 1000, DOCX))).toBeNull()
    expect(validateAttachment(file('LAUDO.PDF'))).toBeNull()
    expect(validateAttachment(file('a.b.c.docx', 1000, 'application/octet-stream'))).toBeNull()
  })

  it('recusa outros formatos, inclusive o .doc antigo', () => {
    for (const name of ['nota.txt', 'foto.png', 'antigo.doc', 'planilha.xlsx', 'semextensao', 'arquivo.pdf.exe']) {
      expect(validateAttachment(file(name)), name).toBe('Formato não aceito. Envie apenas arquivos PDF ou DOCX.')
    }
  })

  it('recusa quando o tipo informado não combina com a extensão', () => {
    expect(validateAttachment(file('falso.pdf', 1000, 'image/png'))).toMatch(/não corresponde à extensão/)
    expect(validateAttachment(file('falso.docx', 1000, 'application/pdf'))).toMatch(/não corresponde à extensão/)
  })

  it('limite de 10 MB: exatamente 10 MB passa, um byte a mais não', () => {
    expect(validateAttachment(file('ok.pdf', MAX_ATTACHMENT_BYTES))).toBeNull()
    expect(validateAttachment(file('grande.pdf', MAX_ATTACHMENT_BYTES + 1))).toBe('O arquivo passa do limite de 10 MB (tem 10,0 MB).')
    expect(validateAttachment(file('enorme.docx', 25 * 1024 * 1024))).toContain('25,0 MB')
  })

  it('recusa arquivo vazio', () => {
    expect(validateAttachment(file('vazio.pdf', 0))).toBe('O arquivo está vazio.')
  })
})

describe('auxiliares', () => {
  it('formata tamanhos em KB e MB', () => {
    expect(formatBytes(200)).toBe('1 KB')
    expect(formatBytes(340 * 1024)).toBe('340 KB')
    expect(formatBytes(1.5 * 1024 * 1024)).toBe('1,5 MB')
  })

  it('deduz o tipo pela extensão e rotula PDF/DOCX', () => {
    expect(mimeTypeOf(file('a.docx'))).toBe(DOCX)
    expect(mimeTypeOf(file('a.pdf', 1, 'application/pdf'))).toBe('application/pdf')
    expect(attachmentKind('a.PDF')).toBe('PDF')
    expect(attachmentKind('a.docx')).toBe('DOCX')
  })
})
