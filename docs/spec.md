# Spec — Sistema da Clínica de Fonoaudiologia (Fase 1: front com mocks)

## 1. Visão
Sistema web para a fonoaudióloga cadastrar pacientes, registrar anamnese e prescrições, acompanhar sessões e sua evolução, controlar pagamentos (lançamentos gerados a partir das sessões realizadas) e imprimir relatórios. Multi-tenant (cada clínica/profissional é um tenant). Fase 1 usa dados mockados; o back-end vem depois.

**Usuário da Fase 1:** Claudionaria Torres, fonoaudióloga, CRFa 4-12096 (tenant `claudionaria`).

## 2. Escopo
**Dentro (Fase 1):** login mockado, lista e cadastro de pacientes, perfil com abas, anamnese (criança/adulto), prescrições, financeiro, relatório imprimível, dados fiscais para recibos anuais, arquivamento de pacientes, sessões com valor, evolução e tipo de cobrança, lançamentos financeiros automáticos a partir das sessões realizadas, calendário de sessões (visões mês, semana e dia, com criação e edição de sessões), anexos (docx/pdf) na anamnese e na evolução de sessão, e a tela Material auxiliar (material da profissional e documentos anexados pelo profissional).

**Fora (por enquanto):** back-end, autenticação real, agenda avançada (recorrência, conflito de horários, arrastar para reagendar, duração da sessão), emissão do recibo em PDF (só guardamos os dados), múltiplos usuários por tenant, anexos em outras telas ou em outros formatos, excluir paciente ou sessão (existem arquivar e cancelar).

## 3. Requisitos funcionais

### RF-01 Login
- Tela com usuário e senha. Mock: usuário `clau`, senha `123`.
- Credencial inválida mostra erro no formulário. Sucesso vai para `/pacientes`.
- Rotas internas exigem sessão; sem sessão redireciona para `/login`. Botão "Sair" no topo.
- A sessão carrega o `tenantId`; todo acesso a dados usa esse tenant.

**Aceite**
- [ ] `clau` / `123` entra; qualquer outra combinação não.
- [ ] Acessar `/pacientes` sem sessão redireciona para `/login`.

### RF-02 Lista de pacientes
- Tabela (DataGrid) com: Nome, Tipo (Criança/Adulto), Idade, Pagamento (chip: Em dia / Pendente), Telefone.
- Busca por nome, filtro por tipo e por pagamento pendente. Ordenação por coluna.
- Filtro "Situação" (Ativos · Arquivados · Todos), com **Ativos** como padrão: pacientes arquivados (RF-11) ficam escondidos e ganham o chip "Arquivado" quando exibidos.
- Clique na linha abre o perfil. Botão "Novo paciente".
- Pagamento "Pendente" usa a cor de alerta.
- **Desktop (a partir de `md`):** acima da lista, uma faixa de resumo com três indicadores: **Pacientes ativos** (e quantos estão cadastrados), **Pagamento pendente** (pacientes ativos com lançamento pendente; é clicável e liga/desliga o filtro "Pagamento pendente") e **Sessões nesta semana** (domingo a sábado, agendadas e realizadas, de pacientes ativos). A lista traz o nome com um avatar de iniciais, o tipo como etiqueta, linhas mais altas e o cabeçalho da tabela em destaque; a busca e os filtros ficam num painel. Abaixo de `md` continuam os cartões, sem a faixa.

**Aceite**
- [ ] Filtrar "pendentes" mostra só pacientes com algum lançamento pendente.
- [ ] Busca por nome funciona sem diferenciar maiúsculas/acentos.
- [ ] Por padrão a lista não mostra pacientes arquivados.
- [ ] No desktop, a faixa mostra os números certos (ativos de cadastrados, pendentes, sessões da semana); clicar em "Pagamento pendente" filtra a lista e clicar de novo desfaz.

### RF-03 Cadastro de paciente
- "Novo paciente" abre um Dialog com o mínimo: nome completo, data de nascimento, tipo, telefone.
- Tipo é sugerido pela idade (menor de 18 → Criança) e pode ser alterado.
- Ao salvar, cria o paciente e abre o perfil na aba Dados.

**Aceite**
- [ ] Não salva sem nome e data de nascimento.
- [ ] Após salvar, o paciente aparece na lista e o perfil abre.

