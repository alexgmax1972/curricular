"use client";

// ============================================================
// P.A.C.
// Plataforma de Atividade Curricular
//
// src/app/aluno/page.tsx
//
// ÁREA DO ESTUDANTE
//
// SISTEMA DE COMPETÊNCIAS
//
// A = PASSOU
// B = PASSOU
// C = PASSOU
// D = REPROVADO
//
// REGRA:
//
// A, B ou C em todas as disciplinas
//        ↓
// SEMESTRE FINALIZADO
//        ↓
// PRÓXIMO SEMESTRE LIBERADO
//
// D = REPROVADO
//        ↓
// SEMESTRE NÃO FINALIZADO
//        ↓
// PRÓXIMO SEMESTRE BLOQUEADO
// ============================================================

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Aluno,
  Semestre,
} from "../../types/academico";

import {
  obterSemestreAtual,
  obterProgressoCurso,
} from "../../utils/semestre";

import {
  CURRICULO,
  TOTAL_SEMESTRES,
} from "../../data/curriculo";

import FileUploader from "../../components/arquivos/FileUploader";

// ============================================================
// TIPOS
// ============================================================

type Competencia =
  | "A"
  | "B"
  | "C"
  | "D"
  | null;

type CompetenciaValida =
  Exclude<Competencia, null>;


// ============================================================
// INFORMAÇÕES DAS COMPETÊNCIAS
// ============================================================

const competenciaInfo: Record<
  CompetenciaValida,
  {
    titulo: string;
    descricao: string;
    classe: string;
  }
> = {
  A: {
    titulo: "A",
    descricao: "Excelente",
    classe: "competencia-a",
  },

  B: {
    titulo: "B",
    descricao: "Muito bom",
    classe: "competencia-b",
  },

  C: {
    titulo: "C",
    descricao: "Bom",
    classe: "competencia-c",
  },

  D: {
    titulo: "D",
    descricao: "Reprovado",
    classe: "competencia-d",
  },
};


// ============================================================
// CONCEITOS DISPONÍVEIS
// ============================================================

const CONCEITOS: CompetenciaValida[] = [
  "A",
  "B",
  "C",
  "D",
];


// ============================================================
// CONCEITO APROVADO
// ============================================================

function conceitoAprovado(
  competencia: Competencia,
): boolean {
  return (
    competencia === "A" ||
    competencia === "B" ||
    competencia === "C"
  );
}


// ============================================================
// CONCEITO VÁLIDO
// ============================================================

function conceitoValido(
  competencia: Competencia,
): competencia is CompetenciaValida {
  return (
    competencia === "A" ||
    competencia === "B" ||
    competencia === "C" ||
    competencia === "D"
  );
}


// ============================================================
// OBTER COMPETÊNCIA
//
// Compatibilidade com dados antigos:
//
// Se o sistema antigo tiver A/B/C/D em "nota",
// transferimos para "competencia".
//
// A propriedade nota continua numérica.
// ============================================================

function obterCompetencia(
  disciplina: {
    competencia?: Competencia;
    nota?: number | null;
  },
): Competencia {

  if (
    disciplina.competencia === "A" ||
    disciplina.competencia === "B" ||
    disciplina.competencia === "C" ||
    disciplina.competencia === "D"
  ) {
    return disciplina.competencia;
  }

  const valor =
    disciplina.nota as unknown;

  if (
    valor === "A" ||
    valor === "B" ||
    valor === "C" ||
    valor === "D"
  ) {
    return valor;
  }

  return null;
}


// ============================================================
// CRIAR SEMESTRES DO ALUNO
// ============================================================

function criarSemestresDoAluno(): Semestre[] {
  return CURRICULO.map(
    (semestre, index) => {

      const numero =
        semestre.numero ??
        index + 1;

      return {
        ...semestre,

        numero,

        status:
          numero === 1
            ? "DISPONIVEL"
            : "BLOQUEADO",

        iniciado:
          numero === 1,

        finalizado:
          false,

        aprovado:
          false,

        reprovado:
          false,

        percentualConclusao:
          0,

        disciplinas:
          semestre.disciplinas.map(
            (disciplina) => ({

              ...disciplina,

              competencia:
                disciplina.competencia ??
                null,

              nota:
                disciplina.nota ??
                null,

              aprovada:
                false,

              finalizada:
                false,

              reprovada:
                false,

              status:
                "PENDENTE" as const,
            }),
          ),
      };
    },
  );
}


// ============================================================
// CRIAR ALUNO INICIAL
// ============================================================

function criarAlunoInicial(): Aluno {
  return {
    id:
      "aluno-001",

    nomeCompleto:
      "Aluno",

    idade:
      18,

    ensinoMedioCompleto:
      true,

    usuario:
      "aluno",

    senha:
      "aluno",

    semestreAtual:
      1,

    semestres:
      criarSemestresDoAluno(),

    ativo:
      true,

    dataCadastro:
      new Date().toISOString(),
  };
}


// ============================================================
// NORMALIZAR ALUNO
// ============================================================

