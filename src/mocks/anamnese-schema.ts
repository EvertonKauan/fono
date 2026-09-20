import type { PatientKind } from '../types/domain.ts'

export type QuestionType = 'texto' | 'simNao' | 'escolha'

export type Question = {
  id: string
  label: string
  type: QuestionType
  options?: string[]
  audience?: PatientKind // ausente = criança e adulto
}

export type Section = {
  id: string
  title: string
  optional?: boolean // seção com interruptor "Aplicável" (Voz)
  questions: Question[]
}

const C = 'crianca'
const A = 'adulto'

const text = (id: string, label: string, audience?: PatientKind): Question => ({ id, label, type: 'texto', audience })
const yesNo = (id: string, label: string, audience?: PatientKind): Question => ({ id, label, type: 'simNao', audience })
const choice = (id: string, label: string, options: string[], audience?: PatientKind): Question => ({
  id,
  label,
  type: 'escolha',
  options,
  audience,
})

// Anexo A da spec. "Identificação" (seção 1) vive na aba Dados. Os ids seguem os já usados em mocks/seed.ts.
export const anamneseSchema: Section[] = [
  {
    id: 'queixa',
    title: 'Queixa principal',
    questions: [
      text('queixa_motivo', 'Qual o motivo da consulta?'),
      text('queixa_quem_percebeu', 'Quem percebeu o problema primeiro?'),
      text('queixa_inicio', 'Quando começou?'),
      choice('queixa_evolucao', 'Como evoluiu?', ['Melhorou', 'Piorou', 'Estável']),
      text('queixa_incomoda', 'O que mais incomoda hoje?'),
    ],
  },
  {
    id: 'gestacao',
    title: 'Gestação e parto',
    questions: [
      text('gestacao_gestacao', 'Como foi a gestação (intercorrências, medicamentos, infecções)?', C),
      choice('gestacao_tipo_parto', 'Tipo de parto', ['Normal', 'Cesárea'], C),
      text('gestacao_idade_gestacional', 'Idade gestacional', C),
      text('gestacao_peso_comprimento', 'Peso e comprimento ao nascer', C),
      yesNo('gestacao_uti', 'Houve choro ao nascer, uso de oxigênio ou UTI neonatal?', C),
      yesNo('gestacao_ictericia', 'Icterícia?', C),
      yesNo('gestacao_teste_orelhinha', 'Fez o teste da orelhinha?', C),
      yesNo('gestacao_teste_olhinho', 'Fez o teste do olhinho?', C),
      yesNo('gestacao_teste_pezinho', 'Fez o teste do pezinho?', C),
      yesNo('gestacao_teste_linguinha', 'Fez o teste da linguinha?', C),
    ],
  },
  {
    id: 'desenvolvimento',
    title: 'Desenvolvimento',
    questions: [
      text('desenvolvimento_motor', 'Idade em que sustentou a cabeça, sentou, engatinhou e andou', C),
      text('desenvolvimento_fala', 'Idade dos primeiros sons, balbucio, primeiras palavras e primeiras frases', C),
      text('desenvolvimento_esfincteres', 'Controle dos esfíncteres (retirada da fralda)', C),
      text('desenvolvimento_comportamento', 'Comportamento e interação com outras crianças', C),
    ],
  },
  {
    id: 'alimentacao',
    title: 'Alimentação e hábitos orais',
    questions: [
      text('alimentacao_amamentacao', 'Foi amamentado? Até quando?', C),
      text('alimentacao_mamadeira_chupeta', 'Usou mamadeira, chupeta ou chupou dedo? Até quando?', C),
      text('alimentacao_solidos', 'Idade de introdução dos alimentos sólidos', C),
      text('alimentacao_mastigacao', 'Como é a mastigação? Engasga, tosse ou demora para comer?'),
      text('alimentacao_seletividade', 'Recusa texturas ou tem alimentação muito seletiva?'),
      text('alimentacao_habitos', 'Rói unhas, morde objetos, range os dentes?'),
      text('alimentacao_respiracao', 'Respira pela boca? Ronca? Dorme de boca aberta? Baba à noite?'),
    ],
  },
  {
    id: 'audicao',
    title: 'Audição',
    questions: [
      text('audicao_otites', 'Tem ou já teve otites frequentes?'),
      text('audicao_exames', 'Já fez audiometria ou outros exames auditivos?'),
      text('audicao_responde', 'Responde quando chamado? Pede para repetir?'),
      text('audicao_tv', 'Costuma aumentar o volume da TV?'),
      text('audicao_aparelho', 'Usa aparelho auditivo? Tem zumbido ou tontura?'),
    ],
  },
  {
    id: 'comunicacao',
    title: 'Comunicação e linguagem',
    questions: [
      text('comunicacao_como', 'Como se comunica (fala, gestos, sons)?'),
      text('comunicacao_ordens', 'Entende ordens simples e complexas?', C),
      text('comunicacao_sons', 'Troca, omite ou distorce sons na fala?'),
      text('comunicacao_gagueira', 'Gagueja ou trava ao falar?'),
      text('comunicacao_leitura_escrita', 'Como é a leitura e a escrita (se em idade escolar)?', C),
      text('comunicacao_desempenho_escolar', 'Como é o desempenho escolar? Há dificuldade de aprendizagem?', C),
      text('comunicacao_idiomas', 'Há outros idiomas em casa?'),
    ],
  },
  {
    id: 'voz',
    title: 'Voz',
    optional: true,
    questions: [
      text('voz_rouquidao', 'Rouquidão, cansaço vocal, falha na voz?'),
      text('voz_uso_profissional', 'Usa muito a voz no trabalho (professor, cantor, atendente)?', A),
      text('voz_habitos', 'Bebe água? Fuma? Consome álcool?', A),
      text('voz_refluxo', 'Refluxo, alergias ou pigarro frequentes?'),
    ],
  },
  {
    id: 'historico',
    title: 'Histórico de saúde',
    questions: [
      text('historico_doencas', 'Doenças atuais ou passadas (neurológicas, respiratórias, genéticas, infecciosas)'),
      text('historico_cirurgias', 'Cirurgias (amígdalas, adenoides, frênulo, etc.)'),
      text('historico_convulsoes', 'Convulsões, internações ou traumas na cabeça'),
      text('historico_medicamentos', 'Uso de medicamentos'),
      text('historico_alergias', 'Alergias'),
      text('historico_acompanhamentos', 'Acompanhamentos anteriores (fonoaudiologia, psicologia, terapia ocupacional, neuropediatra)'),
      text('historico_exames', 'Exames realizados e diagnósticos prévios'),
    ],
  },
  {
    id: 'familiar',
    title: 'Histórico familiar',
    questions: [
      text('familiar_comunicacao', 'Alguém na família com dificuldade de fala, linguagem, audição, gagueira ou dislexia?'),
      text('familiar_tea_tdah', 'Casos de TEA, TDAH ou deficiência intelectual na família?'),
      text('familiar_consanguinidade', 'Os pais são parentes (consanguinidade)?', C),
    ],
  },
  {
    id: 'contexto',
    title: 'Contexto social e rotina',
    questions: [
      text('contexto_moradia', 'Com quem mora? Quem cuida da criança?'),
      text('contexto_escola', 'Frequenta escola ou creche?', C),
      text('contexto_telas', 'Quanto tempo de tela (TV, celular, tablet) por dia?'),
      text('contexto_sono', 'Como é o sono?'),
      text('contexto_comportamento', 'Como é o comportamento (agitação, isolamento, irritabilidade)?'),
    ],
  },
  {
    id: 'expectativas',
    title: 'Dificuldades e expectativas',
    questions: [
      text('expectativas_dificuldades', 'Quais as principais dificuldades no dia a dia?'),
      text('expectativas_impacto', 'Como o problema afeta a escola, o trabalho ou a vida social?'),
      text('expectativas_tratamentos', 'Já tentou algum tratamento? Qual foi o resultado?'),
      text('expectativas_espera', 'O que espera do acompanhamento fonoaudiológico?'),
      text('expectativas_observacoes', 'Há mais alguma observação importante?'),
    ],
  },
]

export const questionsFor = (section: Section, kind: PatientKind) =>
  section.questions.filter((question) => !question.audience || question.audience === kind)

// Seções sem nenhuma pergunta aplicável ao público ficam de fora.
export function visibleSections(kind: PatientKind, schema: Section[] = anamneseSchema) {
  return schema
    .map((section) => ({ section, questions: questionsFor(section, kind) }))
    .filter(({ questions }) => questions.length > 0)
}