### RF-04 Perfil do paciente
- Cabeçalho fixo: nome, tipo, idade, chip de pagamento.
- Abas: **Dados · Anamnese · Sessões · Prescrições · Financeiro · Relatório**.
- Paciente arquivado mostra o chip "Arquivado" no cabeçalho e o botão "Desarquivar" (RF-11).

### RF-05 Aba Dados
Campos (a identificação da anamnese vive aqui, sem duplicar):
- Nome completo, data de nascimento (idade calculada), sexo/gênero, cidade, endereço, telefone, e-mail.
- Quem encaminhou (pediatra, escola, neurologista, outro).
- **Criança:** escolaridade (série), escola, responsável(is) (nome, parentesco, telefone).
- **Adulto:** escolaridade, profissão/ocupação.
- **Dados fiscais (recibos):** CPF do paciente. Se menor de idade: nome e CPF do responsável financeiro (obrigatórios).
- Botão Salvar; edição inline dentro da aba.

**Aceite**
- [ ] CPF é validado (dígitos verificadores) e exibido com máscara.
- [ ] Menor de idade sem responsável financeiro não salva os dados fiscais.
- [ ] Campos de criança e de adulto aparecem conforme o tipo.

### RF-06 Aba Anamnese
- Uma anamnese por paciente, organizada em seções (Accordion) conforme o Anexo A.
- Perguntas marcadas `[C]` só aparecem para Criança, `[A]` só para Adulto; sem marca, para ambos. Seções sem nenhuma pergunta aplicável ficam ocultas.
- A seção "Voz" é opcional (interruptor "Aplicável"); vem ligada para Adulto e desligada para Criança.
- Um botão Salvar grava tudo; mostra "última atualização".
- Perguntas são definidas por um schema (dados, não JSX), para permitir customização por tenant no futuro.
- A aba também tem a área "Anexos da anamnese" (docx/pdf), descrita no RF-15.

**Aceite**
- [ ] Trocar o tipo do paciente muda as perguntas exibidas sem perder respostas já salvas.
- [ ] Respostas persistem ao recarregar a página.

### RF-07 Aba Prescrições
- Lista de prescrições do paciente (data + resumo), da mais recente para a mais antiga.
- Criar/editar prescrição: data, exercícios (lista com título e descrição, adicionar/remover/reordenar), frequência (texto livre).
- Botão Imprimir por prescrição, no formato:

```
PRESCRIÇÃO FONOTERAPÊUTICA
Paciente: <nome>

Exercícios
1. <título>
   <descrição>
2. ...

Frequência
<texto>

<Nome da profissional>
Fonoaudióloga | CRFa <registro>
```
- Nome e registro da profissional vêm do tenant.

**Aceite**
- [ ] A impressão mostra só a prescrição (sem menus, abas ou botões).
- [ ] Exercícios saem numerados na ordem definida.

### RF-08 Aba Financeiro
Os lançamentos são **automáticos**, gerados pelas sessões (RF-12). Não há bloco "Atendimento" nem botão "Novo lançamento": valor, data e horário de cada atendimento pertencem à sessão.
- Tabela de lançamentos: competência (mês/ano), nº de sessões (calculado, não editável), valor, status (Pago/Pendente), data do pagamento, forma (Pix, Dinheiro, Cartão, Outro).
- **Criação e soma:** quando uma sessão passa para **Realizada** (ou é criada já Realizada), o valor dela entra na competência do paciente, que é o mês/ano da data da sessão:
  - se existe um lançamento **Pendente** daquela competência, soma 1 sessão e o valor da sessão nele;
  - se não existe (nenhum lançamento, ou o único da competência já está **Pago**), cria um novo lançamento **Pendente**, com 1 sessão e o valor da sessão. O lançamento Pago não é tocado.
- **Ajuste automático, só enquanto Pendente:** se uma sessão Realizada que já entrou num lançamento for cancelada, voltar para Agendada ou tiver o valor editado, o lançamento é ajustado (menos 1 sessão e o valor dela, ou a diferença do valor). O lançamento que ficar com 0 sessões é removido. Se o lançamento já estiver **Pago**, nada é alterado (limitação conhecida).
- **Continua possível:** editar o valor de um lançamento na mão (ação "Editar valor"; não muda o nº de sessões), marcar como pago (pede data e forma) e desfazer.
- Resumo: total pendente e total pago no ano selecionado.
- Não é possível criar lançamento na mão. Sem lançamentos no ano, a tela explica que eles surgem quando uma sessão é marcada como Realizada.

