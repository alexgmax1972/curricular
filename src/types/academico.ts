 // ============================================================
// P.A.C.
// Plataforma de Atividade Curricular
//
// academico.ts
//
// TIPOS PRINCIPAIS DO SISTEMA ACADÊMICO
// ============================================================



// ============================================================
// COMPETÊNCIA
// ============================================================
//
// A = Aprovado
// B = Aprovado
// C = Aprovado
// D = Reprovado
//
// REGRA DO P.A.C.
//
// A, B ou C
//      ↓
// APROVADO
//
// D
//      ↓
// REPROVADO
// ============================================================

export type Competencia =
  | "A"
  | "B"
  | "C"
  | "D";



// ============================================================
// TIPO: STATUS DA DISCIPLINA
// ============================================================

export type StatusDisciplina =
  | "PENDENTE"
  | "EM_ANDAMENTO"
  | "CONCLUIDA"
  | "APROVADA"
  | "REPROVADA";



// ============================================================
// TIPO: STATUS DO SEMESTRE
// ============================================================

export type StatusSemestre =
  | "BLOQUEADO"
  | "DISPONIVEL"
  | "EM_ANDAMENTO"
  | "FINALIZADO"
  | "APROVADO"
  | "REPROVADO";



// ============================================================
// TIPO: DISCIPLINA
// ============================================================

export interface Disciplina {
  // Identificação
  id: string;

  // Código da disciplina
  codigo: string;

  // Nome da disciplina
  nome: string;

  // Semestre da disciplina
  semestre: number;

  // Carga horária
  cargaHoraria: number;

  // ==========================================================
  // AVALIAÇÃO
  // ==========================================================

  // Competência final
  //
  // null = ainda não avaliada
  competencia: Competencia | null;

  // Nota numérica opcional
  //
  // Pode ser utilizada futuramente.
  nota: number | null;

  // Frequência em percentual
  frequencia: number;

  // ==========================================================
  // ATIVIDADES
  // ==========================================================

  atividadesConcluidas: number;

  atividadesTotal: number;

  // ==========================================================
  // SITUAÇÃO
  // ==========================================================

  status: StatusDisciplina;

  // Disciplina foi finalizada
  finalizada: boolean;

  // Disciplina foi aprovada
  aprovada: boolean;

  // Disciplina foi reprovada
  reprovada: boolean;
}



// ============================================================
// TIPO: SEMESTRE
// ============================================================

export interface Semestre {
  // Número do semestre
  numero: number;

  // Nome do semestre
  nome: string;

  // Disciplinas
  disciplinas: Disciplina[];

  // Status do semestre
  status: StatusSemestre;

  // O semestre foi iniciado
  iniciado: boolean;

  // O semestre foi finalizado
  finalizado: boolean;

  // O semestre foi aprovado
  aprovado: boolean;

  // O semestre foi reprovado
  reprovado: boolean;

  // Percentual de conclusão
  percentualConclusao: number;
}



// ============================================================
// TIPO: ALUNO
// ============================================================

export interface Aluno {
  // Identificação
  id: string;

  // Nome completo
  nomeCompleto: string;

  // Idade
  idade: number;

  // Ensino médio completo
  ensinoMedioCompleto: boolean;

  // ==========================================================
  // LOGIN
  // ==========================================================

  usuario: string;

  senha: string;

  // ==========================================================
  // SITUAÇÃO ACADÊMICA
  // ==========================================================

  // Semestre atualmente liberado
  semestreAtual: number;

  // Semestres do curso
  semestres: Semestre[];

  // ==========================================================
  // CONTA
  // ==========================================================

  ativo: boolean;

  // Data de cadastro
  dataCadastro: string;
}



// ============================================================
// TIPO: PROFESSOR
// ============================================================
//
// O PROFESSOR POSSUI:
//
// - Nome
// - Usuário
// - Senha
// - Disciplina
//
// O login deve validar os três dados:
//
// USUÁRIO
// SENHA
// DISCIPLINA
// ============================================================

export interface Professor {
  // Identificação
  id: string;

  // Nome completo do professor
  nomeCompleto: string;

  // Usuário utilizado no login
  usuario: string;

  // Senha utilizada no login
  senha: string;

  // Disciplina que o professor leciona
  disciplina: string;

  // Situação da conta
  ativo: boolean;

  // Data de cadastro
  dataCadastro: string;
}



// ============================================================
// TIPO: RESULTADO DO SEMESTRE
// ============================================================

export interface ResultadoSemestre {
  // Número do semestre
  semestre: number;

  // Pode finalizar o semestre
  podeFinalizar: boolean;

  // Pode avançar para o próximo semestre
  podeAvancar: boolean;

  // Total de disciplinas
  disciplinasTotal: number;

  // Disciplinas concluídas
  disciplinasConcluidas: number;

