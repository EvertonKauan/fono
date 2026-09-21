export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

export const ATTACHMENT_ACCEPT = Object.entries(MIME_BY_EXTENSION)
  .flatMap(([extension, mime]) => [`.${extension}`, mime])
  .join(',')

const extensionOf = (name: string) => (name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '')

export const formatBytes = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`

// Devolve a mensagem de erro em pt-BR, ou null se o arquivo pode ser anexado.
export function validateAttachment(file: { name: string; size: number; type: string }): string | null {
  const expectedMime = MIME_BY_EXTENSION[extensionOf(file.name)]
  if (!expectedMime) return 'Formato não aceito. Envie apenas arquivos PDF ou DOCX.'
  // Alguns navegadores não informam o tipo (ou usam octet-stream); quando informam, precisa combinar com a extensão.
  if (file.type && file.type !== 'application/octet-stream' && file.type !== expectedMime) {
    return 'O conteúdo do arquivo não corresponde à extensão. Envie um PDF ou DOCX válido.'
  }
  if (file.size === 0) return 'O arquivo está vazio.'
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return `O arquivo passa do limite de 10 MB (tem ${formatBytes(file.size)}).`
  }
  return null
}

export const mimeTypeOf = (file: { name: string; type: string }) =>
  file.type && file.type !== 'application/octet-stream' ? file.type : (MIME_BY_EXTENSION[extensionOf(file.name)] ?? '')

export const attachmentKind = (name: string) => (extensionOf(name) === 'pdf' ? 'PDF' : 'DOCX')

// Baixa um arquivo em memória mantendo o nome original.
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