**Aceite**
- [ ] Pendente aparece com a cor de alerta.
- [ ] O chip do cabeçalho e da lista fica "Pendente" se existir ao menos um lançamento pendente.
- [ ] O total pago do ano bate com a soma dos lançamentos pagos.
- [ ] Não existem o bloco "Atendimento" nem o botão "Novo lançamento".
- [ ] Sessão que vira Realizada, sem lançamento Pendente na competência, cria um lançamento Pendente com 1 sessão e o valor da sessão; a competência é o mês da data da sessão.
- [ ] Uma segunda sessão Realizada na mesma competência soma sessões e valor no Pendente existente, sem criar outro.
- [ ] Se o único lançamento da competência está Pago, uma nova sessão Realizada cria um lançamento Pendente separado e o Pago continua igual (valor, sessões, data e forma).
- [ ] Cancelar uma sessão Realizada contada, voltá-la para Agendada ou editar o valor dela ajusta o lançamento Pendente (e o remove se ficar sem sessões); se ele estiver Pago, nada muda.
- [ ] Criar, editar, cancelar ou reagendar sessão que não é (nem foi) Realizada não cria nem altera lançamento.
- [ ] Editar o valor de um lançamento na mão persiste e não muda o nº de sessões; marcar como pago e desfazer continuam funcionando.
- [ ] Lançamentos automáticos gravam o `tenantId` do paciente e não aparecem para outro tenant (RF-10).

### RF-09 Aba Relatório
- Escolha do que incluir: Dados, Anamnese, Prescrições, Financeiro (checkboxes).
- Pré-visualização em página e botão "Imprimir".
- Cabeçalho do relatório: nome da clínica/profissional, registro, data de emissão.
- Impressão sem elementos de navegação; quebra de página entre seções.
- Sessões, evoluções e anexos não entram no relatório nesta fase.

**Aceite**
- [ ] Só as seções marcadas saem no relatório.
- [ ] Layout de impressão legível em A4.

### RF-10 Multi-tenant
- Todo registro tem `tenantId` (inclusive sessões e anexos). O serviço de dados filtra sempre pelo tenant da sessão.
- Nome da clínica, profissional e registro profissional vêm de `Tenant` (não fixos em telas).

**Aceite**
- [ ] Com dois tenants no mock, cada login vê apenas os próprios pacientes.
- [ ] Sessões e anexos do tenant `claudionaria` não aparecem para o `demo` (calendário, aba Sessões e download), e vice-versa.

### RF-11 Arquivar paciente
- Arquivar **não exclui**: o paciente fica marcado como arquivado e nenhum dado (dados, anamnese, sessões, prescrições, financeiro, anexos) é apagado.
- No perfil, botão "Arquivar paciente" (pede confirmação). Paciente arquivado mostra o chip "Arquivado" e, no lugar do botão, "Desarquivar paciente" (sem confirmação).
- A lista de pacientes esconde arquivados por padrão; o filtro "Situação" (RF-02) mostra só arquivados ou todos.
- Com o filtro "Arquivados" ativo, cada linha da tabela e cada cartão da lista tem o botão "Desarquivar" (sem confirmação), sem precisar abrir o perfil.
- O perfil de um arquivado continua acessível e editável.
- Sessões de pacientes arquivados não aparecem no calendário (RF-13); continuam na aba Sessões do paciente. Arquivados também não aparecem na busca de paciente ao criar sessão pelo calendário.

**Aceite**
- [ ] Arquivar tira o paciente da lista padrão sem apagar nada (dados, sessões, financeiro e anexos seguem no perfil).
- [ ] Cancelar a confirmação não altera o paciente.
- [ ] Filtro "Arquivados" lista só arquivados; "Todos" lista ativos e arquivados, com o chip "Arquivado".
- [ ] Desarquivar devolve o paciente à lista padrão, ao calendário e à busca de paciente para nova sessão.
- [ ] Com o filtro "Arquivados", o botão "Desarquivar" da linha ou do cartão tira o paciente da lista de arquivados sem abrir o perfil.

