# Limitações conhecidas — Fase 1 (front com mocks)

Pontos que passaram na verificação dos critérios de aceite (T21/T22) mas têm limitação conhecida. Nenhum bloqueia o uso da Fase 1.

1. **Perda de rascunho ao trocar de aba.** As abas do perfil (Dados, Anamnese, Financeiro) descartam o que não foi salvo quando o usuário muda de aba, sem aviso. Salve antes de trocar.
2. **Sem tratamento de erro na gravação.** Se o `localStorage` recusar uma gravação (cota cheia, navegador bloqueando armazenamento), a tela não mostra erro e a alteração não é gravada. Dados corrompidos na leitura são recriados a partir do seed.
3. **Isolamento entre tenants só na camada de serviços.** Toda leitura e escrita filtra por `tenantId` em `src/services/`, mas o `localStorage` é único por navegador: quem abrir as ferramentas do desenvolvedor vê os dados dos dois tenants. O isolamento real vem com o back-end (Fase 2).
4. **Ctrl+F não busca dentro de seções fechadas da anamnese.** O `Accordion` do MUI esconde o conteúdo fechado da busca do navegador. Abra a seção para localizar o texto.
5. **Bundle acima de 500 kB, sem code-splitting.** O build do Vite avisa sobre o tamanho do chunk (MUI, DataGrid e date pickers). Divisão por rota fica para depois, se o tempo de carga incomodar.
