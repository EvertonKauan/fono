# Plan técnico — Fase 1 (front com mocks)

Como vamos implementar o que está em `spec.md`, respeitando `constitution.md`.

**Repositório:** https://github.com/EvertonKauan/fono — branch `main` protegida; trabalho por feature branch (`feat/T01-setup`, `feat/T05-login`, ...) e PR por marco (M0, M1, ...) ou por tarefa, como preferir.

## 1. Stack
- Vite + React + TypeScript (`strict`)
- `@mui/material` v6, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`
- `@mui/x-data-grid` (com locale `ptBR`) e `@mui/x-date-pickers` + `dayjs` (adapter e locale `pt-br`) — são pacotes oficiais do MUI
- `react-router-dom`
- Fontes via `@fontsource`: títulos **Fraunces** (serifada com personalidade), corpo **Source Sans 3**
- Vitest para os poucos testes unitários (§10)
- Sem outras libs de UI, estado ou formulário na Fase 1 (`useState` + Context bastam)

## 2. Tema (`src/theme.ts`, único arquivo)
`createTheme` próprio; nada de tema padrão.

| Token | Valor | Uso |
|---|---|---|
| `primary.main` | `#4F7F73` (verde-sálvia suave) | ações, aba ativa, links |
| `primary.light` / `dark` | `#7FA89B` / `#3A5F55` | hover, realces |
| `background.default` | `#F6F5F2` | fundo da aplicação |
| `background.paper` | `#FFFFFF` | tabelas, painéis |
| `divider` | `#DDD9D2` | bordas |
| `text.primary` / `secondary` | `#26302E` / `#5F6B68` | textos |
| `error.main` (alerta) | `#C2452D` | pagamento pendente |

- `shape.borderRadius: 4`; sem sombras (`Paper` com borda, `elevation 0`); sem gradientes.
- Tipografia: `h1–h6` em Fraunces, demais variantes em Source Sans 3; escala compacta.
- Overrides globais: `MuiButton` (`disableElevation`), `MuiTextField` (`size: small`), `MuiDataGrid` (`density: compact`), `MuiChip`, `MuiTab`, `MuiCssBaseline` (regras `@media print`).
- Estado "Em dia" usa o próprio primário (sem quarta cor).
- Ícones: somente `@mui/icons-material` (ex.: `Person`, `Add`, `Print`, `Payments`, `Description`, `Logout`).
- Breakpoints padrão do MUI (`xs, sm, md, lg`); estilos escritos mobile first (`sx` sem breakpoint = celular, `sx={{ p: 2, md: { p: 4 } }}` etc.).

## 3. Estrutura de pastas
```
src/
  theme.ts
  main.tsx  App.tsx  routes.tsx
  types/domain.ts
  auth/            SessionProvider.tsx  RequireAuth.tsx  LoginPage.tsx
  services/        db.ts  auth.ts  patients.ts  anamnese.ts
                   prescriptions.ts  payments.ts  tenants.ts
  mocks/           seed.ts  anamnese-schema.ts
  pages/
    patients/      PatientsPage.tsx  NewPatientDialog.tsx
    patient/       PatientProfile.tsx  PatientHeader.tsx
      tabs/        DadosTab  AnamneseTab  PrescricoesTab  FinanceiroTab  RelatorioTab
  components/      PrintSheet.tsx  PaymentChip.tsx  CpfField.tsx  MoneyField.tsx  AppLayout.tsx
  utils/           cpf.ts  age.ts  format.ts
```

## 3.1 Organização do repositório
A estrutura da seção 3 é o que fica dentro de `src/`. No diretório raiz do repositório `fono`:

```
fono/
  .claude/                 skills sincronizadas do projeto (frontend-design etc.) — opcional, ver §11
  docs/
    constitution.md
    spec.md
    plan.md
    tasks.md
  public/                  estáticos (favicon etc.)
  src/                     conforme seção 3 acima
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  .eslintrc / eslint.config.js
  .gitignore
  README.md
```
- `docs/` é onde ficam estes quatro arquivos (constitution, spec, plan, tasks) — versionados junto com o código, então toda mudança de escopo vira commit revisável.
- Sem pasta `back/` ou `api/` ainda: a Fase 2 (back-end) ganha sua própria pasta ou repositório quando começar; até lá `services/` no front é a única "borda" com o futuro back-end (constitution, regra 4).

## 4. Rotas
| Rota | Tela |
|---|---|
| `/login` | Login |
| `/pacientes` | Lista (protegida) |
| `/pacientes/:id` | Perfil; aba pela query `?aba=dados\|anamnese\|prescricoes\|financeiro\|relatorio` |

