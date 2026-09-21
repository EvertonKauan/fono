import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { addAttachment, getAttachmentBlob, listAttachments, removeAttachment } from './attachments.ts'

const pdf = (name: string, content = 'conteúdo do pdf') => new File([content], name, { type: 'application/pdf' })
const owner = (id: string) => ({ type: 'sessao' as const, id })

describe('attachments (IndexedDB)', () => {
  it('adiciona, lista só metadados e devolve o arquivo idêntico', async () => {
    const original = pdf('laudo.pdf', 'bytes do laudo')
    const meta = await addAttachment('t1', owner('s1'), original)
    expect(meta).toMatchObject({ tenantId: 't1', ownerType: 'sessao', ownerId: 's1', name: 'laudo.pdf', mimeType: 'application/pdf', size: original.size })
    expect('blob' in meta).toBe(false)

    const listed = await listAttachments('t1', owner('s1'))
    expect(listed).toHaveLength(1)
    expect('blob' in listed[0]!).toBe(false)

    const got = await getAttachmentBlob('t1', meta.id)
    expect(got!.meta.name).toBe('laudo.pdf')
    expect(await got!.blob.text()).toBe('bytes do laudo')
    expect(got!.blob.size).toBe(original.size)
  })

  it('separa por dono (anamnese x sessão, e sessões diferentes)', async () => {
    await addAttachment('t2', { type: 'anamnese', id: 'p1' }, pdf('anamnese.pdf'))
    await addAttachment('t2', owner('sa'), pdf('sessao-a.pdf'))
    await addAttachment('t2', owner('sb'), pdf('sessao-b.pdf'))
    expect((await listAttachments('t2', { type: 'anamnese', id: 'p1' })).map((a) => a.name)).toEqual(['anamnese.pdf'])
    expect((await listAttachments('t2', owner('sa'))).map((a) => a.name)).toEqual(['sessao-a.pdf'])
    expect(await listAttachments('t2', { type: 'anamnese', id: 'sa' })).toEqual([])
  })

  it('isola por tenant: outro tenant não lista, não baixa e não remove', async () => {
    const meta = await addAttachment('clau', owner('s-iso'), pdf('segredo.pdf'))
    expect(await listAttachments('demo', owner('s-iso'))).toEqual([])
    expect(await getAttachmentBlob('demo', meta.id)).toBeUndefined()
    await removeAttachment('demo', meta.id)
    expect(await listAttachments('clau', owner('s-iso'))).toHaveLength(1)
    expect(await getAttachmentBlob('clau', meta.id)).toBeDefined()
  })

  it('remove só o anexo escolhido', async () => {
    const a = await addAttachment('t3', owner('s3'), pdf('a.pdf'))
    const b = await addAttachment('t3', owner('s3'), pdf('b.pdf'))
    await removeAttachment('t3', a.id)
    expect((await listAttachments('t3', owner('s3'))).map((x) => x.id)).toEqual([b.id])
    expect(await getAttachmentBlob('t3', a.id)).toBeUndefined()
    await removeAttachment('t3', a.id) // remover de novo não quebra
  })

  it('aceita docx e lista em ordem de criação', async () => {
    const docx = new File(['x'], 'relatorio.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    await addAttachment('t4', owner('s4'), pdf('primeiro.pdf'))
    await new Promise((resolve) => setTimeout(resolve, 5))
    await addAttachment('t4', owner('s4'), docx)
    expect((await listAttachments('t4', owner('s4'))).map((a) => a.name)).toEqual(['primeiro.pdf', 'relatorio.docx'])
  })

  it('rejeita formato e tamanho inválidos com mensagem em pt-BR, sem gravar', async () => {
    await expect(addAttachment('t5', owner('s5'), new File(['x'], 'foto.png', { type: 'image/png' }))).rejects.toThrow('Formato não aceito')
    await expect(addAttachment('t5', owner('s5'), new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'grande.pdf', { type: 'application/pdf' }))).rejects.toThrow('passa do limite de 10 MB')
    expect(await listAttachments('t5', owner('s5'))).toEqual([])
  })
})
