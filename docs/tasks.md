# Tasks — Fase 1

Ordem de execução. Cada tarefa entrega o menor incremento utilizável e cita a spec (RF) que atende. Marque `[x]` ao concluir. Ao mexer em telas, usar a skill `frontend-design`.

## M0 — Base
- [x] **T01** Criar projeto Vite + React + TS (`strict`), instalar dependências do `plan.md` §1, configurar fontes.
- [x] **T02** `theme.ts` conforme `plan.md` §2, com `ThemeProvider` e `CssBaseline` em `main.tsx`. *(constitution)*
- [x] **T03** `types/domain.ts` e `utils/` (`cpf`, `age`, `format`) com testes unitários. *(plan §5, §7)*
- [x] **T04** `services/db.ts` + `mocks/seed.ts`: dois tenants, pacientes, lançamentos, 1 anamnese e 1 prescrição. *(RF-10)*

## M1 — Acesso e lista
- [x] **T05** Login mockado (`clau` / `123`), `SessionProvider`, `RequireAuth`, sair. *(RF-01)*
- [x] **T06** `AppLayout` (topo com nome da clínica e Sair) e rotas. *(RF-01)*
- [x] **T07** `services/patients.ts` e `payments.ts` (listar/criar/atualizar, sempre por `tenantId`). *(RF-10)*
- [x] **T08** `PatientsPage`: DataGrid, busca, filtros e `PaymentChip`. *(RF-02)*
- [x] **T09** `NewPatientDialog` com sugestão de tipo pela idade; salvar e abrir o perfil. *(RF-03)*

## M2 — Perfil
- [x] **T10** `PatientProfile` + `PatientHeader` + `Tabs` ligadas à query `?aba=`. *(RF-04)*
- [x] **T11** `DadosTab`: campos por tipo, CPF com máscara/validação, responsável financeiro para menores. *(RF-05)*
- [x] **T12** `FinanceiroTab`: bloco Atendimento (valor, dias, horário). *(RF-08)*
- [x] **T13** `FinanceiroTab`: tabela de lançamentos, novo lançamento, marcar pago/desfazer, resumo do ano; status refletido no cabeçalho e na lista. *(RF-08)*

## M3 — Anamnese
- [x] **T14** `mocks/anamnese-schema.ts` a partir do Anexo A da spec, com teste do filtro por público. Os ids das perguntas devem ser os já usados em `mocks/seed.ts` (ex.: `queixa_motivo`, `gestacao_ictericia`), não o contrário: o schema se adapta ao seed. *(RF-06)*
- [x] **T15** `services/anamnese.ts` e `AnamneseTab`: Accordion por seção, campos gerados do schema, seção Voz opcional, Salvar. *(RF-06)*

## M4 — Prescrições e impressão
- [x] **T16** `PrintSheet` (portal, `afterprint`, estilos `@media print` A4). *(RF-07, RF-09)*
- [x] **T17** `PrescricoesTab`: lista, criar/editar com exercícios dinâmicos, frequência. *(RF-07)*
- [x] **T18** Impressão da prescrição no formato do exemplo, com assinatura do tenant. *(RF-07)*
- [x] **T19** `RelatorioTab`: seleção de seções, pré-visualização e Imprimir. *(RF-09)*

## M5 — Fechamento
- [x] **T20** Passada de acabamento visual (densidade, estados vazios, mensagens de erro em pt-BR).
- [x] **T21** Verificação manual de todos os critérios de aceite da spec e do isolamento entre tenants. *(RF-10)*
- [x] **T22** Verificação responsiva: lista (cartões em `xs/sm`, tabela a partir de `md`), abas roláveis, Dialog em tela cheia no celular, formulários sem overflow horizontal. *(RNF responsivo)*

## Expansão da Fase 1 (RF-11 a RF-15)
Arquivar paciente, sessões com evolução e cobrança, calendário e anexos. Tudo continua front com mocks. Decisões já tomadas: sessões separadas dos lançamentos mensais (T12/T13 não mudam; revista no M11) e calendário como tela própria, não aba do paciente. Os ids novos usam `newId` (`plan.md` §13).