### RF-12 Aba Sessões (evolução)
- Aba "Sessões" no perfil, entre Anamnese e Prescrições: histórico das sessões do paciente, da mais recente para a mais antiga (data, horário, status, cobrança, valor e resumo da evolução), com "Nova sessão" e "Editar".
- Sessão: data (obrigatória), horário (opcional), **valor** (obrigatório, maior que zero), status (**Agendada** padrão · Realizada · Cancelada), cobrança (RF-14), **evolução** (texto livre com o que aconteceu na sessão, opcional) e anexos (RF-15).
- **Valor sugerido:** ao criar uma sessão, o campo vem preenchido com o valor da sessão mais recente do paciente (qualquer status; a primeira da lista, por data e horário). Sem histórico, começa vazio. É sempre editável. No calendário, a sugestão aparece ao escolher o paciente e só enquanto o valor não foi digitado.
- Sessões não são excluídas; a que não acontece fica "Cancelada".
- Sessões alimentam os lançamentos financeiros (RF-08): só o status **Realizada** gera ou ajusta lançamento; criar ou editar sessão Agendada ou Cancelada não mexe no financeiro.
- O formulário (Dialog) de criação e edição é o mesmo usado no calendário (RF-13); no calendário ele ganha, no topo, o campo de escolha do paciente.

**Aceite**
- [ ] A lista mostra as sessões da mais recente para a mais antiga.
- [ ] Não salva sem data.
- [ ] A evolução salva persiste ao recarregar e aparece resumida na lista.
- [ ] Não salva sem valor (vazio ou zero).
- [ ] Nova sessão sugere o valor da sessão mais recente do paciente; sem histórico, o campo começa vazio; o valor sugerido pode ser trocado.
- [ ] Criar ou editar sessão Agendada ou Cancelada não muda nenhum lançamento nem o chip de pagamento; a Realizada segue o RF-08.

### RF-13 Calendário
Comportamento inspirado no Google Calendar (visões, prévia e criar no horário); a aparência segue o tema do projeto (constitution).

- Tela própria em `/calendario` (rota protegida), com link "Calendário" ao lado de "Pacientes" no topo. Não é aba de paciente.
- Mostra as sessões de todos os pacientes ativos do tenant.
- **Seletor de visão** Mês · Semana · Dia (padrão: Mês), com anterior / próximo (avançam um mês, uma semana ou um dia) e "Hoje". A visão e a data ficam na URL (`?visao=` e `?data=`), então recarregar a página mantém o que estava na tela.
- **Mês:** a partir de `md`, grade mensal (domingo a sábado), com hora e nome do paciente em cada dia; abaixo de `md`, agenda (lista agrupada por dia, só dias com sessão).
- **Semana:** a partir de `md`, grade de 7 dias (domingo a sábado) com linhas de horário de 30 em 30 minutos; abaixo de `md`, agenda da semana.
- **Dia:** grade de horários de um único dia, em todas as larguras.
- Na grade de horários, cada sessão aparece na linha do seu horário; sessões sem horário ficam numa linha "Sem horário" no topo; sessões no mesmo horário aparecem todas, empilhadas. Sessão não tem duração: ocupa uma linha de 30 minutos.
- Clicar no número do dia (Mês) ou no título do dia (Semana e agenda) abre a visão Dia daquela data.
- Realizada aparece com ícone de check; Cancelada, riscada. Período sem sessões mostra mensagem.
- **Prévia:** clicar numa sessão abre uma prévia rápida (popover) com paciente, dia e horário, status e cobrança, e o botão "Editar", que abre o mesmo Dialog de edição da aba Sessões (RF-12). Esc ou clicar fora fecha a prévia sem abrir nada. Ao salvar a edição, o calendário atualiza.
- **Criar sessão no calendário:** clicar num horário vazio (Semana e Dia) abre o Dialog de nova sessão com data e horário preenchidos; clicar num dia vazio do Mês abre com a data (sem horário); o botão "Nova sessão" no topo abre com a data de hoje. Nos três casos o Dialog tem, no topo, o campo "Paciente" (busca pelo nome, sem diferenciar maiúsculas/acentos; só pacientes ativos do tenant), obrigatório. O restante do Dialog é o dos RF-12, RF-14 e RF-15.
- Não arrasta sessões para reagendar (fora do escopo); reagendar é editar a data e o horário no Dialog.

