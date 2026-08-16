// ============================================================
// P.A.C.
// Plataforma de Atividade Curricular
//
// semestre.ts
//
// Regras de controle dos semestres
// ============================================================

import type {
  Aluno,
  Disciplina,
  ResultadoSemestre,
  Semestre,
} from "../types/academico";

import { TOTAL_SEMESTRES } from "../data/curriculo";


// ============================================================
// CONFIGURAÇÕES ACADÊMICAS
// ============================================================

// Nota mínima para aprovação.
export const NOTA_MINIMA_APROVACAO = 6.0;

// Frequência mínima para aprovação.
export const FREQUENCIA_MINIMA_APROVACAO = 75;


// ============================================================
// VERIFICAR NOTA
// ============================================================

export function notaAprovada(
  disciplina: Disciplina,
): boolean {
  if (disciplina.nota === null) {
    return false;
  }

  return disciplina.nota >= NOTA_MINIMA_APROVACAO;
}


// ============================================================
// VERIFICAR FREQUÊNCIA
// ============================================================

export function frequenciaAprovada(
  disciplina: Disciplina,
): boolean {
  return (
    disciplina.frequencia >=
    FREQUENCIA_MINIMA_APROVACAO
  );
}


// ============================================================
// VERIFICAR ATIVIDADES
// ============================================================

export function atividadesConcluidas(
  disciplina: Disciplina,
): boolean {
  // Se não houver atividades cadastradas,
  // não bloqueamos a disciplina por esse motivo.
  if (disciplina.atividadesTotal <= 0) {
    return true;
  }

  return (
    disciplina.atividadesConcluidas >=
    disciplina.atividadesTotal
  );
}


// ============================================================
// VERIFICAR DISCIPLINA
// ============================================================

export function disciplinaAprovada(
  disciplina: Disciplina,
): boolean {
  return (
    notaAprovada(disciplina) &&
    frequenciaAprovada(disciplina) &&
    atividadesConcluidas(disciplina)
  );
}


// ============================================================
// ATUALIZAR STATUS DA DISCIPLINA
// ============================================================

export function atualizarStatusDisciplina(
  disciplina: Disciplina,
): Disciplina {

  const aprovada =
    disciplinaAprovada(disciplina);

  if (aprovada) {
    return {
      ...disciplina,

      status: "APROVADA",

      finalizada: true,

      aprovada: true,
    };
  }


  // Se possuir nota e estiver abaixo da média,
  // consideramos reprovada somente quando
  // a disciplina estiver finalizada.

  if (
    disciplina.nota !== null &&
    disciplina.nota < NOTA_MINIMA_APROVACAO &&
    disciplina.finalizada
  ) {
    return {
      ...disciplina,

      status: "REPROVADA",

      aprovada: false,
    };
  }


  // Se a frequência estiver abaixo do mínimo
  // e a disciplina já estiver finalizada.

  if (
    disciplina.finalizada &&
    disciplina.frequencia <
      FREQUENCIA_MINIMA_APROVACAO
  ) {
    return {
      ...disciplina,

      status: "REPROVADA",

      aprovada: false,
    };
  }


  // Se a disciplina ainda estiver sendo realizada.

  if (
    disciplina.atividadesConcluidas > 0 ||
    disciplina.nota !== null
  ) {
    return {
      ...disciplina,

      status: "EM_ANDAMENTO",

      aprovada: false,
    };
  }


  // Estado inicial.

  return {
    ...disciplina,

    status: "PENDENTE",

    aprovada: false,
  };
}


// ============================================================
// ATUALIZAR TODAS AS DISCIPLINAS
// ============================================================

export function atualizarDisciplinas(
  disciplinas: Disciplina[],
): Disciplina[] {

  return disciplinas.map(
    (disciplina) =>
      atualizarStatusDisciplina(disciplina),
  );
}


// ============================================================
// CONTAR DISCIPLINAS
// ============================================================

