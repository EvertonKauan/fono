import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

export default function App() {
  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h1" gutterBottom>
        Clínica de Fonoaudiologia
      </Typography>
      <Typography color="text.secondary">Fase 1 — front-end com dados mockados.</Typography>
    </Container>
  )
}
