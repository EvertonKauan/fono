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
- IndexedDB nativo, sem biblioteca, para os anexos (§12); `fake-indexeddb` só como dependência de desenvolvimento, para testar o service de anexos
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
- Status novos sem cor nova: sessão **Agendada** = chip outlined primário; **Realizada** = ícone de check (`CheckCircleOutline`); **Cancelada** = texto riscado em `text.secondary`; **Arquivado** = chip outlined neutro. `error` continua reservado ao alerta de pagamento pendente.
- Ícones: somente `@mui/icons-material` (ex.: `Person`, `Add`, `Print`, `Payments`, `Description`, `Logout`, `Archive`, `Unarchive`, `CalendarMonth`, `AttachFile`, `Download`, `ChevronLeft`, `ChevronRight`).
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
                   sessions.ts  attachments.ts
  mocks/           seed.ts  anamnese-schema.ts
  pages/
    patients/      PatientsPage.tsx  NewPatientDialog.tsx
    patient/       PatientProfile.tsx  PatientHeader.tsx
      tabs/        DadosTab  AnamneseTab  SessoesTab  PrescricoesTab  FinanceiroTab  RelatorioTab
    calendar/      CalendarPage.tsx  MonthGrid.tsx  TimeGrid.tsx  AgendaList.tsx  SessionPreview.tsx
  components/      PrintSheet.tsx  PaymentChip.tsx  CpfField.tsx  MoneyField.tsx  AppLayout.tsx
                   SessionDialog.tsx  AttachmentsField.tsx
  utils/           cpf.ts  age.ts  format.ts  files.ts  calendar.ts  id.ts
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
| `/pacientes/:id` | Perfil; aba pela query `?aba=dados\|anamnese\|sessoes\|prescricoes\|financeiro\|relatorio` |
| `/calendario` | Calendário de sessões (protegida); visão e data pela query `?visao=mes\|semana\|dia&data=yyyy-mm-dd` (padrão: mês, hoje) |

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
  archivedAt?: string;            // instante ISO; ausente = ativo (RF-11)
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

type Session = {                  // RF-12, RF-14 — independente de Payment
  id: string; tenantId: string; patientId: string;
  date: string;                   // ISO yyyy-mm-dd
  time?: string;                  // 'HH:mm'
  status: 'agendada' | 'realizada' | 'cancelada';
  billing: 'particular' | 'convenio';
  insurer?: string;               // obrigatório se billing === 'convenio'; ausente se particular
  evolution?: string;             // texto livre: o que aconteceu na sessão
  createdAt: string; updatedAt: string;
};