export function contarDisciplinas(
  semestre: Semestre,
) {
  const total =
    semestre.disciplinas.length;

  const concluidas =
    semestre.disciplinas.filter(
      (disciplina) =>
        disciplina.finalizada,
    ).length;

  const aprovadas =
    semestre.disciplinas.filter(
      (disciplina) =>
        disciplina.aprovada,
    ).length;

  const reprovadas =
    semestre.disciplinas.filter(
      (disciplina) =>
        disciplina.status === "REPROVADA",
    ).length;

  return {
    total,
    concluidas,
    aprovadas,
    reprovadas,
  };
}


// ============================================================
// CALCULAR PERCENTUAL
// ============================================================

export function calcularPercentualSemestre(
  semestre: Semestre,
): number {

  const total =
    semestre.disciplinas.length;

  if (total === 0) {
    return 0;
  }

  const aprovadas =
    semestre.disciplinas.filter(
      (disciplina) =>
        disciplina.aprovada,
    ).length;

  return Math.round(
    (aprovadas / total) * 100,
  );
}


// ============================================================
// VERIFICAR SE TODAS AS DISCIPLINAS
// FORAM FINALIZADAS
// ============================================================

export function todasDisciplinasFinalizadas(
  semestre: Semestre,
): boolean {

  if (semestre.disciplinas.length === 0) {
    return false;
  }

  return semestre.disciplinas.every(
    (disciplina) =>
      disciplina.finalizada,
  );
}


// ============================================================
// VERIFICAR SE TODAS AS DISCIPLINAS
// FORAM APROVADAS
// ============================================================

export function todasDisciplinasAprovadas(
  semestre: Semestre,
): boolean {

  if (semestre.disciplinas.length === 0) {
    return false;
  }

  return semestre.disciplinas.every(
    (disciplina) =>
      disciplina.aprovada,
  );
}


// ============================================================
// VERIFICAR SE EXISTE REPROVAÇÃO
// ============================================================

export function existeReprovacao(
  semestre: Semestre,
): boolean {

  return semestre.disciplinas.some(
    (disciplina) =>
      disciplina.status === "REPROVADA",
  );
}


// ============================================================
// VERIFICAR SE O SEMESTRE PODE SER FINALIZADO
// ============================================================

export function podeFinalizarSemestre(
  semestre: Semestre,
): boolean {

  const disciplinas =
    atualizarDisciplinas(
      semestre.disciplinas,
    );

  return disciplinas.every(
    (disciplina) =>
      disciplinaAprovada(disciplina),
  );
}


// ============================================================
// VERIFICAR SE O SEMESTRE PODE AVANÇAR
// ============================================================

export function podeAvancarSemestre(
  semestre: Semestre,
): boolean {

  return (
    semestre.finalizado &&
    semestre.aprovado &&
    todasDisciplinasAprovadas(semestre)
  );
}


// ============================================================
// GERAR RESULTADO DO SEMESTRE
// ============================================================

export function obterResultadoSemestre(
  semestre: Semestre,
): ResultadoSemestre {

  const disciplinas =
    atualizarDisciplinas(
      semestre.disciplinas,
    );

  const total =
    disciplinas.length;

  const concluidas =
    disciplinas.filter(
      (disciplina) =>
        disciplina.finalizada,
    ).length;

  const aprovadas =
    disciplinas.filter(
      (disciplina) =>
        disciplinaAprovada(disciplina),
    ).length;

  const reprovadas =
    disciplinas.filter(
      (disciplina) =>
        disciplina.status ===
        "REPROVADA",
    ).length;

  const percentual =
    total === 0
      ? 0
      : Math.round(
          (aprovadas / total) * 100,
        );

  const podeFinalizar =
    disciplinas.length > 0 &&
    disciplinas.every(
      (disciplina) =>
        disciplinaAprovada(disciplina),
    );

  const podeAvancar =
    semestre.finalizado &&
    semestre.aprovado &&
    podeFinalizar;

  let mensagem =
    "Semestre em andamento.";


  if (reprovadas > 0) {
    mensagem =
      "Existem disciplinas reprovadas. O semestre não pode ser finalizado.";
  } else if (podeAvancar) {
    mensagem =
      "Semestre aprovado. O próximo semestre está liberado.";
  } else if (podeFinalizar) {
    mensagem =
      "Todas as disciplinas foram aprovadas. O semestre pode ser finalizado.";
  } else if (concluidas < total) {
    mensagem =
      "Existem disciplinas pendentes.";
  }


  return {
    semestre: semestre.numero,

    podeFinalizar,

    podeAvancar,

    disciplinasTotal: total,

    disciplinasConcluidas: concluidas,

    disciplinasAprovadas: aprovadas,

    disciplinasReprovadas: reprovadas,

    percentualConclusao: percentual,

    mensagem,
  };
}