  // Disciplinas aprovadas
  disciplinasAprovadas: number;

  // Disciplinas reprovadas
  disciplinasReprovadas: number;

  // Percentual de conclusão
  percentualConclusao: number;

  // Mensagem para o aluno
  mensagem: string;
}



// ============================================================
// TIPO: SESSÃO DO USUÁRIO
// ============================================================

export interface SessaoUsuario {
  // Tipo de usuário
  tipo: "aluno" | "professor";

  // ID do usuário
  usuarioId: string;

  // Nome completo
  nome: string;

  // Usuário de login
  usuario: string;

  // Disciplina do professor
  //
  // Para aluno pode ficar vazio/undefined.
  disciplina?: string;

  // Semestre atual do aluno
  semestreAtual?: number;

  // Data do login
  dataLogin: string;
}



// ============================================================
// FUNÇÃO: VERIFICAR COMPETÊNCIA APROVADA
// ============================================================
//
// A, B e C = aprovado
// D = reprovado
// null = ainda não avaliado
// ============================================================

export function competenciaAprovada(
  competencia: Competencia | null
): boolean {
  return (
    competencia === "A" ||
    competencia === "B" ||
    competencia === "C"
  );
}



// ============================================================
// FUNÇÃO: VERIFICAR COMPETÊNCIA REPROVADA
// ============================================================

export function competenciaReprovada(
  competencia: Competencia | null
): boolean {
  return competencia === "D";
}



// ============================================================
// FUNÇÃO: CALCULAR STATUS DA DISCIPLINA
// ============================================================

export function calcularStatusDisciplina(
  disciplina: Disciplina
): StatusDisciplina {

  // ----------------------------------------------------------
  // D = REPROVADA
  // ----------------------------------------------------------

  if (disciplina.competencia === "D") {
    return "REPROVADA";
  }


  // ----------------------------------------------------------
  // A, B OU C = APROVADA
  // ----------------------------------------------------------

  if (
    disciplina.competencia === "A" ||
    disciplina.competencia === "B" ||
    disciplina.competencia === "C"
  ) {
    return "APROVADA";
  }


  // ----------------------------------------------------------
  // SEM COMPETÊNCIA
  // ----------------------------------------------------------

  if (
    disciplina.atividadesConcluidas > 0
  ) {
    return "EM_ANDAMENTO";
  }


  return "PENDENTE";
}



// ============================================================
// FUNÇÃO: CALCULAR PERCENTUAL DA DISCIPLINA
// ============================================================

export function calcularPercentualDisciplina(
  disciplina: Disciplina
): number {

  if (
    disciplina.atividadesTotal <= 0
  ) {
    return 0;
  }

  const percentual =
    (
      disciplina.atividadesConcluidas /
      disciplina.atividadesTotal
    ) * 100;

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(percentual)
    )
  );
}



// ============================================================
// FUNÇÃO: CALCULAR PERCENTUAL DO SEMESTRE
// ============================================================

export function calcularPercentualSemestre(
  semestre: Semestre
): number {

  const disciplinas =
    semestre.disciplinas;

  if (
    disciplinas.length === 0
  ) {
    return 0;
  }

  const total =
    disciplinas.reduce(
      (soma, disciplina) =>
        soma +
        calcularPercentualDisciplina(
          disciplina
        ),
      0
    );

  return Math.round(
    total / disciplinas.length
  );
}



// ============================================================
// FUNÇÃO: CALCULAR RESULTADO DO SEMESTRE
// ============================================================
//
// REGRA:
//
// TODAS A/B/C
//      ↓
// SEMESTRE APROVADO
//      ↓
// PRÓXIMO SEMESTRE LIBERADO
//
// QUALQUER D
//      ↓
// SEMESTRE REPROVADO
//      ↓
// PRÓXIMO SEMESTRE BLOQUEADO
//
// SEM COMPETÊNCIA
//      ↓
// SEMESTRE EM ANDAMENTO
// ============================================================

