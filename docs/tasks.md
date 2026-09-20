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
- [ ] **T07** `services/patients.ts` e `payments.ts` (listar/criar/atualizar, sempre por `tenantId`). *(RF-10)*
- [ ] **T08** `PatientsPage`: DataGrid, busca, filtros e `PaymentChip`. *(RF-02)*
- [ ] **T09** `NewPatientDialog` com sugestão de tipo pela idade; salvar e abrir o perfil. *(RF-03)*

## M2 — Perfil
- [ ] **T10** `PatientProfile` + `PatientHeader` + `Tabs` ligadas à query `?aba=`. *(RF-04)*
- [ ] **T11** `DadosTab`: campos por tipo, CPF com máscara/validação, responsável financeiro para menores. *(RF-05)*
- [ ] **T12** `FinanceiroTab`: bloco Atendimento (valor, dias, horário). *(RF-08)*
- [ ] **T13** `FinanceiroTab`: tabela de lançamentos, novo lançamento, marcar pago/desfazer, resumo do ano; status refletido no cabeçalho e na lista. *(RF-08)*

## M3 — Anamnese
- [ ] **T14** `mocks/anamnese-schema.ts` a partir do Anexo A da spec, com teste do filtro por público. Os ids das perguntas devem ser os já usados em `mocks/seed.ts` (ex.: `queixa_motivo`, `gestacao_ictericia`), não o contrário: o schema se adapta ao seed. *(RF-06)*
- [ ] **T15** `services/anamnese.ts` e `AnamneseTab`: Accordion por seção, campos gerados do schema, seção Voz opcional, Salvar. *(RF-06)*

## M4 — Prescrições e impressão
- [ ] **T16** `PrintSheet` (portal, `afterprint`, estilos `@media print` A4). *(RF-07, RF-09)*
- [ ] **T17** `PrescricoesTab`: lista, criar/editar com exercícios dinâmicos, frequência. *(RF-07)*
- [ ] **T18** Impressão da prescrição no formato do exemplo, com assinatura do tenant. *(RF-07)*
- [ ] **T19** `RelatorioTab`: seleção de seções, pré-visualização e Imprimir. *(RF-09)*

## M5 — Fechamento
- [ ] **T20** Passada de acabamento visual (densidade, estados vazios, mensagens de erro em pt-BR).
- [ ] **T21** Verificação manual de todos os critérios de aceite da spec e do isolamento entre tenants. *(RF-10)*
- [ ] **T22** Verificação responsiva: lista (cartões em `xs/sm`, tabela a partir de `md`), abas roláveis, Dialog em tela cheia no celular, formulários sem overflow horizontal. *(RNF responsivo)*

## Fase 2 (fora deste documento)
Back-end e banco de dados; troca do miolo de `services/` por HTTP; autenticação real; emissão do recibo anual em PDF; agenda.

## Rastreabilidade
| RF | Tarefas |
|---|---|
| RF-01 | T05, T06 |
| RF-02 | T08 |
| RF-03 | T09 |
| RF-04 | T10 |
| RF-05 | T11 |
| RF-06 | T14, T15 |
| RF-07 | T16, T17, T18 |
| RF-08 | T12, T13 |
| RF-09 | T16, T19 |
| RF-10 | T04, T07, T21 |
| Responsivo (RNF) | T22 (aplicado ao longo de M1–M4) |
