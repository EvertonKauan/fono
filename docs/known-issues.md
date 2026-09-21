# Limitações conhecidas — Fase 1 (front com mocks)

Pontos que passaram na verificação dos critérios de aceite (T21/T22) mas têm limitação conhecida. Nenhum bloqueia o uso da Fase 1.

1. **Perda de rascunho ao trocar de aba.** As abas do perfil (Dados, Anamnese, Financeiro) descartam o que não foi salvo quando o usuário muda de aba, sem aviso. Salve antes de trocar.
2. **Falha de gravação só avisa; não recupera o dado.** Se o `localStorage`, o `sessionStorage` ou o IndexedDB recusarem uma gravação (cota cheia, navegador bloqueando armazenamento), os formulários mostram "Não foi possível salvar…", liberam o botão e mantêm o que foi digitado, mas nada é gravado até o navegador voltar a permitir. Dados corrompidos na leitura continuam sendo recriados a partir do seed, sem aviso.
3. **Isolamento entre tenants só na camada de serviços.** Toda leitura e escrita filtra por `tenantId` em `src/services/`, mas o `localStorage` é único por navegador: quem abrir as ferramentas do desenvolvedor vê os dados dos dois tenants. O isolamento real vem com o back-end (Fase 2).
4. **Ctrl+F não busca dentro de seções fechadas da anamnese.** O `Accordion` do MUI esconde o conteúdo fechado da busca do navegador. Abra a seção para localizar o texto.
5. **Bundle acima de 500 kB, sem code-splitting.** O build do Vite avisa sobre o tamanho do chunk (MUI, DataGrid e date pickers). Divisão por rota fica para depois, se o tempo de carga incomodar.
6. **Validação de anexo pela extensão e pelo tipo do navegador, não pelo conteúdo.** Um arquivo renomeado (por exemplo, um `.png` chamado `.pdf`) passaria. A conferência do conteúdo (assinatura do arquivo) fica para depois.
7. **Muitas sessões no mesmo horário alongam a linha.** Na Semana e no Dia, sessões da mesma fatia de 30 minutos ficam empilhadas e a linha cresce para mostrar todas (não há "+N" nem rolagem interna). Com nomes longos em colunas estreitas (Semana a partir de 900 px), o nome quebra em várias linhas.
8. **Criar pelo toque ou clique na grade não tem via de teclado.** As células vazias (Semana e Dia) e os dias vazios (Mês) são alvos de clique/toque fora da ordem de tabulação; pelo teclado use "Nova sessão". Célula que já tem sessão e a linha "Sem horário" não criam ao clicar; para uma segunda sessão no mesmo horário ou sem horário, use "Nova sessão".
9. **A grade de horários abre no topo (07:00).** Ela não rola sozinha até o horário atual nem até a primeira sessão; no celular é preciso rolar para ver a tarde. Sessões fora de 07:00–21:00 estendem a faixa; sessão não tem duração e ocupa uma fatia de 30 minutos.
10. **Sem arrastar para reagendar.** Reagendar é editar a data e o horário no Dialog (fora do escopo da Fase 1).
