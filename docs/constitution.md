# Constitution — Sistema da Clínica de Fonoaudiologia

Regras que valem para todo o projeto. Se uma spec ou tarefa conflitar com isto, a constitution vence.

## Produto
- Primeiro cliente: Claudionaria Torres, fonoaudióloga (CRFa 4-12096).
- Multi-tenant desde o dia 1: todo dado pertence a um `tenantId`. Nenhuma tela ou função lê dados sem filtrar por tenant.
- Fase 1: apenas front-end com dados mockados. Fase 2: back-end. A troca do mock pela API não pode exigir mudança nas telas.

## Princípios
1. **Mínimo que funciona primeiro.** Cada tarefa entrega o menor incremento utilizável; refinamentos entram depois.
2. **Densidade e clareza.** Telas funcionais e densas, sem decoração. Tabelas para listas, abas para perfis.
3. **Dados de saúde são sensíveis (LGPD).** Nada de dados reais nos mocks; CPF sempre mascarado na listagem; sem log de dados pessoais.
4. **Acesso a dados só por camada de serviço** (`services/`), nunca direto do componente. É essa camada que será trocada pela API.
5. **Português (pt-BR)** em toda a interface, datas `dd/mm/aaaa`, moeda em BRL.

## Regras técnicas
- React + TypeScript (`strict: true`), sem `any`.
- Somente componentes do MUI v6 e `@mui/icons-material`. Sem outras bibliotecas de UI.
- Todo estilo vem do tema em `src/theme.ts`. Proibido usar o tema padrão e cores/fontes hardcoded nos componentes.
- Código conciso e legível: componentes pequenos, nomes claros, sem abstração antes de haver repetição.
- Ao criar ou ajustar telas, usar a skill `frontend-design`. Como complemento (boas práticas gerais de web moderna, não de estética), usar `modern-web-guidance` quando disponível.

## Regras visuais
- 2 a 3 cores: primária suave, neutros, uma cor de alerta (pagamento pendente).
- Duas fontes: uma com personalidade para títulos, uma legível para o corpo (não usar só Inter/Roboto).
- Bordas pouco arredondadas, sem gradientes, sem emojis como ícones.
- **Responsivo, mobile first:** toda tela é desenhada para celular primeiro e adaptada para cima (tablet, desktop), usando os breakpoints do tema — não o contrário.

## Definição de pronto (por tarefa)
- Compila sem erros de TypeScript.
- Funciona com os dados mockados.
- Critérios de aceite da spec correspondente atendidos.
