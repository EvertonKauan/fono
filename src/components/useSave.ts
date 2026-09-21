import { useState } from 'react'
import { SAVE_ERROR } from '../utils/messages.ts'

// Padrão de gravação dos formulários: o botão fica desabilitado só durante a gravação e,
// se ela falhar (ex.: armazenamento do navegador recusa), mostra o erro e libera o botão para tentar de novo.
export function useSave() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(action: () => Promise<void>, message: string = SAVE_ERROR) {
    setSaving(true)
    setError(null)
    try {
      await action()
    } catch {
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return { saving, error, run }
}