export function calcularResultadoSemestre(
  semestre: Semestre
): ResultadoSemestre {

  const disciplinas =
    semestre.disciplinas;


  // ----------------------------------------------------------
  // TOTAL
  // ----------------------------------------------------------

  const disciplinasTotal =
    disciplinas.length;


  // ----------------------------------------------------------
  // CONCLUÍDAS
  // ----------------------------------------------------------

  const disciplinasConcluidas =
    disciplinas.filter(
      disciplina =>
        disciplina.competencia !== null
    ).length;


  // ----------------------------------------------------------
  // APROVADAS
  // ----------------------------------------------------------

  const disciplinasAprovadas =
    disciplinas.filter(
      disciplina =>
        competenciaAprovada(
          disciplina.competencia
        )
    ).length;


  // ----------------------------------------------------------
  // REPROVADAS
  // ----------------------------------------------------------

  const disciplinasReprovadas =
    disciplinas.filter(
      disciplina =>
        competenciaReprovada(
          disciplina.competencia
        )
    ).length;


  // ----------------------------------------------------------
  // PERCENTUAL
  // ----------------------------------------------------------

  const percentualConclusao =
    calcularPercentualSemestre(
      semestre
    );


  // ==========================================================
  // SEM DISCIPLINAS
  // ==========================================================

  if (
    disciplinasTotal === 0
  ) {

    return {
      semestre: semestre.numero,

      podeFinalizar: false,

      podeAvancar: false,

      disciplinasTotal: 0,

      disciplinasConcluidas: 0,

      disciplinasAprovadas: 0,

      disciplinasReprovadas: 0,

      percentualConclusao: 0,

      mensagem:
        "Este semestre não possui disciplinas cadastradas."
    };
  }


  // ==========================================================
  // EXISTE D
  // ==========================================================

  if (
    disciplinasReprovadas > 0
  ) {

    return {
      semestre: semestre.numero,

      podeFinalizar: false,

      podeAvancar: false,

      disciplinasTotal,

      disciplinasConcluidas,

      disciplinasAprovadas,

      disciplinasReprovadas,

      percentualConclusao,

      mensagem:
        "Semestre reprovado. Existe pelo menos uma disciplina com competência D."
    };
  }


  // ==========================================================
  // TODAS A/B/C
  // ==========================================================

  if (
    disciplinasAprovadas ===
    disciplinasTotal
  ) {

    return {
      semestre: semestre.numero,

      podeFinalizar: true,

      podeAvancar: true,

      disciplinasTotal,

      disciplinasConcluidas,

      disciplinasAprovadas,

      disciplinasReprovadas,

      percentualConclusao: 100,

      mensagem:
        "Semestre aprovado. Todas as disciplinas possuem competência A, B ou C."
    };
  }


  // ==========================================================
  // SEMESTRE EM ANDAMENTO
  // ==========================================================

  return {
    semestre: semestre.numero,

    podeFinalizar: false,

    podeAvancar: false,

    disciplinasTotal,

    disciplinasConcluidas,

    disciplinasAprovadas,

    disciplinasReprovadas,

    percentualConclusao,

    mensagem:
      "Semestre em andamento. Finalize todas as disciplinas para avançar."
  };
}



// ============================================================
// FUNÇÃO: CALCULAR STATUS DO SEMESTRE
// ============================================================

export function calcularStatusSemestre(
  semestre: Semestre
): StatusSemestre {

  const resultado =
    calcularResultadoSemestre(
      semestre
    );


  // ----------------------------------------------------------
  // SEM DISCIPLINAS
  // ----------------------------------------------------------

  if (
    semestre.disciplinas.length === 0
  ) {
    return "BLOQUEADO";
  }


  // ----------------------------------------------------------
  // REPROVADO
  // ----------------------------------------------------------

  if (
    resultado.disciplinasReprovadas > 0
  ) {
    return "REPROVADO";
  }


  // ----------------------------------------------------------
  // APROVADO
  // ----------------------------------------------------------

  if (
    resultado.podeAvancar
  ) {
    return "APROVADO";
  }


  // ----------------------------------------------------------
  // EM ANDAMENTO
  // ----------------------------------------------------------

  if (
    semestre.iniciado ||
    resultado.disciplinasConcluidas > 0
  ) {
    return "EM_ANDAMENTO";
  }


  // ----------------------------------------------------------
  // DISPONÍVEL
  // ----------------------------------------------------------

  return "DISPONIVEL";
}



// ============================================================
// FUNÇÃO: VERIFICAR SE PODE AVANÇAR
// ============================================================

export function podeAvancarSemestre(
  semestre: Semestre
): boolean {

  const resultado =
    calcularResultadoSemestre(
      semestre
    );

  return resultado.podeAvancar;
}



// ============================================================
// FUNÇÃO: VERIFICAR SE SEMESTRE FOI APROVADO
// ============================================================

export function semestreAprovado(
  semestre: Semestre
): boolean {

  const resultado =
    calcularResultadoSemestre(
      semestre
    );

  return (
    resultado.disciplinasTotal > 0 &&
    resultado.disciplinasAprovadas ===
      resultado.disciplinasTotal
  );
}



// ============================================================
// FUNÇÃO: VERIFICAR SE SEMESTRE FOI REPROVADO
// ============================================================

export function semestreReprovado(
  semestre: Semestre
): boolean {

  return semestre.disciplinas.some(
    disciplina =>
      disciplina.competencia === "D"
  );
}



// ============================================================
// FUNÇÃO: CRIAR DISCIPLINA
// ============================================================