// RF-15 — vive no IndexedDB (§12), não no localStorage
type Attachment = {
  id: string; tenantId: string;
  ownerType: 'anamnese' | 'sessao';
  ownerId: string;                // anamnese → patientId; sessao → Session.id
  name: string; mimeType: string; size: number; createdAt: string;
  blob: Blob;                     // o arquivo; a UI recebe só os metadados até baixar
};
```
- **Anexos e dono:** a anamnese é uma por paciente e pode ainda não existir quando o primeiro anexo é adicionado; por isso `ownerId` da anamnese é o `patientId`.
- **Sem exclusão:** não há exclusão de paciente nem de sessão; existem `archivedAt` e `status: 'cancelada'`.
- **Schema da anamnese** (`mocks/anamnese-schema.ts`): `Section[] → Question[]` com `id`, `label`, `type` (`texto | simNao | escolha`), `options?`, `audience?: 'crianca' | 'adulto'` (ausente = ambos). Gerado a partir do Anexo A da spec. O formulário só renderiza o schema.

## 6. Camada de serviços (a fronteira com o futuro back-end)
- Todas as funções são **assíncronas** e recebem `tenantId` (vindo da sessão), ex.: `listPatients(tenantId)`, `savePatient(tenantId, patient)`, `listPayments(tenantId, patientId)`.
- `db.ts`: um único objeto no `localStorage` (`fono:db`) com tabelas `tenants, users, patients, anamneses, prescriptions, payments, sessions`. Semeado por `seed.ts` na primeira carga; leitura/escrita sempre filtrando por `tenantId`.
- **Migração de tabelas novas:** quem já tem `fono:db` de uma versão anterior não pode perder dados. Ao carregar, tabelas ausentes (hoje só `sessions`) são preenchidas a partir do seed; as tabelas existentes nunca são tocadas. Só um objeto ilegível é recriado por inteiro.
- `sessions.ts`: `listSessions(tenantId, patientId)`, `listSessionsBetween(tenantId, from, to)` (calendário, todos os pacientes do tenant), `createSession`, `saveSession`. Sem exclusão.
- `patients.ts` ganha `archivePatient(tenantId, id)` e `unarchivePatient(tenantId, id)` (gravam/removem `archivedAt`).
- `attachments.ts`: API assíncrona sobre IndexedDB (§12), também sempre com `tenantId`.
- Componentes chamam só `services/`. Na Fase 2 troca-se o miolo dos serviços por chamadas HTTP, sem mexer nas telas.

## 7. Decisões de UI
- **Lista:** `DataGrid` com colunas da RF-02 a partir de `md`; abaixo de `md`, lista de `Card` (um por paciente, mesmas informações) — o `DataGrid` não é utilizável em tela estreita. `PaymentChip` na coluna/cartão; status derivado dos lançamentos.
- **Perfil:** `Tabs` com `variant="scrollable"` (rolam no celular, fixas a partir de `md`), sincronizadas com a query string; formulários locais por aba, cada uma com seu Salvar.
- **Anamnese:** `Accordion` por seção; campos gerados do schema; filtro por `audience` conforme `kind`.
- **Datas:** `DatePicker` do MUI X; valores guardados em ISO.
- **Idade/menoridade:** `utils/age.ts` (`ageOf`, `isMinor`); menor de 18 exige `financialGuardian` ao salvar dados fiscais.
- **CPF:** `utils/cpf.ts` valida dígitos verificadores e mascara (`***.123.456-**` em listagens).
- **Dialogs:** `NewPatientDialog` com `fullScreen` abaixo de `sm` (via `useMediaQuery`), Dialog normal a partir daí. O mesmo vale para `SessionDialog`.
- **Arquivar (RF-11):** botão "Arquivar paciente" no `PatientHeader`, com Dialog de confirmação (explica que nada é apagado); arquivado mostra chip "Arquivado" e o botão vira "Desarquivar paciente" (sem confirmação). Lista: filtro "Situação" (Ativos · Arquivados · Todos), padrão Ativos; `filterPatients` recebe a situação. Só com o filtro "Arquivados" a linha (DataGrid, coluna extra "Ações") e o cartão ganham o botão "Desarquivar"; ele fica fora do link do cartão, para não abrir o perfil, e recarrega a lista. Arquivar não muda nenhum outro dado.
- **Sessões (RF-12, RF-14):** `SessoesTab` lista as sessões do paciente (mais recente primeiro) em `Paper` com linhas, como as prescrições; nova sessão sugere `visit.time` do paciente. `SessionDialog` (em `components/`, pois é compartilhado com o calendário) tem data, horário, status, cobrança (Particular/Convênio; o campo do convênio só existe no formulário quando Convênio, e é descartado ao salvar como Particular), evolução (multilinha) e a área de anexos. Salvar não toca em `payments`.
- **Calendário (RF-13):** rota própria com `AppLayout` ganhando navegação **Pacientes · Calendário** (links no topo; abaixo de `sm` segunda linha do `AppBar`). A altura da barra passa a ser uma variável CSS (`--app-bar-height`) definida no `AppLayout`; o cabeçalho fixo do perfil usa `top: var(--app-bar-height)` no lugar da constante `APP_BAR_HEIGHT`, que deixa de existir.
  - **Visões e URL:** `?visao=mes|semana|dia&data=yyyy-mm-dd` (padrão: mês, hoje; valor inválido cai no padrão). O seletor Mês/Semana/Dia é um `ToggleButtonGroup` exclusivo; anterior/próximo (`ChevronLeft`/`ChevronRight`) andam um mês, uma semana ou um dia; "Hoje" volta a hoje mantendo a visão. `utils/calendar.ts` ganha `weekOf`, `viewRange` (intervalo a buscar por visão), `shiftDate`, `rangeLabel` e os helpers das fatias de horário; o `?mes=` da versão anterior deixa de existir.
  - **Dados:** `listSessionsBetween` do intervalo da visão + `listPatients`; `toCalendarItems` continua filtrando arquivados e tenant.
  - **Mês:** a partir de `md`, `MonthGrid` (grade de 7 colunas de `buildMonthGrid`, dias vizinhos esmaecidos; cada sessão é um botão "HH:mm Nome"); abaixo de `md`, `AgendaList` (só dias com sessão, título por dia).
  - **Semana e Dia (`TimeGrid`):** tabela cujas linhas são fatias de 30 minutos e cujas colunas são os dias (7 na semana, 1 no dia). A faixa padrão é 07:00–21:00 e se estende para conter qualquer sessão exibida; a primeira linha é "Sem horário". O modelo não tem duração: a sessão ocupa a fatia do seu horário (arredondado para baixo aos 30 minutos; o texto mostra o horário exato) e sessões na mesma fatia ficam empilhadas na célula, sem algoritmo de sobreposição. A Semana só é grade a partir de `md`; abaixo de `md` usa `AgendaList` (dias da semana com sessão). O Dia é grade em todas as larguras.
  - **Ir ao dia:** o número do dia (Mês) e o título do dia (Semana e agenda) são botões que abrem a visão Dia daquela data.
  - **Prévia (`SessionPreview`):** clicar numa sessão abre um `Popover` ancorado no elemento clicado, em todas as visões, com paciente, dia e horário, `SessionStatusLabel` e cobrança (`billingLabel`), e o botão "Editar", que fecha a prévia e abre o `SessionDialog` de edição. Foco e Esc vêm do próprio `Popover` (Modal do MUI).
  - **Criar (`SessionDialog` em modo "escolher paciente"):** além do modo com paciente fixo (aba Sessões), o Dialog aceita `initialDate` e `initialTime` e, ao criar pelo calendário, mostra no topo um `Autocomplete` do MUI "Paciente", obrigatório. As opções são os pacientes ativos do tenant (`listPatients` sem `archivedAt`), filtrados por `filterPatients` (sem acento nem diferença de maiúsculas); sem opções mostra "Nenhum paciente ativo." e sem paciente escolhido não salva. Se o clique não trouxe horário, ao escolher o paciente o Dialog sugere o `visit.time` dele, só enquanto o usuário não digitou um horário. Pontos de entrada: célula vazia do `TimeGrid` (data e horário), dia vazio do `MonthGrid` (só a data) e o botão "Nova sessão" no topo (data de hoje; serve também para a agenda abaixo de `md`). As células vazias são alvos de clique e toque fora da ordem de tabulação; o botão "Nova sessão" é a via por teclado.
  - **Sem arrastar:** não há arrastar e soltar para reagendar (fora do escopo); reagendar é editar data e horário no Dialog. A aparência continua a do tema (bordas em vez de sombras, sem cor nova).
- **Anexos (RF-15):** `AttachmentsField` recebe o dono (`anamnese` + `patientId`, ou `sessao` + id da sessão) e mantém adições e remoções em memória; quem hospeda (Salvar da anamnese, Salvar do `SessionDialog`) aplica no `attachments.ts` depois de gravar o registro. Botão "Anexar arquivo" (`<input type="file" accept=".pdf,.docx">` oculto), lista com nome, tamanho (`utils/files.ts`) e data, "Baixar" e "Remover", e o aviso de armazenamento local (§12) como texto de ajuda.

## 8. Impressão
- `PrintSheet` renderiza o conteúdo via `createPortal` em `document.body`, **fora** do `#root`.
- Fluxo: usuário clica Imprimir → estado `printing` → `PrintSheet` monta → `window.print()` → no `afterprint` desmonta.
- Regras `@media print`: `#root { display: none }`, `.print-sheet { display: block }`, página A4 com margens, `page-break-before` entre seções do relatório.
- Prescrição e Relatório usam o mesmo `PrintSheet`; cabeçalho e assinatura vêm de `Tenant`.

