import { useEffect, useState } from 'react'
import { useTenantId } from '../auth/useSession.ts'
import { addAttachment, listAttachments, removeAttachment } from '../services/attachments.ts'
import type { AttachmentMeta, AttachmentOwner } from '../types/domain.ts'

// Rascunho em memória: adições e remoções só valem quando quem hospeda o formulário chama apply() no Salvar.
export type AttachmentDraft = { existing: AttachmentMeta[]; added: File[]; removedIds: string[] }

export function useAttachmentDraft(owner: AttachmentOwner) {
  const tenantId = useTenantId()
  const [draft, setDraft] = useState<AttachmentDraft>({ existing: [], added: [], removedIds: [] })
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading')

  useEffect(() => {
    let active = true
    listAttachments(tenantId, { type: owner.type, id: owner.id })
      .then((existing) => {
        if (!active) return
        setDraft({ existing, added: [], removedIds: [] })
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('unavailable')
      })
    return () => {
      active = false
    }
  }, [tenantId, owner.type, owner.id])

  // Aplica passo a passo e vai tirando do rascunho o que já foi gravado; se falhar, o resto continua pendente.
  async function apply() {
    for (const id of draft.removedIds) {
      await removeAttachment(tenantId, id)
      setDraft((d) => ({ ...d, existing: d.existing.filter((a) => a.id !== id), removedIds: d.removedIds.filter((x) => x !== id) }))
    }
    for (const file of draft.added) {
      const meta = await addAttachment(tenantId, owner, file)
      setDraft((d) => ({ ...d, existing: [...d.existing, meta], added: d.added.filter((f) => f !== file) }))
    }
  }

  return { draft, setDraft, status, apply }
}

export type AttachmentsState = ReturnType<typeof useAttachmentDraft>
