# Spec — Sistema da Clínica de Fonoaudiologia (Fase 1: front com mocks)

## 1. Visão
Sistema web para a fonoaudióloga cadastrar pacientes, registrar anamnese e prescrições, controlar pagamentos e imprimir relatórios. Multi-tenant (cada clínica/profissional é um tenant). Fase 1 usa dados mockados; o back-end vem depois.

**Usuário da Fase 1:** Claudionaria Torres, fonoaudióloga, CRFa 4-12096 (tenant `claudionaria`).

## 2. Escopo
**Dentro (Fase 1):** login mockado, lista e cadastro de pacientes, perfil com abas, anamnese (criança/adulto), prescrições, financeiro, relatório imprimível, dados fiscais para recibos anuais.

**Fora (por enquanto):** back-end, autenticação real, agenda/calendário, emissão do recibo em PDF (só guardamos os dados), múltiplos usuários por tenant, anexos de exames.

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
- Tabela (DataGrid) com: Nome, Tipo (Criança/Adulto), Idade, Dias de atendimento, Valor da consulta, Pagamento (chip: Em dia / Pendente), Telefone.
- Busca por nome, filtro por tipo e por pagamento pendente. Ordenação por coluna.
- Clique na linha abre o perfil. Botão "Novo paciente".
- Pagamento "Pendente" usa a cor de alerta.

**Aceite**
- [ ] Filtrar "pendentes" mostra só pacientes com algum lançamento pendente.
- [ ] Busca por nome funciona sem diferenciar maiúsculas/acentos.

### RF-03 Cadastro de paciente
- "Novo paciente" abre um Dialog com o mínimo: nome completo, data de nascimento, tipo, telefone.
- Tipo é sugerido pela idade (menor de 18 → Criança) e pode ser alterado.
- Ao salvar, cria o paciente e abre o perfil na aba Dados.

**Aceite**
- [ ] Não salva sem nome e data de nascimento.
- [ ] Após salvar, o paciente aparece na lista e o perfil abre.

### RF-04 Perfil do paciente
- Cabeçalho fixo: nome, tipo, idade, valor da consulta, dias de atendimento, chip de pagamento.
- Abas: **Dados · Anamnese · Prescrições · Financeiro · Relatório**.

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
- Bloco "Atendimento": valor da consulta, dias da semana em que vem (seleção múltipla), horário (opcional).
- Tabela de lançamentos: competência (mês/ano), nº de sessões, valor, status (Pago/Pendente), data do pagamento, forma (Pix, Dinheiro, Cartão, Outro).
- "Novo lançamento": valor sugerido = sessões × valor da consulta (editável).
- Marcar como pago (pede data e forma) e desfazer.
- Resumo: total pendente e total pago no ano selecionado.

**Aceite**
- [ ] Pendente aparece com a cor de alerta.
- [ ] O chip do cabeçalho e da lista fica "Pendente" se existir ao menos um lançamento pendente.
- [ ] O total pago do ano bate com a soma dos lançamentos pagos.

### RF-09 Aba Relatório
- Escolha do que incluir: Dados, Anamnese, Prescrições, Financeiro (checkboxes).
- Pré-visualização em página e botão "Imprimir".
- Cabeçalho do relatório: nome da clínica/profissional, registro, data de emissão.
- Impressão sem elementos de navegação; quebra de página entre seções.

**Aceite**
- [ ] Só as seções marcadas saem no relatório.
- [ ] Layout de impressão legível em A4.

### RF-10 Multi-tenant
- Todo registro tem `tenantId`. O serviço de dados filtra sempre pelo tenant da sessão.
- Nome da clínica, profissional e registro profissional vêm de `Tenant` (não fixos em telas).

**Aceite**
- [ ] Com dois tenants no mock, cada login vê apenas os próprios pacientes.

## 4. Requisitos não funcionais
- **Idioma/formatos:** pt-BR, datas `dd/mm/aaaa`, moeda BRL.
- **Persistência do mock:** `localStorage`, para os dados sobreviverem ao recarregar.
- **Privacidade:** dados fictícios nos mocks; CPF mascarado em listagens e no cabeçalho.
- **Responsivo, mobile first:** layout desenhado para celular primeiro e adaptado para cima (tablet, desktop). Em telas estreitas, a tabela de pacientes vira lista de cartões, as abas do perfil ficam roláveis, e formulários e o Dialog de novo paciente ocupam a largura da tela. Navegação por teclado nos formulários.
- **Impressão:** estilos `@media print` dedicados (independem do layout responsivo, seguem o formato A4 fixo).

## 5. Suposições a confirmar
1. Cobrança é por lançamento mensal (competência), não por sessão avulsa.
2. O relatório do paciente reúne Dados, Anamnese, Prescrições e Financeiro à escolha.
3. "Criança" é o paciente menor de 18 anos (adolescentes incluídos), editável manualmente.
4. Prescrições ganham aba própria (além das quatro citadas), pois têm histórico e impressão próprios.

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