## 9. Dados mockados
- 2 tenants: `claudionaria` (usuário `clau` / senha `123`) e `demo` (usuário `demo` / `123`), só para validar o isolamento (RF-10).
- Tenant `claudionaria`: ~8 pacientes fictícios (mistura de crianças e adultos), ao menos 3 com lançamento pendente, 1 anamnese preenchida, 1 prescrição.
- **Sessões:** o tenant `claudionaria` ganha sessões distribuídas por vários pacientes, com histórico e próximas (setembro de 2026, mês do mock), cobrindo os três status, ao menos uma sessão de convênio (nome fictício) e evoluções preenchidas; 1 paciente arquivado, para exercitar o filtro "Situação". O tenant `demo` ganha 1 ou 2 sessões, para validar o isolamento (RF-10). Sem anexos no seed (arquivos vêm do uso).
- Para exercitar o empilhamento do calendário, o seed ganha um horário compartilhado por dois pacientes no mesmo dia (só vale para bancos novos; a migração não reescreve dados existentes).
- CPFs fictícios, porém válidos no cálculo dos dígitos.

## 10. Testes (mínimo)
- Unitários (Vitest) para `cpf.ts`, `age.ts` e filtro de perguntas por público da anamnese.
- Também unitários, por serem regras de negócio dos novos RFs: `filterPatients` com a situação (arquivados), `utils/files.ts` (só `.pdf`/`.docx`, limite de 10 MB), `utils/calendar.ts` (`buildMonthGrid`, agrupamento por dia), as visões do calendário (`weekOf`, `viewRange`, `shiftDate`, fatias de horário e a faixa de horas do `TimeGrid`), a migração de `db.ts` (tabela ausente preenchida sem tocar nas existentes) e o service de anexos com `fake-indexeddb` (isolamento por tenant, adicionar, listar, baixar, remover).
- Verificação manual dos critérios de aceite da spec por tarefa.

