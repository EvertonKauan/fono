import { useId, useRef, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AttachFile from '@mui/icons-material/AttachFile'
import Delete from '@mui/icons-material/Delete'
import Description from '@mui/icons-material/Description'
import Download from '@mui/icons-material/Download'
import PictureAsPdf from '@mui/icons-material/PictureAsPdf'
import { useTenantId } from '../auth/useSession.ts'
import { getAttachmentBlob } from '../services/attachments.ts'
import type { AttachmentMeta } from '../types/domain.ts'
import { formatDate } from '../utils/format.ts'
import { ATTACHMENT_ACCEPT, attachmentKind, downloadBlob, formatBytes, validateAttachment } from '../utils/files.ts'
import type { AttachmentsState } from './useAttachmentDraft.ts'

type Item = { key: string; name: string; size: number; meta?: AttachmentMeta; file?: File }

type Props = {
  title: string
  attachments: AttachmentsState
  saveNote: string // o que dispara a gravação (ex.: "ao salvar a anamnese")
}

export default function AttachmentsField({ title, attachments, saveNote }: Props) {
  const { draft, setDraft, status } = attachments
  const tenantId = useTenantId()
  const headingId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [problems, setProblems] = useState<string[]>([])

  const items: Item[] = [
    ...draft.existing
      .filter((meta) => !draft.removedIds.includes(meta.id))
      .map((meta) => ({ key: meta.id, name: meta.name, size: meta.size, meta })),
    ...draft.added.map((file, index) => ({ key: `novo-${index}-${file.name}`, name: file.name, size: file.size, file })),
  ]

  function pick(files: FileList | null) {
    if (!files) return
    const accepted: File[] = []
    const rejected: string[] = []
    for (const file of files) {
      const problem = validateAttachment(file)
      if (problem) rejected.push(`“${file.name}”: ${problem}`)
      else accepted.push(file)
    }
    setProblems(rejected)
    if (accepted.length > 0) setDraft((d) => ({ ...d, added: [...d.added, ...accepted] }))
  }

  async function download(item: Item) {
    try {
      if (item.file) return downloadBlob(item.file, item.file.name)
      const found = await getAttachmentBlob(tenantId, item.meta!.id)
      if (!found) throw new Error('não encontrado')
      downloadBlob(found.blob, found.meta.name)
    } catch {
      setProblems(['Não foi possível baixar o arquivo.'])
    }
  }

  function remove(item: Item) {
    setProblems([])
    if (item.file) setDraft((d) => ({ ...d, added: d.added.filter((file) => file !== item.file) }))
    else setDraft((d) => ({ ...d, removedIds: [...d.removedIds, item.meta!.id] }))
  }

  return (
    <Box component="section" aria-labelledby={headingId}>
      <Typography id={headingId} variant="h6" component="h3" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Alert severity="info" variant="outlined" role="note" sx={{ mb: 1.5 }}>
        Na Fase 1 os arquivos ficam só neste navegador, sem criptografia. Não anexe documentos reais de pacientes.
      </Alert>
      {status === 'unavailable' && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          Não foi possível acessar o armazenamento de anexos neste navegador.
        </Alert>
      )}
      {problems.length > 0 && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          <Stack component="ul" sx={{ m: 0, pl: 2 }}>
            {problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </Stack>
        </Alert>
      )}

      {items.length === 0 ? (
        <Typography color="text.secondary" sx={{ mb: 1.5 }}>
          Nenhum anexo.
        </Typography>
      ) : (
        <Paper component="ul" role="list" sx={{ listStyle: 'none', m: 0, p: 0, mb: 1.5 }}>
          {items.map((item, index) => (
            <Stack
              component="li"
              key={item.key}
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ sm: 'center' }}
              gap={1.5}
              sx={{ p: 1.5, borderTop: index > 0 ? 1 : 0, borderColor: 'divider' }}
            >
              <Stack direction="row" alignItems="center" gap={1.5} sx={{ flexGrow: 1, minWidth: 0 }}>
                {attachmentKind(item.name) === 'PDF' ? <PictureAsPdf color="action" /> : <Description color="action" />}
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ overflowWrap: 'anywhere' }}>{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {attachmentKind(item.name)} · {formatBytes(item.size)} ·{' '}
                    {item.meta ? formatDate(item.meta.createdAt) : 'será salvo ao salvar'}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" gap={1}>
                <Button size="small" variant="outlined" startIcon={<Download />} aria-label={`Baixar ${item.name}`} onClick={() => download(item)}>
                  Baixar
                </Button>
                <Button size="small" variant="outlined" startIcon={<Delete />} aria-label={`Remover ${item.name}`} onClick={() => remove(item)}>
                  Remover
                </Button>
              </Stack>
            </Stack>
          ))}
        </Paper>
      )}

      <Button startIcon={<AttachFile />} variant="outlined" disabled={status !== 'ready'} onClick={() => inputRef.current?.click()}>
        Anexar arquivo
      </Button>
      <input
        ref={inputRef}
        hidden
        type="file"
        multiple
        accept={ATTACHMENT_ACCEPT}
        aria-label={`Escolher arquivos: ${title}`}
        onChange={(event) => {
          pick(event.target.files)
          event.target.value = '' // permite escolher o mesmo arquivo de novo
        }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Aceita PDF e DOCX, até 10 MB cada. As mudanças valem {saveNote}.
      </Typography>
    </Box>
  )
}
