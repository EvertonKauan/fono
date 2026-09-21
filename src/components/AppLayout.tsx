import { useLayoutEffect, useRef } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import CalendarMonth from '@mui/icons-material/CalendarMonth'
import LibraryBooks from '@mui/icons-material/LibraryBooks'
import Logout from '@mui/icons-material/Logout'
import Person from '@mui/icons-material/Person'
import { useSession } from '../auth/useSession.ts'

const navLink = {
  borderRadius: 0,
  borderBottom: '2px solid transparent',
  '&.active': { color: 'primary.main', borderBottomColor: 'primary.main' },
} as const

export default function AppLayout() {
  const { session, logout } = useSession()
  const rootRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLElement>(null)

  // A altura da barra (uma ou duas linhas, conforme a largura) vai para --app-bar-height, que os cabeçalhos fixos usam.
  useLayoutEffect(() => {
    const root = rootRef.current
    const bar = barRef.current
    if (!root || !bar) return
    const update = () => root.style.setProperty('--app-bar-height', `${bar.offsetHeight}px`)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(bar)
    return () => observer.disconnect()
  }, [])

  return (
    <Box ref={rootRef} sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <AppBar ref={barRef} position="sticky">
        <Container maxWidth="lg">
          <Toolbar variant="dense" disableGutters sx={{ columnGap: 2, flexWrap: 'wrap', py: { xs: 0.5, sm: 0 } }}>
            <Typography variant="h6" component="p" noWrap sx={{ flexGrow: 1, minWidth: 0, order: 1 }}>
              {session?.tenant.name}
            </Typography>
            <Box
              component="nav"
              aria-label="Principal"
              sx={{ order: { xs: 3, sm: 2 }, width: { xs: '100%', sm: 'auto' }, display: 'flex', gap: 1 }}
            >
              <Button component={NavLink} to="/pacientes" color="inherit" size="small" startIcon={<Person />} sx={navLink}>
                Pacientes
              </Button>
              <Button component={NavLink} to="/calendario" color="inherit" size="small" startIcon={<CalendarMonth />} sx={navLink}>
                Calendário
              </Button>
              <Button component={NavLink} to="/material" color="inherit" size="small" startIcon={<LibraryBooks />} sx={navLink}>
                Material auxiliar
              </Button>
            </Box>
            <Button
              color="inherit"
              startIcon={<Logout />}
              onClick={logout}
              aria-label="Sair"
              sx={{ order: { xs: 2, sm: 3 }, minWidth: 0, '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 }, ml: { xs: 0, sm: -0.5 } } }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Sair
              </Box>
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, py: { xs: 2, md: 3 } }}>
        <Outlet />
      </Container>
    </Box>
  )
}