## M6 — Arquivar e sessões
- [x] **T23** Modelo e dados: `Session` e `Patient.archivedAt` em `types/domain.ts`; tabela `sessions` em `db.ts` com a migração (tabelas ausentes preenchidas pelo seed, sem tocar nas existentes) e teste dela; `services/sessions.ts`; sessões e 1 paciente arquivado no `seed.ts`. *(RF-10, RF-11, RF-12; plan §5, §6, §9)*
- [x] **T24** Arquivar: `archivePatient`/`unarchivePatient`; botão "Arquivar paciente" com confirmação e "Desarquivar paciente" no perfil; chip "Arquivado" no cabeçalho e na lista; filtro "Situação" (padrão Ativos) e `filterPatients` com teste; com o filtro "Arquivados", botão "Desarquivar" direto em cada linha e cartão da lista. *(RF-11, RF-02, RF-04)*
- [x] **T25** `SessionDialog` compartilhado: data, horário, status, cobrança Particular/Convênio (nome obrigatório), evolução, validações; `fullScreen` abaixo de `sm`. *(RF-12, RF-14)*
- [x] **T26** `SessoesTab` e aba "Sessões" entre Anamnese e Prescrições: lista da mais recente para a mais antiga, nova sessão, editar, cobrança e resumo da evolução na linha, estado vazio. *(RF-12, RF-14, RF-04)*

## M7 — Calendário
- [x] **T27** `AppLayout`: navegação Pacientes · Calendário e `--app-bar-height` no lugar de `APP_BAR_HEIGHT`. *(RF-13; plan §7)*
- [x] **T28** `CalendarPage` em `/calendario` (`?mes=`): navegação de mês e "Hoje", agenda por dia, clique abre o `SessionDialog`, oculta sessões de arquivados; `utils/calendar.ts` com teste. *(RF-13)*
- [x] **T29** `MonthGrid`: grade mensal a partir de `md`; abaixo de `md` continua a agenda. *(RF-13)*

## M8 — Anexos
- [x] **T30** `services/attachments.ts` (IndexedDB) e `utils/files.ts` (`.pdf`/`.docx`, 10 MB), com testes usando `fake-indexeddb` (inclui isolamento por tenant). *(RF-15, RF-10; plan §12)*
- [x] **T31** `AttachmentsField` (rascunho em memória, baixar, remover, aviso de armazenamento local) integrado à `AnamneseTab`. *(RF-15, RF-06)*
- [x] **T32** Anexos na evolução do `SessionDialog`: Salvar aplica, Cancelar descarta. *(RF-15, RF-12)*

## M9 — Fechamento da expansão
- [x] **T33** Acabamento: estados vazios, mensagens de erro em pt-BR e falha de gravação (`localStorage`/IndexedDB) sem travar botão nos formulários novos; atualizar `docs/known-issues.md`.
- [x] **T34** Verificação dos critérios de aceite de RF-11 a RF-15, do isolamento de sessões e anexos entre tenants (RF-10) e regressão de RF-01 a RF-09.
- [x] **T35** Verificação responsiva das telas novas (Sessões, Calendário em grade e em agenda, Dialogs, filtro de arquivados, anexos) em 360/390/1280 e nos limites `sm`/`md`. *(RNF responsivo)*

## M10 — Calendário estilo Google (comportamento)
Revisão do RF-13: substitui a decisão "o calendário só mostra e edita". Agora ele também cria sessões, tem visões Mês/Semana/Dia e uma prévia ao clicar. Só o comportamento muda; cores, fontes, bordas e ícones seguem o tema. Arrastar para reagendar fica fora do escopo.
- [x] **T36** `utils/calendar.ts` para as visões (`weekOf`, `viewRange`, `shiftDate`, `rangeLabel`, fatias de 30 minutos e faixa de horas) com testes; `CalendarPage` com seletor Mês/Semana/Dia, `?visao=&data=`, anterior/próximo/"Hoje" por visão; Mês e Semana abaixo de `md` como agenda; número e título do dia levam à visão Dia. *(RF-13; plan §4, §7)*
- [x] **T37** `TimeGrid`: grade de horários (Semana a partir de `md`, Dia em todas as larguras), linha "Sem horário", sessões empilhadas por fatia, hoje destacado; seed com dois pacientes no mesmo horário. *(RF-13)*
- [x] **T38** `SessionPreview` (Popover) em todas as visões, com paciente, dia/horário, status, cobrança e "Editar" que abre o `SessionDialog`; Esc ou clicar fora fecha. *(RF-13)*
- [x] **T39** `SessionDialog` com escolha de paciente (`Autocomplete`, só ativos do tenant, sem acento, obrigatório) e `initialDate`/`initialTime`; sugestão do horário do paciente; teste da lista de opções. *(RF-13, RF-11, RF-12)*
- [x] **T40** Criar no calendário: clique em horário vazio (`TimeGrid`), em dia vazio (Mês) e botão "Nova sessão" no topo; a sessão aparece no calendário e na aba Sessões. *(RF-13)*
- [x] **T41** Verificação dos critérios de aceite revisados do RF-13, do isolamento (calendário e busca de paciente entre tenants, arquivados fora da busca) e regressão de RF-11, RF-12, RF-14 e RF-15. *(RF-10, RF-13)*
- [x] **T42** Verificação responsiva das visões novas (Semana, Dia, prévia, criação e agenda) em 360/390/1280 e nos limites `sm`/`md`; registrar em `docs/known-issues.md` qualquer limitação nova. *(RNF responsivo)*

