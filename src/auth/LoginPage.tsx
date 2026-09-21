import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useSession } from './useSession.ts'

export default function LoginPage() {
  const { session, login } = useSession()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [failed, setFailed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  if (session) return <Navigate to="/pacientes" replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!username.trim() || !password) return
    setSubmitting(true)
    setUnavailable(false)
    try {
      setFailed(!(await login(username.trim(), password)))
    } catch {
      setUnavailable(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container component="main" maxWidth="xs" sx={{ pt: { xs: 4, sm: 10 }, pb: 4 }}>
      <Typography variant="h1" gutterBottom>
        Entrar
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Sistema da Clínica de Fonoaudiologia
      </Typography>
      <Paper component="form" noValidate onSubmit={handleSubmit} sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          {failed && <Alert severity="error">Usuário ou senha inválidos.</Alert>}
          {unavailable && (
            <Alert severity="error">Não foi possível entrar. Verifique se o navegador permite armazenar dados e tente novamente.</Alert>
          )}
          <TextField
            label="Usuário"
            id="username"
            name="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            fullWidth
            error={submitted && !username.trim()}
            helperText={submitted && !username.trim() ? 'Informe o usuário.' : undefined}
            slotProps={{
              htmlInput: { autoComplete: 'username', autoCapitalize: 'none', spellCheck: false },
            }}
          />
          <TextField
            label="Senha"
            id="current-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            fullWidth
            error={submitted && !password}
            helperText={submitted && !password ? 'Informe a senha.' : undefined}
            slotProps={{
              htmlInput: { autoComplete: 'current-password' },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((shown) => !shown)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button type="submit" variant="contained" size="large" disabled={submitting}>
            Entrar
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}
