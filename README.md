# Fono — Sistema da Clínica de Fonoaudiologia

Fase 1: front-end com dados mockados (`localStorage`). A documentação do projeto está em [docs/](docs/): `constitution.md`, `spec.md`, `plan.md`, `tasks.md`. Limitações conhecidas da Fase 1: [docs/known-issues.md](docs/known-issues.md).

## Publicação (GitHub Pages)

A cada push na `main`, o workflow [`pages.yml`](.github/workflows/pages.yml) roda os testes, gera o build com `BASE_PATH=/fono/` e publica em https://evertonkauan.github.io/fono/. É um mock da Fase 1: os dados ficam no navegador de quem acessa e o login é de teste (usuários no seed, `src/mocks/seed.ts`). Para simular localmente: `BASE_PATH=/fono/ npm run build && BASE_PATH=/fono/ npm run preview`.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Checagem de tipos e build de produção |
| `npm run lint` | ESLint |
| `npm test` | Testes unitários (Vitest) |