## 11. Skill `frontend-design`
Já está disponível nesta sessão (é uma skill pública do Claude, não precisa instalar nada). Ela é carregada automaticamente sempre que eu for criar ou ajustar uma tela — não requer nenhuma ação sua aqui no chat.

Se depois vocês passarem a codar fora daqui (ex.: Claude Code local no VS Code, outro projeto), a mesma skill só existe nesse outro ambiente se ele também tiver acesso a ela; nesse caso, avise que eu explico como replicar.

## 12. Anexos em IndexedDB (decisão técnica)
O RF-15 exige guardar arquivos `.pdf` e `.docx`. O `localStorage` não serve: só guarda texto, teria de receber o arquivo em base64 (cerca de 33% maior) e tem cota de poucos MB, que um único PDF já consome e que também abriga o resto do mock.

**Decisão:** guardar os anexos em **IndexedDB**, que armazena `Blob` direto e tem cota muito maior. É um mock da Fase 1; a Fase 2 troca o miolo por upload/download HTTP, sem mexer nas telas (constitution, regra 4).

- **Banco:** `fono-files`, versão 1, um object store `attachments` (`keyPath: 'id'`) com o índice `byOwner` em `[tenantId, ownerType, ownerId]`. Cada registro é um `Attachment` (§5) com metadados **e** o `Blob` juntos, o que evita inconsistência entre dois armazenamentos.
- **API** (`services/attachments.ts`, assíncrona, com `tenantId` em todas as funções, como o resto de `services/`): `listAttachments(tenantId, owner)` (só metadados), `addAttachment(tenantId, owner, file)`, `getAttachmentBlob(tenantId, id)` e `removeAttachment(tenantId, id)`; `owner = { type: 'anamnese' | 'sessao', id }`. Leitura por id também confere o `tenantId` do registro.
- **Validação** (`utils/files.ts`): extensão `.pdf` ou `.docx` (e, quando o navegador informa o tipo, ele precisa ser compatível), no máximo 10 MB; mensagens em pt-BR. Validação na hora de escolher o arquivo, antes de guardar em memória.
- **Gravação em rascunho:** `AttachmentsField` guarda adições (objetos `File`) e remoções (ids) em memória. O Salvar do formulário grava primeiro o registro dono (sessão ou anamnese) e só então aplica os anexos; Cancelar descarta tudo. Consequência: sair da aba Anamnese sem salvar também descarta o rascunho de anexos (limitação já conhecida das abas).
- **Download:** `URL.createObjectURL(blob)` + `<a download>` com o nome original, revogando a URL em seguida. Sem pré-visualização no app.
- **Falhas:** IndexedDB indisponível (modo privado de alguns navegadores) ou cota cheia geram mensagem em pt-BR no formulário, e o botão de salvar nunca fica travado.
- **Limitações assumidas:** os arquivos ficam só neste navegador, sem criptografia nem sincronização; "limpar dados do site" apaga tudo. A interface avisa isso junto à área de anexos, e os dados de teste continuam fictícios (constitution: LGPD).
- **Fora de escopo:** anexos no relatório impresso (RF-09), pré-visualização, arquivos além de `.pdf`/`.docx`, anexos em outras telas.

## 13. Contexto inseguro (HTTP na rede local)
O app também é aberto por `http://<ip-da-rede>:5173` (celular na mesma rede), que **não** é contexto seguro; nele o navegador esconde APIs como `crypto.randomUUID`. Regras:
- Gerar ids só com `utils/id.ts` (`newId`), que usa `crypto.randomUUID` quando existe e `crypto.getRandomValues` como alternativa. Foi a causa da tela branca ao abrir "Nova prescrição" pelo IP da rede.
- Não usar APIs restritas a contexto seguro (`navigator.clipboard`, `crypto.subtle`, File System Access API).
- Funcionam em qualquer contexto e podem ser usados: `localStorage`, `sessionStorage`, IndexedDB e `URL.createObjectURL`.
