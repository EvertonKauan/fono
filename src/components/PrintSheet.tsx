import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type Props = { children: ReactNode; onDone: () => void }

// Renderiza o conteúdo em document.body, fora do #root, e abre a impressão ao montar.
// Os estilos @media print (theme.ts) escondem o app e mostram só o .print-sheet.
export default function PrintSheet({ children, onDone }: Props) {
  const printed = useRef(false)
  const done = useRef(onDone)

  useEffect(() => {
    done.current = onDone
  })

  useEffect(() => {
    const handleAfterPrint = () => done.current()
    window.addEventListener('afterprint', handleAfterPrint)
    // o StrictMode monta duas vezes em desenvolvimento; imprime uma só
    if (!printed.current) {
      printed.current = true
      window.print()
    }
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [])

  return createPortal(<div className="print-sheet">{children}</div>, document.body)
}