// ============================================================
// FINALIZAR SEMESTRE
// ============================================================

export function finalizarSemestre(
  semestre: Semestre,
): Semestre {

  const disciplinas =
    atualizarDisciplinas(
      semestre.disciplinas,
    );

  const aprovado =
    disciplinas.every(
      (disciplina) =>
        disciplina.aprovada,
    );

  if (!aprovado) {
    return {
      ...semestre,

      disciplinas,

      finalizado: false,

      aprovado: false,

      status: "EM_ANDAMENTO",

      percentualConclusao:
        calcularPercentualSemestre({
          ...semestre,
          disciplinas,
        }),
    };
  }


  return {
    ...semestre,

    disciplinas,

    finalizado: true,

    aprovado: true,

    status: "FINALIZADO",

    percentualConclusao: 100,
  };
}


// ============================================================
// LIBERAR PRÓXIMO SEMESTRE
// ============================================================

export function liberarProximoSemestre(
  semestres: Semestre[],
  semestreAtual: number,
): Semestre[] {

  const resultado =
    semestres.map(
      (semestre) => ({
        ...semestre,
        disciplinas:
          semestre.disciplinas.map(
            (disciplina) => ({
              ...disciplina,
            }),
          ),
      }),
    );


  const semestre =
    resultado.find(
      (item) =>
        item.numero === semestreAtual,
    );


  if (!semestre) {
    return resultado;
  }


  if (
    !semestre.finalizado ||
    !semestre.aprovado
  ) {
    return resultado;
  }


  const proximoNumero =
    semestreAtual + 1;


  if (
    proximoNumero > TOTAL_SEMESTRES
  ) {
    return resultado;
  }


  const proximo =
    resultado.find(
      (item) =>
        item.numero === proximoNumero,
    );


  if (!proximo) {
    return resultado;
  }


  proximo.status = "DISPONIVEL";

  proximo.iniciado = false;

  return resultado;
}


// ============================================================
// AVANÇAR ALUNO
// ============================================================

export function avancarAluno(
  aluno: Aluno,
): Aluno {

  const semestreAtual =
    aluno.semestres.find(
      (semestre) =>
        semestre.numero ===
        aluno.semestreAtual,
    );


  if (!semestreAtual) {
    return aluno;
  }


  if (
    !podeAvancarSemestre(
      semestreAtual,
    )
  ) {
    return aluno;
  }


  if (
    aluno.semestreAtual >=
    TOTAL_SEMESTRES
  ) {
    return aluno;
  }


  const novoSemestre =
    aluno.semestreAtual + 1;


  const semestresAtualizados =
    aluno.semestres.map(
      (semestre) => {

        if (
          semestre.numero ===
          novoSemestre
        ) {
          return {
            ...semestre,

            status: "DISPONIVEL" as const,

            iniciado: true,
          };
        }

        return semestre;
      },
    );


  return {
    ...aluno,

    semestreAtual: novoSemestre,

    semestres:
      semestresAtualizados,
  };
}


// ============================================================
// INICIAR SEMESTRE
// ============================================================

