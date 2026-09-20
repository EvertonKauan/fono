# Fono — Sistema da Clínica de Fonoaudiologia

Fase 1: front-end com dados mockados (`localStorage`). A documentação do projeto está em [docs/](docs/): `constitution.md`, `spec.md`, `plan.md`, `tasks.md`. Limitações conhecidas da Fase 1: [docs/known-issues.md](docs/known-issues.md).

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Checagem de tipos e build de produção |
| `npm run lint` | ESLint |
| `npm test` | Testes unitários (Vitest) |

## Usuários de teste (mock)

| Usuário | Senha | Clínica (tenant) |
|---|---|---|
| `clau` | `123` | Fonoaudiologia Claudionaria Torres |
| `demo` | `123` | Clínica Demonstração (só para validar o isolamento entre tenants) |
