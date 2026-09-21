import type { Attachment, AttachmentMeta, AttachmentOwner } from '../types/domain.ts'
import { mimeTypeOf, validateAttachment } from '../utils/files.ts'
import { newId } from '../utils/id.ts'

// Anexos ficam no IndexedDB (plan §12): metadados e Blob no mesmo registro, sempre filtrados por tenant.
const DB_NAME = 'fono-files'
const STORE = 'attachments'
const BY_OWNER = 'byOwner'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB indisponível.'))
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE, { keyPath: 'id' })
      store.createIndex(BY_OWNER, ['tenantId', 'ownerType', 'ownerId'])
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Não foi possível abrir o armazenamento de anexos.'))
  })
}

async function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb()
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(STORE, mode)
      const request = work(transaction.objectStore(STORE))
      transaction.oncomplete = () => resolve(request.result)
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error ?? new Error('Gravação de anexo cancelada.'))
    })
  } finally {
    db.close()
  }
}

const toMeta = (record: Attachment): AttachmentMeta => ({
  id: record.id,
  tenantId: record.tenantId,
  ownerType: record.ownerType,
  ownerId: record.ownerId,
  name: record.name,
  mimeType: record.mimeType,
  size: record.size,
  createdAt: record.createdAt,
})

// mais antigo primeiro
export async function listAttachments(tenantId: string, owner: AttachmentOwner): Promise<AttachmentMeta[]> {
  const records = await run<Attachment[]>('readonly', (store) =>
    store.index(BY_OWNER).getAll(IDBKeyRange.only([tenantId, owner.type, owner.id])),
  )
  return records.map(toMeta).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function addAttachment(tenantId: string, owner: AttachmentOwner, file: File): Promise<AttachmentMeta> {
  const problem = validateAttachment(file)
  if (problem) throw new Error(problem)
  const record: Attachment = {
    id: newId(),
    tenantId,
    ownerType: owner.type,
    ownerId: owner.id,
    name: file.name,
    mimeType: mimeTypeOf(file),
    size: file.size,
    createdAt: new Date().toISOString(),
    blob: file,
  }
  await run('readwrite', (store) => store.put(record))
  return toMeta(record)
}

// Só devolve se o anexo pertencer ao tenant informado.
export async function getAttachmentBlob(tenantId: string, id: string): Promise<{ meta: AttachmentMeta; blob: Blob } | undefined> {
  const record = await run<Attachment | undefined>('readonly', (store) => store.get(id))
  return record && record.tenantId === tenantId ? { meta: toMeta(record), blob: record.blob } : undefined
}

export async function removeAttachment(tenantId: string, id: string): Promise<void> {
  const record = await run<Attachment | undefined>('readonly', (store) => store.get(id))
  if (!record || record.tenantId !== tenantId) return
  await run('readwrite', (store) => store.delete(id))
}