export function criarDisciplina(
  dados: Partial<Disciplina> &
    Pick<
      Disciplina,
      "id" |
      "codigo" |
      "nome" |
      "semestre"
    >
): Disciplina {

  return {

    id: dados.id,

    codigo: dados.codigo,

    nome: dados.nome,

    semestre: dados.semestre,

    cargaHoraria:
      dados.cargaHoraria ?? 60,

    competencia:
      dados.competencia ?? null,

    nota:
      dados.nota ?? null,

    frequencia:
      dados.frequencia ?? 0,

    atividadesConcluidas:
      dados.atividadesConcluidas ?? 0,

    atividadesTotal:
      dados.atividadesTotal ?? 0,

    status:
      dados.status ?? "PENDENTE",

    finalizada:
      dados.finalizada ?? false,

    aprovada:
      dados.aprovada ?? false,

    reprovada:
      dados.reprovada ?? false
  };
}



// ============================================================
// FUNÇÃO: CRIAR SEMESTRE
// ============================================================

export function criarSemestre(
  numero: number,
  nome?: string,
  disciplinas: Disciplina[] = []
): Semestre {

  return {

    numero,

    nome:
      nome ??
      `${numero}º Semestre`,

    disciplinas,

    status:
      disciplinas.length > 0
        ? "DISPONIVEL"
        : "BLOQUEADO",

    iniciado: false,

    finalizado: false,

    aprovado: false,

    reprovado: false,

    percentualConclusao: 0
  };
}



// ============================================================
// FUNÇÃO: CRIAR ALUNO
// ============================================================

export function criarAluno(
  dados: Partial<Aluno> &
    Pick<
      Aluno,
      "id" |
      "nomeCompleto" |
      "idade" |
      "usuario" |
      "senha"
    >
): Aluno {

  return {

    id: dados.id,

    nomeCompleto:
      dados.nomeCompleto,

    idade:
      dados.idade,

    ensinoMedioCompleto:
      dados.ensinoMedioCompleto ??
      true,

    usuario:
      dados.usuario,

    senha:
      dados.senha,

    semestreAtual:
      dados.semestreAtual ??
      1,

    semestres:
      dados.semestres ??
      [],

    ativo:
      dados.ativo ??
      true,

    dataCadastro:
      dados.dataCadastro ??
      new Date().toISOString()
  };
}



// ============================================================
// FUNÇÃO: CRIAR PROFESSOR
// ============================================================
//
// O PROFESSOR AGORA POSSUI:
//
// nomeCompleto
// usuario
// senha
// disciplina
//
// Exemplo:
//
// {
//   nomeCompleto: "João da Silva",
//   usuario: "joao",
//   senha: "123456",
//   disciplina: "Programação I"
// }
// ============================================================

export function criarProfessor(
  dados: Partial<Professor> &
    Pick<
      Professor,
      "id" |
      "nomeCompleto" |
      "usuario" |
      "senha" |
      "disciplina"
    >
): Professor {

  return {

    id: dados.id,

    nomeCompleto:
      dados.nomeCompleto,

    usuario:
      dados.usuario,

    senha:
      dados.senha,

    disciplina:
      dados.disciplina,

    ativo:
      dados.ativo ??
      true,

    dataCadastro:
      dados.dataCadastro ??
      new Date().toISOString()
  };
}



// ============================================================
// FUNÇÃO: VALIDAR LOGIN DO PROFESSOR
// ============================================================
//
// O login exige:
//
// 1. Usuário
// 2. Senha
// 3. Disciplina
//
// A conta também precisa estar ativa.
// ============================================================

export function validarLoginProfessor(
  professor: Professor,
  usuario: string,
  senha: string,
  disciplina: string
): boolean {

  if (
    !professor.ativo
  ) {
    return false;
  }

  return (
    professor.usuario.trim() ===
      usuario.trim() &&

    professor.senha ===
      senha &&

    professor.disciplina.trim() ===
      disciplina.trim()
  );
}



// ============================================================
// FUNÇÃO: CRIAR SESSÃO DO PROFESSOR
// ============================================================

export function criarSessaoProfessor(
  professor: Professor
): SessaoUsuario {

  return {

    tipo: "professor",

    usuarioId:
      professor.id,

    nome:
      professor.nomeCompleto,

    usuario:
      professor.usuario,

    disciplina:
      professor.disciplina,

    dataLogin:
      new Date().toISOString()
  };
}



// ============================================================
// FUNÇÃO: CRIAR SESSÃO DO ALUNO
// ============================================================

export function criarSessaoAluno(
  aluno: Aluno
): SessaoUsuario {

  return {

    tipo: "aluno",

    usuarioId:
      aluno.id,

    nome:
      aluno.nomeCompleto,

    usuario:
      aluno.usuario,

    semestreAtual:
      aluno.semestreAtual,

    dataLogin:
      new Date().toISOString()
  };
}



// ============================================================
// FIM DO ARQUIVO
// ============================================================