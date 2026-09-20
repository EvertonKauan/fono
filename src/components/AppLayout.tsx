import { Outlet } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Logout from '@mui/icons-material/Logout'
import { useSession } from '../auth/useSession.ts'

export default function AppLayout() {
  const { session, logout } = useSession()

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky">
        <Container maxWidth="lg">
          <Toolbar variant="dense" disableGutters sx={{ gap: 2 }}>
            <Typography variant="h6" component="p" noWrap sx={{ flexGrow: 1 }}>
              {session?.tenant.name}
            </Typography>
            <Button color="inherit" startIcon={<Logout />} onClick={logout}>
              Sair
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