**Aceite**
- [ ] Mostra só sessões do tenant logado e só de pacientes ativos, em todas as visões.
- [ ] O seletor troca entre Mês, Semana e Dia; anterior/próximo andam um mês, uma semana ou um dia; "Hoje" volta a hoje; recarregar a página mantém visão e data.
- [ ] Semana e Dia mostram cada sessão no dia e na linha de horário certos; sessão sem horário aparece em "Sem horário"; duas sessões no mesmo horário aparecem ambas.
- [ ] Clicar numa sessão abre a prévia com paciente, dia/horário, status e cobrança; "Editar" abre o mesmo formulário da aba Sessões; Esc fecha a prévia sem alterar nada.
- [ ] Clicar num horário vazio abre "Nova sessão" com data e horário preenchidos e o campo Paciente no topo; salvar cria a sessão, que aparece no calendário e na aba Sessões do paciente.
- [ ] Clicar num dia vazio (Mês) e o botão "Nova sessão" também abrem o formulário de criação.
- [ ] A busca de paciente ignora maiúsculas/acentos e lista só pacientes ativos do tenant (arquivados e de outro tenant não aparecem); sem paciente escolhido não salva.
- [ ] Abaixo de `md`, Mês e Semana viram agenda; Dia continua em grade de horários; sem overflow horizontal em nenhuma visão.

### RF-14 Tipo de cobrança da sessão
- Cada sessão tem "Cobrança": **Particular** (padrão) ou **Convênio**.
- Convênio mostra o campo de texto "Nome do convênio", obrigatório. Particular não guarda nome de convênio.
- A cobrança aparece na lista de sessões ("Particular" ou "Convênio: <nome>") e no Dialog.
- O tipo de cobrança não muda o financeiro: a sessão de convênio Realizada soma o valor dela no lançamento como a particular (RF-08).

**Aceite**
- [ ] O padrão é Particular e o campo do convênio só aparece quando Convênio está selecionado.
- [ ] Convênio sem nome não salva.
- [ ] Trocar de Convênio para Particular e salvar remove o nome do convênio.

### RF-15 Anexos (docx e pdf)
- Pode-se anexar arquivos em três lugares: **anamnese** (área "Anexos da anamnese" na aba), **evolução de sessão** (no Dialog da sessão) e **Material auxiliar** (RF-16).
- Só `.pdf` e `.docx`, até 10 MB por arquivo; outros formatos e arquivos maiores são recusados com mensagem em pt-BR.
- Cada anexo lista nome, tamanho e data, com "Baixar" (devolve o arquivo original) e "Remover".
- Os anexos são gravados junto com o Salvar do formulário; Cancelar descarta as adições e remoções.
- Os arquivos ficam em IndexedDB no navegador (mock da Fase 1, `plan.md` §12), filtrados por tenant. A interface avisa que na Fase 1 os arquivos ficam só neste navegador, sem criptografia.
- Arquivar paciente não apaga anexos.

**Aceite**
- [ ] Anexar PDF e DOCX na anamnese e numa sessão; continuam lá após recarregar.
- [ ] `.txt`, `.png`, `.doc` e arquivos acima de 10 MB são recusados com mensagem.
- [ ] Baixar devolve um arquivo idêntico ao anexado (nome e conteúdo).
- [ ] Remover e salvar apaga o anexo; Cancelar descarta adições e remoções.
- [ ] O aviso sobre armazenamento local é exibido junto à área de anexos.

### RF-16 Material auxiliar
- Tela própria em `/material` (rota protegida), com o link "Material auxiliar" no topo, ao lado de "Pacientes" e "Calendário". Não é aba de paciente: o material é da clínica.
- **Material da profissional:** o que já vem com o sistema. Hoje é um só, o PDF `treino-de-fala.pdf` (arquivo na raiz do repositório), com "Abrir" (nova aba do navegador) e "Baixar". Não é removido nem trocado pela tela.
- **Documentos anexados:** o profissional anexa documentos da clínica (mesma área e mesmas regras do RF-15: só `.pdf` e `.docx`, até 10 MB, nome, tamanho e data, "Baixar" e "Remover", aviso de armazenamento local). Os anexos são gravados com o "Salvar material"; sair da tela sem salvar descarta as adições e remoções.
- Cada tenant vê só o próprio material anexado; o material da profissional embutido é o mesmo para todos.