## 5. Modelo de dados (`types/domain.ts`)
```ts
type Tenant = { id: string; name: string; professional: { name: string; registry: string } };
type User = { id: string; tenantId: string; username: string; password: string }; // só mock

type Patient = {
  id: string; tenantId: string;
  kind: 'crianca' | 'adulto';
  fullName: string; birthDate: string;            // ISO yyyy-mm-dd
  gender?: string; city?: string; address?: string;
  phone?: string; email?: string; referredBy?: string;
  schooling?: string; school?: string;            // criança / adulto
  occupation?: string;                            // adulto
  guardians: { name: string; relationship: string; phone?: string }[];
  cpf?: string;
  financialGuardian?: { name: string; cpf: string };   // obrigatório se menor
  visit: { fee: number; weekdays: number[]; time?: string }; // 0=dom … 6=sáb
  createdAt: string;
};

type Anamnese = {
  id: string; tenantId: string; patientId: string;
  answers: Record<string, string | { yes: boolean; detail?: string }>; // chave = questionId
  voiceApplicable: boolean; updatedAt: string;
};

type Prescription = {
  id: string; tenantId: string; patientId: string; date: string;
  exercises: { title: string; description: string }[]; frequency: string;
};

type Payment = {
  id: string; tenantId: string; patientId: string;
  period: string;                 // 'yyyy-mm' (competência)
  sessions: number; amount: number;
  status: 'pago' | 'pendente';
  paidAt?: string; method?: 'pix' | 'dinheiro' | 'cartao' | 'outro';
};
```
- **Schema da anamnese** (`mocks/anamnese-schema.ts`): `Section[] → Question[]` com `id`, `label`, `type` (`texto | simNao | escolha`), `options?`, `audience?: 'crianca' | 'adulto'` (ausente = ambos). Gerado a partir do Anexo A da spec. O formulário só renderiza o schema.

## 6. Camada de serviços (a fronteira com o futuro back-end)
- Todas as funções são **assíncronas** e recebem `tenantId` (vindo da sessão), ex.: `listPatients(tenantId)`, `savePatient(tenantId, patient)`, `listPayments(tenantId, patientId)`.
- `db.ts`: um único objeto no `localStorage` (`fono:db`) com tabelas `tenants, users, patients, anamneses, prescriptions, payments`. Semeado por `seed.ts` na primeira carga; leitura/escrita sempre filtrando por `tenantId`.
- Componentes chamam só `services/`. Na Fase 2 troca-se o miolo dos serviços por chamadas HTTP, sem mexer nas telas.

## 7. Decisões de UI
- **Lista:** `DataGrid` com colunas da RF-02 a partir de `md`; abaixo de `md`, lista de `Card` (um por paciente, mesmas informações) — o `DataGrid` não é utilizável em tela estreita. `PaymentChip` na coluna/cartão; status derivado dos lançamentos.
- **Perfil:** `Tabs` com `variant="scrollable"` (rolam no celular, fixas a partir de `md`), sincronizadas com a query string; formulários locais por aba, cada uma com seu Salvar.
- **Anamnese:** `Accordion` por seção; campos gerados do schema; filtro por `audience` conforme `kind`.
- **Datas:** `DatePicker` do MUI X; valores guardados em ISO.
- **Idade/menoridade:** `utils/age.ts` (`ageOf`, `isMinor`); menor de 18 exige `financialGuardian` ao salvar dados fiscais.
- **CPF:** `utils/cpf.ts` valida dígitos verificadores e mascara (`***.123.456-**` em listagens).
- **Dialogs:** `NewPatientDialog` com `fullScreen` abaixo de `sm` (via `useMediaQuery`), Dialog normal a partir daí.

## 8. Impressão
- `PrintSheet` renderiza o conteúdo via `createPortal` em `document.body`, **fora** do `#root`.
- Fluxo: usuário clica Imprimir → estado `printing` → `PrintSheet` monta → `window.print()` → no `afterprint` desmonta.
- Regras `@media print`: `#root { display: none }`, `.print-sheet { display: block }`, página A4 com margens, `page-break-before` entre seções do relatório.
- Prescrição e Relatório usam o mesmo `PrintSheet`; cabeçalho e assinatura vêm de `Tenant`.

## 9. Dados mockados
- 2 tenants: `claudionaria` (usuário `clau` / senha `123`) e `demo` (usuário `demo` / `123`), só para validar o isolamento (RF-10).
- Tenant `claudionaria`: ~8 pacientes fictícios (mistura de crianças e adultos), ao menos 3 com lançamento pendente, 1 anamnese preenchida, 1 prescrição.
- CPFs fictícios, porém válidos no cálculo dos dígitos.

## 10. Testes (mínimo)
- Unitários (Vitest) só para `cpf.ts`, `age.ts` e filtro de perguntas por público da anamnese.
- Verificação manual dos critérios de aceite da spec por tarefa.

## 11. Skill `frontend-design`
Já está disponível nesta sessão (é uma skill pública do Claude, não precisa instalar nada). Ela é carregada automaticamente sempre que eu for criar ou ajustar uma tela — não requer nenhuma ação sua aqui no chat.

Se depois vocês passarem a codar fora daqui (ex.: Claude Code local no VS Code, outro projeto), a mesma skill só existe nesse outro ambiente se ele também tiver acesso a ela; nesse caso, avise que eu explico como replicar.
