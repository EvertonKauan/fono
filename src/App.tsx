import { BrowserRouter } from 'react-router-dom'
import SessionProvider from './auth/SessionProvider.tsx'
import AppRoutes from './routes.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <AppRoutes />
      </SessionProvider>
    </BrowserRouter>
  )
}