**Aceite**
- [ ] O link "Material auxiliar" aparece no topo ao lado de "Pacientes" e "Calendário"; o perfil do paciente não tem aba de material.
- [ ] A tela mostra `treino-de-fala.pdf` em "Material da profissional", em qualquer tenant.
- [ ] "Baixar" devolve um arquivo idêntico ao `treino-de-fala.pdf` da raiz do repositório; "Abrir" mostra o PDF numa nova aba.
- [ ] Anexar PDF e DOCX e salvar: continuam lá após recarregar.
- [ ] `.txt`, `.png`, `.doc` e arquivos acima de 10 MB são recusados com mensagem em pt-BR.
- [ ] Remover e salvar apaga o anexo; sair sem salvar descarta.
- [ ] O material da profissional não tem "Remover"; os anexos de um tenant não aparecem em outro.
- [ ] Sem overflow horizontal em nenhuma largura; o link cabe na barra do celular.

## 4. Requisitos não funcionais
- **Idioma/formatos:** pt-BR, datas `dd/mm/aaaa`, moeda BRL.
- **Persistência do mock:** `localStorage`, para os dados sobreviverem ao recarregar; anexos em IndexedDB, porque `localStorage` não guarda arquivo binário de forma confiável (`plan.md` §12).
- **Privacidade:** dados fictícios nos mocks; CPF mascarado em listagens e no cabeçalho. Anexos ficam só no navegador, sem criptografia; não anexar documentos reais durante a Fase 1.
- **Responsivo, mobile first:** layout desenhado para celular primeiro e adaptado para cima (tablet, desktop). Em telas estreitas, a tabela de pacientes vira lista de cartões, no calendário, mês e semana viram agenda por dia (o dia continua em grade de horários), as abas do perfil ficam roláveis, e formulários e os Dialogs de cadastro e de sessão ocupam a largura da tela. Navegação por teclado nos formulários.
- **Impressão:** estilos `@media print` dedicados (independem do layout responsivo, seguem o formato A4 fixo).

## 5. Suposições a confirmar
1. Cobrança é por lançamento mensal (competência), gerado a partir das sessões Realizadas, e não por sessão avulsa.
2. O relatório do paciente reúne Dados, Anamnese, Prescrições e Financeiro à escolha.
3. "Criança" é o paciente menor de 18 anos (adolescentes incluídos), editável manualmente.
4. Prescrições ganham aba própria (além das quatro citadas), pois têm histórico e impressão próprios.
5. Sessão tem três status (Agendada, Realizada, Cancelada) e não é excluída, só cancelada.
6. Arquivar esconde o paciente da lista padrão e do calendário; nada é apagado e o perfil segue editável.
7. Anexos aceitam só `.pdf` e `.docx` (não o `.doc` antigo), até 10 MB cada.
8. O nº de sessões do lançamento (RF-08) é calculado a partir das sessões Realizadas que entraram nele; o valor do lançamento pode ser editado na mão, sem mudar esse número.
9. Sessão não tem duração: nas grades de horário ocupa uma linha de 30 minutos, e duas sessões no mesmo horário são permitidas (sem alerta de conflito).
10. No calendário a semana vai de domingo a sábado e a visão padrão é Mês.
11. Reagendar é editar a sessão (data e horário no Dialog); arrastar e soltar fica para depois.
12. O valor da sessão é obrigatório e maior que zero (sessão gratuita não é prevista). Sessão de convênio soma no lançamento como a particular.
13. "Sessão mais recente", para sugerir o valor, é a primeira da lista da aba Sessões (maior data; empate por horário e depois por criação), mesmo que seja uma sessão futura.
14. Só conta a mudança para Realizada (ou criar já Realizada) feita depois desta revisão: sessões que já estavam Realizadas antes não geram lançamento retroativo. Na migração, cada sessão antiga recebe como valor o antigo "valor da consulta" do paciente (0 se não havia) e o cadastro perde os campos de atendimento.
15. Lançamento Pago nunca é alterado automaticamente. Trocar a data de uma sessão já contada para outro mês também não a move de lançamento (limitações conhecidas).
16. "Editar valor" existe em qualquer lançamento (Pendente ou Pago). Se um "Desfazer" deixar dois lançamentos Pendentes na mesma competência, a soma automática vai para o último da lista.
17. Sem horário de atendimento no paciente, o Dialog de sessão não sugere mais horário: ele vem só do clique no calendário ou fica vazio.
18. O material da profissional é fixo e vem embutido no aplicativo (o `treino-de-fala.pdf` da raiz do repositório): vale para todos os pacientes e tenants, e trocá-lo exige mudar o arquivo e gerar uma nova versão do sistema. Os documentos anexados pelo profissional pertencem à clínica (tenant), não a um paciente.