## M11 — Sessões alimentam o Financeiro
Revisão do RF-08 e do RF-12: substitui a decisão "sessões separadas dos lançamentos mensais". A sessão ganha valor; os lançamentos passam a ser automáticos (sessão Realizada soma na competência), sem "Novo lançamento" e sem o bloco "Atendimento", e `Patient.visit` deixa de existir. T12 e T13 ficam superadas nesses pontos (o que sobrevive delas: marcar como pago, desfazer e resumo do ano).
- [x] **T43** Modelo e dados: `Session.value` e `Session.counted` em `types/domain.ts`; migração em `db.ts` (a `value` das sessões antigas vem do `visit.fee` do paciente, idempotente, sem tocar em lançamentos) com teste; `seed.ts` com `value` nas sessões e lançamentos de setembro/2026 derivados das sessões Realizadas. O `Patient.visit` ainda existe até o T47, para o projeto continuar compilando. *(RF-08, RF-12, RF-10; plan §5, §6, §9)*
- [x] **T44** `services/billing.ts` (`applySessionBilling`, `suggestedValue`) com testes de todos os casos do plan §6, integrado a `createSession`/`saveSession` com gravação única de sessão e lançamentos. *(RF-08; plan §6, §10)*
- [x] **T45** `SessionDialog`: campo Valor (`MoneyField`, obrigatório e maior que zero) com a sugestão da sessão mais recente do paciente (também ao escolher o paciente no calendário); sem sugestão de horário; valor na lista da aba Sessões e na prévia do calendário; a aba Sessões recarrega os lançamentos do perfil para o chip de pagamento. *(RF-12, RF-13; plan §7)*
- [x] **T46** `FinanceiroTab`: remover o bloco Atendimento, o "Novo lançamento" e o `NewPaymentDialog`; nº de sessões só leitura; ação "Editar valor" (`EditPaymentDialog`); marcar como pago, desfazer e resumo do ano continuam; estado vazio explicando os lançamentos automáticos. *(RF-08; plan §7)*
- [x] **T47** Retirar `Patient.visit` por completo: tipo, `createPatient`, `seed.ts` e a migração (que passa a remover o campo dos dados já salvos, com teste); colunas "Dias de atendimento" e "Valor da consulta" da lista (tabela e cartões), `PatientRow`, cabeçalho do perfil, linhas de atendimento do `ReportDocument`, `formatWeekdays` e testes afetados. *(RF-02, RF-04, RF-09; plan §5, §6, §7)*
- [ ] **T48** Verificação dos critérios de aceite revisados de RF-08 e RF-12 (e o ajuste de RF-14), isolamento entre tenants dos lançamentos automáticos (RF-10) e regressão de RF-01 a RF-15, atualizando os scripts que usavam "Atendimento" e "Novo lançamento"; registrar em `docs/known-issues.md` as limitações do Pago, da troca de mês e das sessões migradas. *(RF-08, RF-10, RF-12)*
- [ ] **T49** Verificação responsiva das telas alteradas (Financeiro sem o bloco e com "Editar valor", Dialog da sessão com Valor, lista e cabeçalho sem as colunas de atendimento) em 360/390/1280 e nos limites `sm`/`md`. *(RNF responsivo)*

## Fase 2 (fora deste documento)
Back-end e banco de dados; troca do miolo de `services/` por HTTP (inclui anexos em armazenamento de objetos); autenticação real; emissão do recibo anual em PDF; agenda avançada (recorrência, conflito de horários, arrastar para reagendar, duração da sessão).

## Rastreabilidade
| RF | Tarefas |
|---|---|
| RF-01 | T05, T06 |
| RF-02 | T08, T24, T47 |
| RF-03 | T09 |
| RF-04 | T10, T24, T26, T47 |
| RF-05 | T11 |
| RF-06 | T14, T15, T31 |
| RF-07 | T16, T17, T18 |
| RF-08 | T12, T13, T43, T44, T46, T48 |
| RF-09 | T16, T19, T47 |
| RF-10 | T04, T07, T21, T23, T30, T34, T41, T43, T48 |
| RF-11 | T23, T24, T39 |
| RF-12 | T23, T25, T26, T32, T39, T43, T45, T48 |
| RF-13 | T27, T28, T29, T36, T37, T38, T39, T40, T41, T45 |
| RF-14 | T25, T26 |
| RF-15 | T30, T31, T32 |
| Responsivo (RNF) | T22 (aplicado ao longo de M1–M4), T35 (telas novas), T42 (visões novas do calendário), T49 (telas alteradas pelo M11) |