export function iniciarSemestre(
  semestre: Semestre,
): Semestre {

  if (
    semestre.status ===
      "BLOQUEADO" ||
    semestre.finalizado
  ) {
    return semestre;
  }


  return {
    ...semestre,

    iniciado: true,

    status: "EM_ANDAMENTO",
  };
}


// ============================================================
// ATUALIZAR SEMESTRE
// ============================================================

export function atualizarSemestre(
  semestre: Semestre,
): Semestre {

  const disciplinas =
    atualizarDisciplinas(
      semestre.disciplinas,
    );

  const percentual =
    calcularPercentualSemestre({
      ...semestre,
      disciplinas,
    });


  const aprovado =
    disciplinas.length > 0 &&
    disciplinas.every(
      (disciplina) =>
        disciplina.aprovada,
    );


  let status =
    semestre.status;


  if (aprovado) {
    status = "APROVADO";
  } else if (
    semestre.iniciado
  ) {
    status = "EM_ANDAMENTO";
  }


  return {
    ...semestre,

    disciplinas,

    aprovado,

    percentualConclusao:
      percentual,

    status,
  };
}


// ============================================================
// ATUALIZAR TODOS OS SEMESTRES DO ALUNO
// ============================================================

export function atualizarSemestresAluno(
  aluno: Aluno,
): Aluno {

  let semestres =
    aluno.semestres.map(
      (semestre) =>
        atualizarSemestre(
          semestre,
        ),
    );


  // O primeiro semestre sempre
  // pode ser disponibilizado.

  semestres =
    semestres.map(
      (semestre) => {

        if (
          semestre.numero === 1 &&
          semestre.status ===
            "BLOQUEADO"
        ) {
          return {
            ...semestre,

            status: "DISPONIVEL" as const,
          };
        }

        return semestre;
      },
    );


  // Libera o próximo semestre
  // somente depois da aprovação.

  for (
    let numero = 1;
    numero < TOTAL_SEMESTRES;
    numero++
  ) {

    const atual =
      semestres.find(
        (semestre) =>
          semestre.numero ===
          numero,
      );

    if (
      atual &&
      atual.finalizado &&
      atual.aprovado
    ) {

      const proximo =
        numero + 1;

      semestres =
        semestres.map(
          (semestre) => {

            if (
              semestre.numero ===
              proximo
            ) {
              return {
                ...semestre,

                status:
                  "DISPONIVEL" as const,
              };
            }

            return semestre;
          },
        );
    }
  }


  return {
    ...aluno,

    semestres,
  };
}


// ============================================================
// VERIFICAR SE ALUNO CONCLUIU O CURSO
// ============================================================

export function cursoConcluido(
  aluno: Aluno,
): boolean {

  const ultimoSemestre =
    aluno.semestres.find(
      (semestre) =>
        semestre.numero ===
        TOTAL_SEMESTRES,
    );


  if (!ultimoSemestre) {
    return false;
  }


  return (
    ultimoSemestre.finalizado &&
    ultimoSemestre.aprovado &&
    todasDisciplinasAprovadas(
      ultimoSemestre,
    )
  );
}


// ============================================================
// OBTER SEMESTRE ATUAL DO ALUNO
// ============================================================

export function obterSemestreAtual(
  aluno: Aluno,
): Semestre | undefined {

  return aluno.semestres.find(
    (semestre) =>
      semestre.numero ===
      aluno.semestreAtual,
  );
}


// ============================================================
// OBTER PROGRESSO GERAL DO CURSO
// ============================================================

export function obterProgressoCurso(
  aluno: Aluno,
): number {

  const todas =
    aluno.semestres.flatMap(
      (semestre) =>
        semestre.disciplinas,
    );


  if (todas.length === 0) {
    return 0;
  }


  const aprovadas =
    todas.filter(
      (disciplina) =>
        disciplina.aprovada,
    ).length;


  return Math.round(
    (aprovadas / todas.length) *
      100,
  );
}