---

## Anexo A — Schema da anamnese
Tipos: `texto` (padrão), `sim/não` (com campo de detalhe), `escolha`. Marcas: `[C]` criança, `[A]` adulto, sem marca = ambos.

**1. Identificação** — coberta pela aba Dados (RF-05).

**2. Queixa principal**
- Qual o motivo da consulta?
- Quem percebeu o problema primeiro?
- Quando começou e como evoluiu? (`escolha`: melhorou / piorou / estável, + texto)
- O que mais incomoda hoje?

**3. Gestação e parto** `[C]`
- Como foi a gestação (intercorrências, medicamentos, infecções)?
- Tipo de parto (`escolha`: normal / cesárea) e idade gestacional
- Peso e comprimento ao nascer
- Houve choro ao nascer, uso de oxigênio ou UTI neonatal? (`sim/não`)
- Icterícia? (`sim/não`)
- Fez teste da orelhinha, olhinho, pezinho e linguinha? (`sim/não` por teste)

**4. Desenvolvimento** `[C]`
- Idade em que sustentou a cabeça, sentou, engatinhou e andou
- Idade dos primeiros sons, balbucio, primeiras palavras e primeiras frases
- Controle dos esfíncteres (retirada da fralda)
- Comportamento e interação com outras crianças

**5. Alimentação e hábitos orais**
- Foi amamentado? Até quando? `[C]`
- Usou mamadeira, chupeta ou chupou dedo? Até quando? `[C]`
- Idade de introdução dos alimentos sólidos `[C]`
- Como é a mastigação? Engasga, tosse ou demora para comer?
- Recusa texturas ou tem alimentação muito seletiva?
- Rói unhas, morde objetos, range os dentes?
- Respira pela boca? Ronca? Dorme de boca aberta? Baba à noite?

**6. Audição**
- Tem ou já teve otites frequentes?
- Já fez audiometria ou outros exames auditivos?
- Responde quando chamado? Pede para repetir?
- Costuma aumentar o volume da TV?
- Usa aparelho auditivo? Tem zumbido ou tontura?

**7. Comunicação e linguagem**
- Como se comunica (fala, gestos, sons)?
- Entende ordens simples e complexas? `[C]`
- Troca, omite ou distorce sons na fala?
- Gagueja ou trava ao falar?
- Como é a leitura e a escrita (se em idade escolar)? `[C]`
- Como é o desempenho escolar? Há dificuldade de aprendizagem? `[C]`
- Há outros idiomas em casa?

**8. Voz** (seção opcional)
- Rouquidão, cansaço vocal, falha na voz?
- Usa muito a voz no trabalho (professor, cantor, atendente)? `[A]`
- Bebe água? Fuma? Consome álcool? `[A]`
- Refluxo, alergias ou pigarro frequentes?

**9. Histórico de saúde**
- Doenças atuais ou passadas (neurológicas, respiratórias, genéticas, infecciosas)
- Cirurgias (amígdalas, adenoides, frênulo, etc.)
- Convulsões, internações ou traumas na cabeça
- Uso de medicamentos
- Alergias
- Acompanhamentos anteriores (fonoaudiologia, psicologia, terapia ocupacional, neuropediatra)
- Exames realizados e diagnósticos prévios

**10. Histórico familiar**
- Alguém na família com dificuldade de fala, linguagem, audição, gagueira ou dislexia?
- Casos de TEA, TDAH ou deficiência intelectual na família?
- Os pais são parentes (consanguinidade)? `[C]`

**11. Contexto social e rotina**
- Com quem mora? Quem cuida da criança?
- Frequenta escola ou creche? `[C]`
- Quanto tempo de tela (TV, celular, tablet) por dia?
- Como é o sono?
- Como é o comportamento (agitação, isolamento, irritabilidade)?

**12. Dificuldades e expectativas**
- Quais as principais dificuldades no dia a dia?
- Como o problema afeta a escola, o trabalho ou a vida social?
- Já tentou algum tratamento? Qual foi o resultado?
- O que espera do acompanhamento fonoaudiológico?
- Há mais alguma observação importante?