function normalizarAluno(
  alunoSalvo: Aluno,
): Aluno {

  const semestresBase =
    criarSemestresDoAluno();

  const semestresSalvos =
    Array.isArray(
      alunoSalvo.semestres,
    )
      ? alunoSalvo.semestres
      : [];

  const semestres =
    semestresBase.map(
      (base) => {

        const salvo =
          semestresSalvos.find(
            (item) =>
              item.numero ===
              base.numero,
          );

        if (!salvo) {
          return base;
        }

        return {
          ...base,

          ...salvo,

          numero:
            base.numero,

          disciplinas:
            base.disciplinas.map(
              (disciplinaBase) => {

                const disciplinaSalva =
                  Array.isArray(
                    salvo.disciplinas,
                  )
                    ? salvo.disciplinas.find(
                        (item) =>
                          item.id ===
                          disciplinaBase.id,
                      )
                    : undefined;

                if (
                  !disciplinaSalva
                ) {
                  return disciplinaBase;
                }

                const competencia =
                  obterCompetencia(
                    disciplinaSalva,
                  );

                const aprovada =
                  conceitoAprovado(
                    competencia,
                  );

                const finalizada =
                  conceitoValido(
                    competencia,
                  );

                const reprovada =
                  competencia ===
                  "D";

                return {
                  ...disciplinaBase,

                  ...disciplinaSalva,

                  competencia,

                  nota:
                    typeof disciplinaSalva.nota ===
                    "number"
                      ? disciplinaSalva.nota
                      : null,

                  aprovada,

                  finalizada,

                  reprovada,

                  status:
                    competencia === "D"
                      ? "REPROVADA" as const
                      : aprovada
                        ? "APROVADA" as const
                        : "PENDENTE" as const,
                };
              },
            ),
        };
      },
    );

  const semestreAtualSalvo =
    Number(
      alunoSalvo.semestreAtual,
    );

  const semestreAtual =
    Number.isInteger(
      semestreAtualSalvo,
    ) &&
    semestreAtualSalvo >= 1 &&
    semestreAtualSalvo <=
      TOTAL_SEMESTRES
      ? semestreAtualSalvo
      : 1;

  return {
    ...criarAlunoInicial(),

    ...alunoSalvo,

    semestreAtual,

    semestres,
  };
}


// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function AlunoPage() {

  const [
    aluno,
    setAluno,
  ] = useState<Aluno | null>(
    null,
  );

  const [
    menuAberto,
    setMenuAberto,
  ] = useState(false);

  const [
    mensagem,
    setMensagem,
  ] = useState("");

  const [
    tipoMensagem,
    setTipoMensagem,
  ] = useState<
    "sucesso" |
    "erro" |
    "info"
  >("info");


  // ==========================================================
  // CARREGAR ALUNO
  // ==========================================================

  useEffect(() => {

    try {

      const salvo =
        localStorage.getItem(
          "pac_aluno",
        );

      if (salvo) {

        const alunoSalvo =
          JSON.parse(
            salvo,
          ) as Aluno;

        const alunoNormalizado =
          normalizarAluno(
            alunoSalvo,
          );

        setAluno(
          alunoNormalizado,
        );

        localStorage.setItem(
          "pac_aluno",
          JSON.stringify(
            alunoNormalizado,
          ),
        );

        return;
      }

    } catch (error) {

      console.error(
        "Erro ao carregar aluno:",
        error,
      );
    }


    const novoAluno =
      criarAlunoInicial();

    localStorage.setItem(
      "pac_aluno",
      JSON.stringify(
        novoAluno,
      ),
    );

    setAluno(
      novoAluno,
    );

  }, []);


  // ==========================================================
  // SEMESTRE ATUAL
  // ==========================================================

  const semestreAtual =
    useMemo(() => {

      if (!aluno) {
        return undefined;
      }

      return obterSemestreAtual(
        aluno,
      );

    }, [aluno]);


  // ==========================================================
  // PROGRESSO
  // ==========================================================

  const progresso =
    useMemo(() => {

      if (!aluno) {
        return 0;
      }

      return obterProgressoCurso(
        aluno,
      );

    }, [aluno]);


  // ==========================================================
  // ESTATÍSTICAS
  // ==========================================================

  const estatisticas =
    useMemo(() => {

      if (!semestreAtual) {

        return {
          total: 0,
          aprovadas: 0,
          reprovadas: 0,
          pendentes: 0,
        };
      }


      const total =
        semestreAtual
          .disciplinas
          .length;


      const aprovadas =
        semestreAtual
          .disciplinas
          .filter(
            (disciplina) =>
              disciplina.aprovada ===
              true,
          )
          .length;


      const reprovadas =
        semestreAtual
          .disciplinas
          .filter(
            (disciplina) =>
              obterCompetencia(
                disciplina,
              ) === "D",
          )
          .length;


      const pendentes =
        Math.max(
          0,
          total -
            aprovadas -
            reprovadas,
        );


      return {
        total,
        aprovadas,
        reprovadas,
        pendentes,
      };

    }, [semestreAtual]);


  // ==========================================================
  // TODAS APROVADAS
  // ==========================================================

  const todasAprovadas =
    useMemo(() => {

      if (!semestreAtual) {
        return false;
      }

      if (
        semestreAtual
          .disciplinas
          .length === 0
      ) {
        return false;
      }

      return semestreAtual
        .disciplinas
        .every(
          (disciplina) =>
            conceitoAprovado(
              obterCompetencia(
                disciplina,
              ),
            ),
        );

    }, [semestreAtual]);


  // ==========================================================
  // SEMESTRE POSSUI D
  // ==========================================================

  const possuiReprovacao =
    useMemo(() => {

      if (!semestreAtual) {
        return false;
      }

      return semestreAtual
        .disciplinas
        .some(
          (disciplina) =>
            obterCompetencia(
              disciplina,
            ) === "D",
        );

    }, [semestreAtual]);


  // ==========================================================
  // SALVAR ALUNO
  // ==========================================================

  function salvarAluno(
    novoAluno: Aluno,
  ) {

    setAluno(
      novoAluno,
    );

    try {

      localStorage.setItem(
        "pac_aluno",
        JSON.stringify(
          novoAluno,
        ),
      );

    } catch (error) {

      console.error(
        "Erro ao salvar aluno:",
        error,
      );

      setTipoMensagem(
        "erro",
      );

      setMensagem(
        "Não foi possível salvar os dados do aluno.",
      );
    }
  }


  // ==========================================================
  // ALTERAR COMPETÊNCIA
  // ==========================================================

  function alterarCompetencia(
    disciplinaId: string,
    competencia: CompetenciaValida,
  ) {

    if (!aluno) {
      return;
    }


    const semestreDoAluno =
      aluno.semestres.find(
        (semestre) =>
          semestre.numero ===
          aluno.semestreAtual,
      );


    if (!semestreDoAluno) {

      setTipoMensagem(
        "erro",
      );

      setMensagem(
        "Não foi possível localizar o semestre atual.",
      );

      return;
    }


    if (
      semestreDoAluno.finalizado
    ) {

      setTipoMensagem(
        "info",
      );

      setMensagem(
        "Este semestre já foi finalizado e não pode mais ser alterado.",
      );

      return;
    }


    const aprovada =
      conceitoAprovado(
        competencia,
      );


    const reprovada =
      competencia === "D";


    const novosSemestres =
      aluno.semestres.map(
        (semestre) => {

          if (
            semestre.numero !==
            aluno.semestreAtual
          ) {
            return semestre;
          }


          const novasDisciplinas =
            semestre.disciplinas.map(
              (disciplina) => {

                if (
                  disciplina.id !==
                  disciplinaId
                ) {
                  return disciplina;
                }


                return {

                  ...disciplina,

                  competencia,

                  nota:
                    disciplina.nota ??
                    null,

                  aprovada,

                  finalizada:
                    true,

                  reprovada,

                  status:
                    reprovada
                      ? "REPROVADA" as const
                      : "APROVADA" as const,
                };
              },
            );


          const total =
            novasDisciplinas.length;


          const quantidadeFinalizada =
            novasDisciplinas.filter(
              (disciplina) =>
                conceitoValido(
                  obterCompetencia(
                    disciplina,
                  ),
                ),
            ).length;


          const percentual =
            total > 0
              ? Math.round(
                  (
                    quantidadeFinalizada /
                    total
                  ) *
                    100,
                )
              : 0;


          return {

            ...semestre,

            finalizado:
              false,

            aprovado:
              false,

            reprovado:
              novasDisciplinas.some(
                (disciplina) =>
                  obterCompetencia(
                    disciplina,
                  ) === "D",
              ),

            status:
              "EM_ANDAMENTO" as const,

            percentualConclusao:
              percentual,

            disciplinas:
              novasDisciplinas,
          };
        },
      );


    const novoAluno: Aluno = {

      ...aluno,

      semestres:
        novosSemestres,
    };


    salvarAluno(
      novoAluno,
    );


    if (
      competencia === "D"
    ) {

      setTipoMensagem(
        "erro",
      );

      setMensagem(
        "Disciplina registrada com conceito D — REPROVADO. O semestre não poderá ser finalizado.",
      );

      return;
    }


    setTipoMensagem(
      "sucesso",
    );

    setMensagem(
      `Conceito ${competencia} registrado. Disciplina aprovada.`,
    );
  }


  // ==========================================================
  // FINALIZAR SEMESTRE
  // ==========================================================

  function finalizarSemestre() {

    if (
      !aluno ||
      !semestreAtual
    ) {
      return;
    }


    if (
      semestreAtual.finalizado
    ) {

      setTipoMensagem(
        "info",
      );

      setMensagem(
        "Este semestre já foi finalizado.",
      );

      return;
    }


    const disciplinas =
      semestreAtual.disciplinas;


    if (
      disciplinas.length === 0
    ) {

      setTipoMensagem(
        "erro",
      );

      setMensagem(
        "Este semestre não possui disciplinas cadastradas.",
      );

      return;
    }


    const pendentes =
      disciplinas.filter(
        (disciplina) =>
          !conceitoValido(
            obterCompetencia(
              disciplina,
            ),
          ),
      );


    const reprovadas =
      disciplinas.filter(
        (disciplina) =>
          obterCompetencia(
            disciplina,
          ) === "D",
      );


    if (
      reprovadas.length > 0
    ) {

      setTipoMensagem(
        "erro",
      );

      setMensagem(
        `O semestre não pode ser finalizado. Existem ${reprovadas.length} disciplina(s) com conceito D — REPROVADO.`,
      );

      return;
    }


    if (
      pendentes.length > 0
    ) {

      setTipoMensagem(
        "info",
      );

      setMensagem(
        `O semestre não pode ser finalizado. Ainda existem ${pendentes.length} disciplina(s) sem conceito.`,
      );

      return;
    }


    const aprovadas =
      disciplinas.every(
        (disciplina) =>
          conceitoAprovado(
            obterCompetencia(
              disciplina,
            ),
          ),
      );


    if (!aprovadas) {

      setTipoMensagem(
        "erro",
      );

      setMensagem(
        "Todas as disciplinas precisam possuir conceito A, B ou C.",
      );

      return;
    }


    const numeroAtual =
      aluno.semestreAtual;


    const proximoNumero =
      numeroAtual + 1;


    const existemMaisSemestres =
      proximoNumero <=
      TOTAL_SEMESTRES;


    const novosSemestres =
      aluno.semestres.map(
        (semestre) => {

          // ==================================================
          // SEMESTRE ATUAL
          // ==================================================

          if (
            semestre.numero ===
            numeroAtual
          ) {

            return {

              ...semestre,

              finalizado:
                true,

              aprovado:
                true,

              reprovado:
                false,

              iniciado:
                true,

              status:
                "FINALIZADO" as const,

              percentualConclusao:
                100,

              disciplinas:
                semestre.disciplinas.map(
                  (disciplina) => ({

                    ...disciplina,

                    aprovada:
                      true,

                    finalizada:
                      true,

                    reprovada:
                      false,

                    status:
                      "APROVADA" as const,
                  }),
                ),
            };
          }


          // ==================================================
          // PRÓXIMO SEMESTRE
          // ==================================================

          if (
            semestre.numero ===
            proximoNumero
          ) {

            return {

              ...semestre,

              status:
                "DISPONIVEL" as const,

              iniciado:
                true,

              finalizado:
                false,

              aprovado:
                false,

              reprovado:
                false,
            };
          }


          return semestre;
        },
      );


    const novoAluno: Aluno = {

      ...aluno,

      semestreAtual:
        existemMaisSemestres
          ? proximoNumero
          : numeroAtual,

      semestres:
        novosSemestres,
    };


    salvarAluno(
      novoAluno,
    );


    if (
      !existemMaisSemestres
    ) {

      setTipoMensagem(
        "sucesso",
      );

      setMensagem(
        "🎓 Parabéns! Todos os semestres foram concluídos. Você finalizou sua formação acadêmica.",
      );

      return;
    }


    setTipoMensagem(
      "sucesso",
    );

    setMensagem(
      `🎉 ${numeroAtual}º semestre finalizado! ${proximoNumero}º semestre liberado.`,
    );
  }


  // ==========================================================
  // SAIR
  // ==========================================================

  function sair() {

    localStorage.removeItem(
      "pac_sessao",
    );

    window.location.href =
      "/login";
  }


  // ==========================================================
  // LOADING
  // ==========================================================

  if (!aluno) {

    return (

      <main className="loading">

        <div className="loading-box">

          <div className="spinner" />

          <h2>
            P.A.C.
          </h2>

          <p>
            Carregando área do aluno...
          </p>

        </div>

      </main>
    );
  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <main className="pac-page">

      {/* ================================================== */}
      {/* TOPBAR */}
      {/* ================================================== */}

      <header className="topbar">

        <div className="logo-area">

          <div className="logo">
            P.A.C.
          </div>

          <div className="logo-text">

            <strong>
              Plataforma de Atividade Curricular
            </strong>

            <span>
              Área do Estudante
            </span>

          </div>

        </div>


        <div className="user-area">

          <button
            type="button"
            className="user-button"
            onClick={() =>
              setMenuAberto(
                (valor) =>
                  !valor,
              )
            }
          >

            <span className="avatar">

              {(
                aluno.nomeCompleto ||
                "A"
              )
                .charAt(0)
                .toUpperCase()}

            </span>

            <span className="user-name">
              {aluno.nomeCompleto}
            </span>

            <span className="arrow">
              ▾
            </span>

          </button>


          {menuAberto && (

            <div className="user-menu">

              <button
                type="button"
                onClick={() =>
                  setMenuAberto(
                    false,
                  )
                }
              >
                Meu perfil
              </button>

              <button
                type="button"
                onClick={sair}
              >
                Sair
              </button>

            </div>

          )}

        </div>

      </header>


      {/* ================================================== */}
      {/* CONTEÚDO */}
      {/* ================================================== */}

      <section className="content">

        {/* ================================================= */}
        {/* BOAS-VINDAS */}
        {/* ================================================= */}

        <div className="welcome">

          <div>

            <span>
              ÁREA DO ESTUDANTE
            </span>

            <h1>
              Olá, {aluno.nomeCompleto}!
            </h1>

            <p>
              Acompanhe seu desempenho
              acadêmico na P.A.C.
            </p>

          </div>


          <div className="semester-badge">

            <span>
              SEMESTRE ATUAL
            </span>

            <strong>
              {aluno.semestreAtual}º
            </strong>

          </div>

        </div>


        {/* ================================================= */}
        {/* MENSAGEM */}
        {/* ================================================= */}

        {mensagem && (

          <div
            className={
              `message ${tipoMensagem}`
            }
          >

            <span>
              {mensagem}
            </span>

            <button
              type="button"
              aria-label="Fechar mensagem"
              onClick={() =>
                setMensagem("")
              }
            >
              ×
            </button>

          </div>

        )}


        {/* ================================================= */}
        {/* CARDS */}
        {/* ================================================= */}

        <div className="cards">

          <div className="card">

            <span>
              SEMESTRE
            </span>

            <strong>
              {aluno.semestreAtual}º
            </strong>

            <small>
              {semestreAtual?.finalizado
                ? "Finalizado"
                : "Em andamento"}
            </small>

          </div>


          <div className="card">

            <span>
              DISCIPLINAS
            </span>

            <strong>
              {estatisticas.aprovadas}/
              {estatisticas.total}
            </strong>

            <small>
              aprovadas
            </small>

          </div>


          <div className="card">

            <span>
              REPROVADAS
            </span>

            <strong>
              {estatisticas.reprovadas}
            </strong>

            <small>
              conceito D
            </small>

          </div>


          <div className="card">

            <span>
              PROGRESSO
            </span>

            <strong>
              {progresso}%
            </strong>

            <small>
              do curso
            </small>

          </div>

        </div>


        {/* ================================================= */}
        {/* PROGRESSO DO CURSO */}
        {/* ================================================= */}

        <section className="panel">

          <div className="panel-header">

            <div>

              <span>
                PROGRESSO DO CURSO
              </span>

              <h2>
                Sua formação acadêmica
              </h2>

            </div>

            <strong>
              {progresso}%
            </strong>

          </div>


          <div className="progress">

            <div
              className="progress-value"
              style={{
                width:
                  `${progresso}%`,
              }}
            />

          </div>


          <div className="semester-road">

            {Array.from(
              {
                length:
                  TOTAL_SEMESTRES,
              },
              (_, index) => {

                const numero =
                  index + 1;


                const semestre =
                  aluno.semestres.find(
                    (item) =>
                      item.numero ===
                      numero,
                  );


                const concluido =
                  semestre?.finalizado ??
                  false;


                const liberado =
                  semestre?.status ===
                    "DISPONIVEL" ||
                  semestre?.status ===
                    "EM_ANDAMENTO" ||
                  semestre?.status ===
                    "FINALIZADO" ||
                  numero <=
                    aluno.semestreAtual;


                return (

                  <div
                    key={numero}
                    className={
                      `road-item ${
                        concluido
                          ? "completed"
                          : liberado
                            ? "active"
                            : "locked"
                      }`
                    }
                  >

                    <div className="road-circle">

                      {concluido
                        ? "✓"
                        : liberado
                          ? numero
                          : "🔒"}

                    </div>

                    <span>
                      {numero}º
                    </span>

                  </div>
                );
              },
            )}

          </div>

        </section>


        {/* ================================================= */}
        {/* ARQUIVOS */}
        {/* ================================================= */}

        <section className="panel files-panel">

          <div className="panel-header">

            <div>

              <span>
                DOCUMENTOS
              </span>

              <h2>
                Meus arquivos
              </h2>

              <p className="panel-description">
                Envie e organize seus documentos
                acadêmicos dentro da P.A.C.
              </p>

            </div>


            <div className="files-icon">
              📁
            </div>

          </div>


          <div className="file-uploader-container">

            <FileUploader />

          </div>

        </section>


        {/* ================================================= */}
        {/* SEMESTRE ATUAL */}
        {/* ================================================= */}

        {semestreAtual && (

          <section className="panel">

            <div className="panel-header">

              <div>

                <span>
                  {semestreAtual.numero}º SEMESTRE
                </span>

                <h2>
                  Disciplinas
                </h2>

              </div>


              <div
                className={
                  `semester-status ${
                    semestreAtual.finalizado
                      ? "status-finalizado"
                      : todasAprovadas
                        ? "status-pronto"
                        : possuiReprovacao
                          ? "status-reprovado"
                          : "status-andamento"
                  }`
                }
              >

                {semestreAtual.finalizado
                  ? "✓ FINALIZADO"
                  : possuiReprovacao
                    ? "✕ POSSUI REPROVAÇÃO"
                    : todasAprovadas
                      ? "✓ PRONTO PARA FINALIZAR"
                      : "EM ANDAMENTO"}

              </div>

            </div>


            {/* ================================================= */}
            {/* DISCIPLINAS */}
            {/* ================================================= */}

            <div className="discipline-list">

              {semestreAtual.disciplinas.length ===
              0 ? (

                <div className="empty-state">

                  <strong>
                    Nenhuma disciplina encontrada.
                  </strong>

                  <span>
                    Verifique o cadastro do currículo.
                  </span>

                </div>

              ) : (

                semestreAtual.disciplinas.map(
                  (disciplina) => {

                    const conceito =
                      obterCompetencia(
                        disciplina,
                      );


                    const disciplinaAprovada =
                      conceitoAprovado(
                        conceito,
                      );


                    const disciplinaReprovada =
                      conceito === "D";


                    return (

                      <article
                        key={
                          disciplina.id
                        }
                        className={
                          `discipline ${
                            disciplinaAprovada
                              ? "discipline-passed"
                              : disciplinaReprovada
                                ? "discipline-failed"
                                : ""
                          }`
                        }
                      >

                        <div className="discipline-info">

                          <span className="code">
                            {disciplina.codigo}
                          </span>

                          <h3>
                            {disciplina.nome}
                          </h3>

                          <p>
                            Carga horária:{" "}
                            {disciplina.cargaHoraria}h
                          </p>

                        </div>


                        <div className="competencia-area">

                          <span>
                            COMPETÊNCIA
                          </span>


                          <div className="competencias">

                            {CONCEITOS.map(
                              (item) => (

                                <button
                                  type="button"
                                  key={item}
                                  title={
                                    competenciaInfo[
                                      item
                                    ].descricao
                                  }
                                  aria-label={
                                    `Conceito ${item}`
                                  }
                                  className={
                                    conceito ===
                                    item
                                      ? `selected ${competenciaInfo[item].classe}`
                                      : ""
                                  }
                                  onClick={() =>
                                    alterarCompetencia(
                                      disciplina.id,
                                      item,
                                    )
                                  }
                                  disabled={
                                    semestreAtual.finalizado
                                  }
                                >
                                  {item}
                                </button>

                              ),
                            )}

                          </div>

                        </div>


                        <div
                          className={
                            `result ${
                              disciplinaAprovada
                                ? "passed"
                                : disciplinaReprovada
                                  ? "failed"
                                  : "pending"
                            }`
                          }
                        >

                          {disciplinaAprovada
                            ? "✓ PASSOU"
                            : disciplinaReprovada
                              ? "✕ REPROVADO"
                              : "PENDENTE"}

                        </div>

                      </article>
                    );
                  },
                )

              )}

            </div>


            {/* ================================================= */}
            {/* FINALIZAÇÃO */}
            {/* ================================================= */}

            <div className="finish-area">

              <div>

                <strong>
                  Finalização do semestre
                </strong>

                <p>
                  Para avançar para o próximo
                  semestre, todas as disciplinas
                  precisam possuir conceito{" "}
                  <strong>
                    A, B ou C
                  </strong>.
                  <br />
                  O conceito{" "}
                  <strong>
                    D
                  </strong>{" "}
                  significa{" "}
                  <strong>
                    REPROVADO
                  </strong>.
                </p>


                <div className="finish-status">

                  <span
                    className={
                      estatisticas.pendentes > 0
                        ? "status-pendente"
                        : possuiReprovacao
                          ? "status-reprovado-mini"
                          : "status-ok"
                    }
                  >

                    {estatisticas.pendentes > 0
                      ? `⚠ ${estatisticas.pendentes} disciplina(s) pendente(s)`
                      : possuiReprovacao
                        ? "✕ Existe disciplina com conceito D"
                        : "✓ Todas as disciplinas possuem conceito"}

                  </span>

                </div>

              </div>


              <button
                type="button"
                className="finish-button"
                onClick={
                  finalizarSemestre
                }
                disabled={
                  semestreAtual.finalizado ||
                  !todasAprovadas
                }
              >

                {semestreAtual.finalizado
                  ? "✓ SEMESTRE FINALIZADO"
                  : todasAprovadas
                    ? "FINALIZAR SEMESTRE"
                    : "PREENCHA TODAS AS DISCIPLINAS"}

              </button>

            </div>

          </section>
        )}


        {/* ================================================= */}
        {/* SISTEMA DE AVALIAÇÃO */}
        {/* ================================================= */}

        <section className="panel legend-panel">

          <div className="panel-header">

            <div>

              <span>
                SISTEMA DE AVALIAÇÃO
              </span>

              <h2>
                Conceitos por competência
              </h2>

            </div>

          </div>


          <div className="legend">

            {CONCEITOS.map(
              (item) => (

                <div
                  key={item}
                  className="legend-item"
                >

                  <div
                    className={
                      `legend-letter ${competenciaInfo[item].classe}`
                    }
                  >
                    {item}
                  </div>


                  <div>

                    <strong>
                      {item === "D"
                        ? "REPROVADO"
                        : "PASSOU"}
                    </strong>

                    <span>
                      {competenciaInfo[item].descricao}
                    </span>

                  </div>

                </div>

              ),
            )}

          </div>

        </section>

      </section>


      {/* ================================================== */}
      {/* CSS */}
      {/* ================================================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .pac-page {
          min-height: 100vh;
          background: #f4f7f9;
          color: #18252d;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .topbar {
          height: 76px;

          background: #ffffff;

          border-bottom:
            1px solid #dce4e8;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding:
            0 40px;

          position: sticky;
          top: 0;

          z-index: 50;
        }

        .logo-area {
          display: flex;
          align-items: center;

          gap: 14px;
        }

        .logo {
          width: 48px;
          height: 48px;

          border-radius: 12px;

          background: #087f5b;
          color: #ffffff;

          display: flex;
          align-items: center;
          justify-content: center;

          font-weight: 900;
          font-size: 14px;

          box-shadow:
            0 5px 15px
            rgba(8,127,91,.16);
        }

        .logo-text {
          display: flex;
          flex-direction: column;

          gap: 3px;
        }

        .logo-text strong {
          font-size: 16px;
        }

        .logo-text span {
          color: #71808a;
          font-size: 12px;
        }

        .user-area {
          position: relative;
        }

        .user-button {
          border: 0;
          background: transparent;

          display: flex;
          align-items: center;

          gap: 10px;

          cursor: pointer;

          font-weight: 700;
          color: #18252d;
        }

        .avatar {
          width: 38px;
          height: 38px;

          border-radius: 50%;

          background: #dff5ec;
          color: #087f5b;

          display: flex;
          align-items: center;
          justify-content: center;

          font-weight: 900;
        }

        .arrow {
          color: #71808a;
          font-size: 12px;
        }

        .user-menu {
          position: absolute;

          right: 0;
          top: 48px;

          width: 180px;

          background: #ffffff;

          border:
            1px solid #dce4e8;

          border-radius: 10px;

          box-shadow:
            0 10px 30px
            rgba(0,0,0,.12);

          overflow: hidden;

          z-index: 100;
        }

        .user-menu button {
          width: 100%;

          border: 0;
          background: #ffffff;

          padding:
            13px 16px;

          text-align: left;

          cursor: pointer;

          color: #18252d;
          font-size: 13px;
        }

        .user-menu button:hover {
          background: #f1f5f3;
        }

        .content {
          width:
            min(
              1200px,
              calc(100% - 40px)
            );

          margin:
            0 auto;

          padding:
            36px 0 70px;
        }

        .welcome {
          display: flex;

          justify-content:
            space-between;

          align-items: center;

          gap: 20px;

          margin-bottom: 26px;
        }

        .welcome > div:first-child > span,
        .panel-header > div > span {
          color: #087f5b;

          font-size: 11px;

          font-weight: 900;

          letter-spacing: 1px;
        }

        .welcome h1 {
          margin:
            7px 0;

          font-size: 30px;

          line-height: 1.15;
        }

        .welcome p {
          margin: 0;

          color: #71808a;

          font-size: 14px;
        }

        .semester-badge {
          min-width: 150px;

          padding:
            18px;

          border-radius: 14px;

          background: #087f5b;

          color: #ffffff;

          display: flex;
          flex-direction: column;

          align-items: center;

          box-shadow:
            0 8px 20px
            rgba(8,127,91,.14);
        }

        .semester-badge span {
          color: #d8f5ea;

          font-size: 10px;

          font-weight: 800;
        }

        .semester-badge strong {
          font-size: 32px;

          margin-top: 3px;
        }

        .message {
          padding:
            14px 16px;

          border-radius: 10px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 15px;

          margin-bottom: 20px;

          font-size: 13px;

          font-weight: 700;
        }

        .message.sucesso {
          background: #e6f7ef;

          border:
            1px solid #b7e7d2;

          color: #146c4d;
        }

        .message.erro {
          background: #fbe9e7;

          border:
            1px solid #f0b9b3;

          color: #a52d22;
        }

        .message.info {
          background: #eaf2f7;

          border:
            1px solid #c7dbe6;

          color: #345d70;
        }

        .message button {
          border: 0;

          background: transparent;

          cursor: pointer;

          font-size: 20px;

          line-height: 1;

          color: inherit;
        }

        .cards {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 16px;

          margin-bottom: 20px;
        }

        .card {
          background: #ffffff;

          border:
            1px solid #dce4e8;

          border-radius: 14px;

          padding: 20px;

          display: flex;

          flex-direction: column;

          gap: 6px;

          transition:
            transform .2s ease,
            box-shadow .2s ease;
        }

        .card:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 8px 24px
            rgba(30,50,60,.06);
        }

        .card span {
          font-size: 10px;

          font-weight: 900;

          color: #75848d;

          letter-spacing: 1px;
        }

        .card strong {
          font-size: 28px;

          line-height: 1.1;
        }

        .card small {
          color: #7b8991;

          font-size: 12px;
        }

        .panel {
          background: #ffffff;

          border:
            1px solid #dce4e8;

          border-radius: 16px;

          margin-bottom: 20px;

          padding: 24px;

          box-shadow:
            0 3px 12px
            rgba(30,50,60,.025);
        }

        .panel-header {
          display: flex;

          justify-content:
            space-between;

          align-items: center;

          gap: 20px;

          margin-bottom: 22px;
        }

        .panel-header h2 {
          margin:
            5px 0 0;

          font-size: 21px;
        }

        .panel-header > strong {
          font-size: 26px;

          color: #087f5b;
        }

        .panel-description {
          margin:
            7px 0 0;

          color: #71808a;

          font-size: 12px;
        }

        .files-panel {
          overflow: hidden;
        }

        .files-icon {
          width: 46px;
          height: 46px;

          border-radius: 12px;

          background: #e6f7ef;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 21px;
        }

        .file-uploader-container {
          border:
            1px solid #e1e8eb;

          border-radius: 12px;

          background: #fafcfd;

          padding: 16px;

          overflow: hidden;
        }

        .progress {
          width: 100%;

          height: 10px;

          background: #e6ecef;

          border-radius: 20px;

          overflow: hidden;
        }

        .progress-value {
          height: 100%;

          background: #087f5b;

          border-radius: 20px;

          transition:
            width .4s ease;
        }

        .semester-road {
          display: grid;

          grid-template-columns:
            repeat(
              auto-fit,
              minmax(55px, 1fr)
            );

          gap: 10px;

          margin-top: 25px;
        }

        .road-item {
          display: flex;

          flex-direction: column;

          align-items: center;

          gap: 7px;

          color: #89969d;

          font-size: 11px;

          font-weight: 800;
        }

        .road-circle {
          width: 38px;
          height: 38px;

          border-radius: 50%;

          border:
            2px solid #dce4e8;

          display: flex;

          align-items: center;

          justify-content: center;

          background: #ffffff;

          font-size: 12px;

          font-weight: 900;
        }

        .road-item.active .road-circle {
          border-color: #087f5b;

          color: #087f5b;

          box-shadow:
            0 0 0 4px
            rgba(8,127,91,.08);
        }

        .road-item.completed .road-circle {
          background: #087f5b;

          border-color: #087f5b;

          color: #ffffff;
        }

        .road-item.locked {
          color: #a4afb5;
        }

        .road-item.locked .road-circle {
          background: #f5f7f8;

          color: #a4afb5;
        }

        .semester-status {
          font-size: 10px;

          font-weight: 900;

          padding:
            7px 10px;

          border-radius: 20px;

          white-space: nowrap;
        }

        .status-finalizado,
        .status-pronto {
          color: #087f5b;

          background: #e5f6ee;
        }

        .status-andamento {
          color: #a8630b;

          background: #fff3d9;
        }

        .status-reprovado {
          color: #a52d22;

          background: #fae8e6;
        }

        .discipline-list {
          display: flex;

          flex-direction: column;

          gap: 12px;
        }

        .discipline {
          border:
            1px solid #e0e7ea;

          border-radius: 12px;

          padding: 16px;

          display: grid;

          grid-template-columns:
            1fr auto auto;

          align-items: center;

          gap: 20px;

          transition:
            border-color .2s ease,
            box-shadow .2s ease;
        }

        .discipline:hover {
          border-color: #c9d7d1;

          box-shadow:
            0 4px 14px
            rgba(30,50,60,.04);
        }

        .discipline-passed {
          border-color: #cbe8db;
        }

        .discipline-failed {
          border-color: #efc7c2;
        }

        .discipline-info .code {
          color: #087f5b;

          font-size: 10px;

          font-weight: 900;

          letter-spacing: .5px;
        }

        .discipline-info h3 {
          margin:
            5px 0;

          font-size: 15px;
        }

        .discipline-info p {
          margin: 0;

          color: #829099;

          font-size: 12px;
        }

        .competencia-area {
          display: flex;

          flex-direction: column;

          gap: 7px;
        }

        .competencia-area > span {
          font-size: 9px;

          color: #829099;

          font-weight: 900;

          letter-spacing: .5px;
        }

        .competencias {
          display: flex;

          gap: 5px;
        }

        .competencias button {
          width: 38px;

          height: 38px;

          border:
            1px solid #d4dde1;

          border-radius: 8px;

          background: #ffffff;

          cursor: pointer;

          font-weight: 900;

          color: #34444c;

          transition:
            all .2s ease;
        }

        .competencias button:hover {
          border-color: #087f5b;

          transform:
            translateY(-1px);
        }

        .competencias button.selected {
          color: #ffffff;

          border-color: transparent;

          transform:
            translateY(-1px);

          box-shadow:
            0 4px 10px
            rgba(0,0,0,.12);
        }

        .competencias button:disabled {
          cursor: not-allowed;

          opacity: .65;

          transform: none;
        }

        .competencia-a {
          background:
            #087f5b !important;
        }

        .competencia-b {
          background:
            #1971c2 !important;
        }

        .competencia-c {
          background:
            #d68910 !important;
        }

        .competencia-d {
          background:
            #c0392b !important;
        }

        .result {
          min-width: 115px;

          text-align: center;

          font-size: 10px;

          font-weight: 900;

          padding:
            8px 10px;

          border-radius: 20px;
        }

        .result.passed {
          background: #e3f5ed;

          color: #087f5b;
        }

        .result.failed {
          background: #fae8e6;

          color: #a52d22;
        }

        .result.pending {
          background: #eef2f4;

          color: #74828a;
        }

        .empty-state {
          padding: 30px;

          border:
            1px dashed #ccd8dd;

          border-radius: 12px;

          background: #f9fbfc;

          text-align: center;

          display: flex;

          flex-direction: column;

          gap: 5px;
        }

        .empty-state strong {
          font-size: 14px;
        }

        .empty-state span {
          color: #7b8991;

          font-size: 12px;
        }

        .finish-area {
          margin-top: 22px;

          padding-top: 22px;

          border-top:
            1px solid #e4eaed;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 20px;
        }

        .finish-area > div {
          flex: 1;
        }

        .finish-area > div > strong {
          font-size: 14px;
        }

        .finish-area p {
          margin:
            6px 0 0;

          color: #71808a;

          font-size: 12px;

          line-height: 1.7;
        }

        .finish-status {
          margin-top: 10px;
        }

        .finish-status span {
          display: inline-block;

          padding:
            6px 9px;

          border-radius: 20px;

          font-size: 10px;

          font-weight: 800;
        }

        .status-pendente {
          background: #fff3d9;

          color: #a8630b;
        }

        .status-ok {
          background: #e5f6ee;

          color: #087f5b;
        }

        .status-reprovado-mini {
          background: #fae8e6;

          color: #a52d22;
        }

        .finish-button {
          border: 0;

          background: #087f5b;

          color: #ffffff;

          padding:
            13px 18px;

          border-radius: 9px;

          cursor: pointer;

          font-weight: 900;

          white-space: nowrap;

          transition:
            background .2s ease,
            transform .2s ease;
        }

        .finish-button:hover:not(:disabled) {
          background: #066b4d;

          transform:
            translateY(-1px);
        }

        .finish-button:disabled {
          opacity: .6;

          cursor: not-allowed;
        }

        .legend {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 12px;
        }

        .legend-item {
          display: flex;

          align-items: center;

          gap: 10px;

          border:
            1px solid #e1e7ea;

          padding: 12px;

          border-radius: 10px;
        }

        .legend-letter {
          width: 38px;

          height: 38px;

          flex-shrink: 0;

          border-radius: 8px;

          color: #ffffff;

          display: flex;

          align-items: center;

          justify-content: center;

          font-weight: 900;
        }

        .legend-item strong,
        .legend-item span {
          display: block;
        }

        .legend-item strong {
          font-size: 12px;
        }

        .legend-item span {
          margin-top: 3px;

          color: #849199;

          font-size: 10px;
        }

        .loading {
          min-height: 100vh;

          display: flex;

          align-items: center;

          justify-content: center;

          background: #f4f7f9;
        }

        .loading-box {
          text-align: center;
        }

        .loading-box h2 {
          margin:
            10px 0 5px;

          color: #087f5b;
        }

        .loading-box p {
          color: #71808a;
        }

        .spinner {
          width: 38px;

          height: 38px;

          border:
            4px solid #d8e8e2;

          border-top-color:
            #087f5b;

          border-radius: 50%;

          animation:
            spin 1s linear infinite;

          margin:
            0 auto 15px;
        }

        @keyframes spin {
          to {
            transform:
              rotate(360deg);
          }
        }

        @media (max-width: 900px) {

          .cards {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .discipline {
            grid-template-columns:
              1fr;

            gap: 14px;
          }

          .result {
            width: 100%;
          }

          .legend {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .semester-road {
            grid-template-columns:
              repeat(
                4,
                1fr
              );
          }
        }

        @media (max-width: 600px) {

          .topbar {
            height: 64px;

            padding:
              0 15px;
          }

          .logo {
            width: 42px;

            height: 42px;

            border-radius: 10px;
          }

          .logo-text {
            display: none;
          }

          .user-name {
            max-width: 110px;

            overflow: hidden;

            text-overflow: ellipsis;

            white-space: nowrap;
          }

          .content {
            width:
              calc(100% - 24px);

            padding-top: 22px;
          }

          .welcome {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .welcome h1 {
            font-size: 25px;
          }

          .semester-badge {
            width: 100%;
          }

          .cards {
            grid-template-columns:
              repeat(2, 1fr);

            gap: 10px;
          }

          .card {
            padding: 15px;
          }

          .card strong {
            font-size: 23px;
          }

          .semester-road {
            overflow-x: auto;

            display: flex;

            gap: 18px;

            padding-bottom: 8px;
          }

          .road-item {
            min-width: 48px;
          }

          .panel {
            padding: 17px;
          }

          .panel-header {
            align-items:
              flex-start;

            flex-direction:
              column;

            gap: 10px;
          }

          .panel-header > strong {
            align-self:
              flex-start;
          }

          .discipline {
            padding: 14px;
          }

          .competencias {
            width: 100%;
          }

          .competencias button {
            flex: 1;
          }

          .finish-area {
            flex-direction:
              column;

            align-items:
              stretch;
          }

          .finish-button {
            width: 100%;
          }

          .legend {
            grid-template-columns:
              1fr;
          }

          .file-uploader-container {
            padding: 10px;
          }

          .files-icon {
            display: none;
          }
        }

      `}</style>

    </main>
  );
}