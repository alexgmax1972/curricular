"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";

/* ============================================================
   P.A.C.
   Plataforma de Atividade Curricular

   app/professor/page.tsx

   ÁREA DO PROFESSOR

   CONFIGURAÇÃO INCORPORADA NESTA MESMA PÁGINA
============================================================ */

type Secao =
  | "inicio"
  | "alunos"
  | "atividades"
  | "entregas"
  | "notas"
  | "configuracao";

interface Professor {
  nome: string;
  usuario: string;
  senha?: string;
  disciplina?: string;
  tipo?: "professor";
  dataCadastro?: string;
}

interface Aluno {
  nome: string;
  idade?: number;
  usuario: string;
  senha?: string;
  tipo?: "aluno";
  dataCadastro?: string;
}

interface Atividade {
  id: number;
  titulo: string;
  descricao: string;
  disciplina: string;
  prazo: string;
  status: "ATIVA" | "ENCERRADA";
  dataCriacao: string;
}

interface Entrega {
  id: number;
  aluno: string;
  atividade: string;
  data: string;
  nota?: number;
  status: "ENTREGUE" | "CORRIGIDA" | "PENDENTE";
}

/* ============================================================
   COMPONENTE PRINCIPAL
============================================================ */

export default function ProfessorPage() {
  const router = useRouter();

  /* ============================================================
     NAVEGAÇÃO
  ============================================================ */

  const [secao, setSecao] = useState<Secao>("inicio");
  const [menuAberto, setMenuAberto] = useState(false);

  /* ============================================================
     DADOS
  ============================================================ */

  const [professor, setProfessor] = useState<Professor | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [entregas, setEntregas] = useState<Entrega[]>([]);

  /* ============================================================
     CONFIGURAÇÃO
  ============================================================ */

  const [nomeExibicao, setNomeExibicao] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [email, setEmail] = useState("");

  const [notificacoes, setNotificacoes] = useState(true);
  const [mostrarEmail, setMostrarEmail] = useState(false);
  const [modoCompacto, setModoCompacto] = useState(false);

  const [mensagemConfig, setMensagemConfig] = useState("");

  /* ============================================================
     NOVA ATIVIDADE
  ============================================================ */

  const [mostrarNovaAtividade, setMostrarNovaAtividade] =
    useState(false);

  const [tituloAtividade, setTituloAtividade] = useState("");
  const [descricaoAtividade, setDescricaoAtividade] =
    useState("");
  const [prazoAtividade, setPrazoAtividade] = useState("");

  /* ============================================================
     CARREGAMENTO
  ============================================================ */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const tipoUsuario =
      sessionStorage.getItem("pac_tipo_usuario");

    const usuario =
      sessionStorage.getItem("pac_usuario");

    /*
      Se não estiver logado como professor,
      volta para o login.
    */
    if (tipoUsuario !== "professor" || !usuario) {
      router.replace("/login");
      return;
    }

    /* ========================================================
       PROFESSORES
    ======================================================== */

    let professoresSalvos: Professor[] = [];

    try {
      professoresSalvos = JSON.parse(
        localStorage.getItem("pac_professores") || "[]"
      );
    } catch {
      professoresSalvos = [];
    }

    const professorEncontrado = professoresSalvos.find(
      (p) => p.usuario === usuario
    );

    if (professorEncontrado) {
      setProfessor(professorEncontrado);

      setNomeExibicao(
        professorEncontrado.nome || ""
      );

      setDisciplina(
        professorEncontrado.disciplina || ""
      );
    } else {
      const professorPadrao: Professor = {
        nome: usuario,
        usuario,
        tipo: "professor",
      };

      setProfessor(professorPadrao);
      setNomeExibicao(usuario);
    }

    /* ========================================================
       ALUNOS
    ======================================================== */

    try {
      const alunosSalvos: Aluno[] = JSON.parse(
        localStorage.getItem("pac_alunos") || "[]"
      );

      setAlunos(alunosSalvos);
    } catch {
      setAlunos([]);
    }

    /* ========================================================
       ATIVIDADES
    ======================================================== */

    try {
      const atividadesSalvas: Atividade[] = JSON.parse(
        localStorage.getItem("pac_atividades") || "[]"
      );

      setAtividades(atividadesSalvas);
    } catch {
      setAtividades([]);
    }

    /* ========================================================
       ENTREGAS
    ======================================================== */

    try {
      const entregasSalvas: Entrega[] = JSON.parse(
        localStorage.getItem("pac_entregas") || "[]"
      );

      setEntregas(entregasSalvas);
    } catch {
      setEntregas([]);
    }

    /* ========================================================
       CONFIGURAÇÃO DO PROFESSOR
    ======================================================== */

    try {
      const configuracaoSalva = JSON.parse(
        localStorage.getItem(
          `pac_config_professor_${usuario}`
        ) || "{}"
      );

      if (configuracaoSalva.email !== undefined) {
        setEmail(configuracaoSalva.email);
      }

      if (
        configuracaoSalva.notificacoes !== undefined
      ) {
        setNotificacoes(
          configuracaoSalva.notificacoes
        );
      }

      if (
        configuracaoSalva.mostrarEmail !== undefined
      ) {
        setMostrarEmail(
          configuracaoSalva.mostrarEmail
        );
      }

      if (
        configuracaoSalva.modoCompacto !== undefined
      ) {
        setModoCompacto(
          configuracaoSalva.modoCompacto
        );
      }
    } catch {
      /* configuração ainda não existe */
    }
  }, [router]);

  /* ============================================================
     ESTATÍSTICAS
  ============================================================ */

  const atividadesAtivas = useMemo(() => {
    return atividades.filter(
      (atividade) =>
        atividade.status === "ATIVA"
    ).length;
  }, [atividades]);

  const entregasPendentes = useMemo(() => {
    return entregas.filter(
      (entrega) =>
        entrega.status === "ENTREGUE"
    ).length;
  }, [entregas]);

  const entregasCorrigidas = useMemo(() => {
    return entregas.filter(
      (entrega) =>
        entrega.status === "CORRIGIDA"
    ).length;
  }, [entregas]);

  /* ============================================================
     SALVAR CONFIGURAÇÃO
  ============================================================ */

  function salvarConfiguracao() {
    if (!professor) return;

    const configuracao = {
      email,
      notificacoes,
      mostrarEmail,
      modoCompacto,
    };

    localStorage.setItem(
      `pac_config_professor_${professor.usuario}`,
      JSON.stringify(configuracao)
    );

    let professoresSalvos: Professor[] = [];

    try {
      professoresSalvos = JSON.parse(
        localStorage.getItem("pac_professores") || "[]"
      );
    } catch {
      professoresSalvos = [];
    }

    const professoresAtualizados =
      professoresSalvos.map((p) => {
        if (p.usuario === professor.usuario) {
          return {
            ...p,
            nome: nomeExibicao,
            disciplina,
          };
        }

        return p;
      });

    /*
      Caso o professor ainda não esteja na lista,
      adiciona.
    */
    const professorExiste =
      professoresAtualizados.some(
        (p) => p.usuario === professor.usuario
      );

    if (!professorExiste) {
      professoresAtualizados.push({
        ...professor,
        nome: nomeExibicao,
        disciplina,
      });
    }

    localStorage.setItem(
      "pac_professores",
      JSON.stringify(
        professoresAtualizados
      )
    );

    setProfessor({
      ...professor,
      nome: nomeExibicao,
      disciplina,
    });

    setMensagemConfig(
      "Configurações salvas com sucesso."
    );

    setTimeout(() => {
      setMensagemConfig("");
    }, 3000);
  }

  /* ============================================================
     CRIAR ATIVIDADE
  ============================================================ */

  function criarAtividade() {
    if (!tituloAtividade.trim()) {
      alert("Informe o título da atividade.");
      return;
    }

    if (!descricaoAtividade.trim()) {
      alert("Informe a descrição da atividade.");
      return;
    }

    if (!prazoAtividade) {
      alert("Informe o prazo da atividade.");
      return;
    }

    const novaAtividade: Atividade = {
      id: Date.now(),
      titulo: tituloAtividade.trim(),
      descricao: descricaoAtividade.trim(),
      disciplina:
        disciplina ||
        professor?.disciplina ||
        "Não informada",
      prazo: prazoAtividade,
      status: "ATIVA",
      dataCriacao:
        new Date().toLocaleDateString("pt-BR"),
    };

    const novasAtividades = [
      ...atividades,
      novaAtividade,
    ];

    setAtividades(novasAtividades);

    localStorage.setItem(
      "pac_atividades",
      JSON.stringify(novasAtividades)
    );

    setTituloAtividade("");
    setDescricaoAtividade("");
    setPrazoAtividade("");
    setMostrarNovaAtividade(false);
  }

  /* ============================================================
     SAIR
  ============================================================ */

  function sair() {
    sessionStorage.removeItem(
      "pac_tipo_usuario"
    );

    sessionStorage.removeItem(
      "pac_usuario"
    );

    router.replace("/login");
  }

  /* ============================================================
     SELECIONAR MENU
  ============================================================ */

  function selecionarSecao(
    secaoSelecionada: Secao
  ) {
    setSecao(secaoSelecionada);
    setMenuAberto(false);
  }

  /* ============================================================
     CARREGAMENTO
  ============================================================ */

  if (!professor) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f7f8",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            padding: "35px",
            borderRadius: "15px",
            boxShadow:
              "0 5px 25px rgba(0,0,0,.08)",
          }}
        >
          Carregando área do professor...
        </div>
      </main>
    );
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7f8",
        fontFamily:
          "Arial, Helvetica, sans-serif",
        color: "#1f2937",
      }}
    >
      {/* ======================================================
          CABEÇALHO
      ====================================================== */}

      <header
        style={{
          background: "#087f5b",
          color: "#fff",
          minHeight: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 25px",
          boxShadow:
            "0 2px 10px rgba(0,0,0,.15)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <button
            onClick={() =>
              setMenuAberto(!menuAberto)
            }
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "28px",
              cursor: "pointer",
            }}
            aria-label="Abrir menu"
          >
            ☰
          </button>

          <div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "800",
              }}
            >
              P.A.C.
            </div>

            <div
              style={{
                fontSize: "11px",
                opacity: 0.85,
              }}
            >
              Plataforma de Atividade Curricular
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <div
            style={{
              textAlign: "right",
            }}
          >
            <strong>
              {professor.nome}
            </strong>

            <div
              style={{
                fontSize: "12px",
                opacity: 0.85,
              }}
            >
              Professor
            </div>
          </div>

          <button
            onClick={sair}
            style={{
              background: "#ffffff",
              color: "#087f5b",
              border: "none",
              borderRadius: "8px",
              padding: "10px 15px",
              cursor: "pointer",
              fontWeight: "700",
            }}
          >
            Sair
          </button>
        </div>
      </header>

      {/* ======================================================
          MENU LATERAL
      ====================================================== */}

      {menuAberto && (
        <>
          {/* Fundo para fechar o menu */}

          <div
            onClick={() => setMenuAberto(false)}
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(0,0,0,.15)",
              zIndex: 25,
            }}
          />

          <aside
            style={{
              position: "fixed",
              left: 0,
              top: 72,
              bottom: 0,
              width: "270px",
              background: "#ffffff",
              boxShadow:
                "4px 0 15px rgba(0,0,0,.12)",
              zIndex: 30,
              padding: "20px 15px",
              boxSizing: "border-box",
            }}
          >
            <MenuItem
              texto="Início"
              icone="🏠"
              ativo={secao === "inicio"}
              onClick={() =>
                selecionarSecao("inicio")
              }
            />

            <MenuItem
              texto="Alunos"
              icone="👨‍🎓"
              ativo={secao === "alunos"}
              onClick={() =>
                selecionarSecao("alunos")
              }
            />

            <MenuItem
              texto="Atividades"
              icone="📚"
              ativo={secao === "atividades"}
              onClick={() =>
                selecionarSecao("atividades")
              }
            />

            <MenuItem
              texto="Entregas"
              icone="📥"
              ativo={secao === "entregas"}
              onClick={() =>
                selecionarSecao("entregas")
              }
            />

            <MenuItem
              texto="Notas"
              icone="📝"
              ativo={secao === "notas"}
              onClick={() =>
                selecionarSecao("notas")
              }
            />

            <div
              style={{
                height: 1,
                background: "#e5e7eb",
                margin: "15px 5px",
              }}
            />

            {/* ==================================================
                CONFIGURAÇÃO
            ================================================== */}

            <MenuItem
              texto="Configuração"
              icone="⚙️"
              ativo={
                secao === "configuracao"
              }
              onClick={() =>
                selecionarSecao(
                  "configuracao"
                )
              }
            />
          </aside>
        </>
      )}

      {/* ======================================================
          CONTEÚDO
      ====================================================== */}

      <section
        style={{
          maxWidth: "1250px",
          margin: "0 auto",
          padding: modoCompacto
            ? "20px"
            : "35px 25px",
        }}
      >
        {/* ====================================================
            INÍCIO
        ==================================================== */}

        {secao === "inicio" && (
          <>
            <div
              style={{
                marginBottom: "30px",
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: "30px",
                }}
              >
                Olá, Professor!
              </h1>

              <p
                style={{
                  color: "#6b7280",
                  marginTop: "8px",
                }}
              >
                Bem-vindo à área do professor
                do P.A.C.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
              }}
            >
              <Card
                titulo="Alunos"
                valor={alunos.length}
                icone="👨‍🎓"
              />

              <Card
                titulo="Atividades ativas"
                valor={atividadesAtivas}
                icone="📚"
              />

              <Card
                titulo="Entregas pendentes"
                valor={entregasPendentes}
                icone="📥"
              />

              <Card
                titulo="Entregas corrigidas"
                valor={entregasCorrigidas}
                icone="✅"
              />
            </div>

            <div
              style={{
                marginTop: "30px",
                background: "#fff",
                borderRadius: "15px",
                padding: "25px",
                boxShadow:
                  "0 3px 15px rgba(0,0,0,.06)",
              }}
            >
              <h2>Resumo</h2>

              <p>
                Disciplina:{" "}
                <strong>
                  {professor.disciplina ||
                    disciplina ||
                    "Não informada"}
                </strong>
              </p>

              <p>
                Professor:{" "}
                <strong>
                  {professor.nome}
                </strong>
              </p>
            </div>
          </>
        )}

        {/* ====================================================
            ALUNOS
        ==================================================== */}

        {secao === "alunos" && (
          <>
            <Titulo
              titulo="Alunos"
              descricao="Alunos cadastrados na plataforma."
            />

            <div
              style={{
                background: "#fff",
                borderRadius: "15px",
                overflow: "hidden",
                boxShadow:
                  "0 3px 15px rgba(0,0,0,.06)",
              }}
            >
              {alunos.length === 0 ? (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  Nenhum aluno cadastrado.
                </div>
              ) : (
                alunos.map(
                  (aluno, index) => (
                    <div
                      key={`${aluno.usuario}-${index}`}
                      style={{
                        padding: "18px 22px",
                        borderBottom:
                          "1px solid #e5e7eb",
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: "15px",
                      }}
                    >
                      <div>
                        <strong>
                          {aluno.nome}
                        </strong>

                        <div
                          style={{
                            fontSize: "13px",
                            color: "#6b7280",
                          }}
                        >
                          Usuário:{" "}
                          {aluno.usuario}
                        </div>
                      </div>

                      <span
                        style={{
                          background: "#e6fcf5",
                          color: "#087f5b",
                          padding:
                            "6px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        ALUNO
                      </span>
                    </div>
                  )
                )
              )}
            </div>
          </>
        )}

        {/* ====================================================
            ATIVIDADES
        ==================================================== */}

        {secao === "atividades" && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
                marginBottom: "25px",
              }}
            >
              <Titulo
                titulo="Atividades"
                descricao="Gerencie as atividades da disciplina."
              />

              <button
                onClick={() =>
                  setMostrarNovaAtividade(
                    !mostrarNovaAtividade
                  )
                }
                style={botaoPrincipal}
              >
                + Nova atividade
              </button>
            </div>

            {mostrarNovaAtividade && (
              <div
                style={{
                  background: "#fff",
                  padding: "25px",
                  borderRadius: "15px",
                  marginBottom: "25px",
                  boxShadow:
                    "0 3px 15px rgba(0,0,0,.06)",
                }}
              >
                <h2>Nova atividade</h2>

                <input
                  placeholder="Título da atividade"
                  value={tituloAtividade}
                  onChange={(e) =>
                    setTituloAtividade(
                      e.target.value
                    )
                  }
                  style={inputStyle}
                />

                <textarea
                  placeholder="Descrição da atividade"
                  value={descricaoAtividade}
                  onChange={(e) =>
                    setDescricaoAtividade(
                      e.target.value
                    )
                  }
                  style={{
                    ...inputStyle,
                    minHeight: "110px",
                    resize: "vertical",
                  }}
                />

                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Prazo
                </label>

                <input
                  type="date"
                  value={prazoAtividade}
                  onChange={(e) =>
                    setPrazoAtividade(
                      e.target.value
                    )
                  }
                  style={inputStyle}
                />

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "15px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={criarAtividade}
                    style={botaoPrincipal}
                  >
                    Salvar atividade
                  </button>

                  <button
                    onClick={() =>
                      setMostrarNovaAtividade(
                        false
                      )
                    }
                    style={botaoSecundario}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {atividades.length === 0 ? (
              <div style={painelStyle}>
                <p
                  style={{
                    color: "#6b7280",
                    textAlign: "center",
                  }}
                >
                  Nenhuma atividade cadastrada.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                {atividades.map(
                  (atividade) => (
                    <div
                      key={atividade.id}
                      style={painelStyle}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#087f5b",
                        }}
                      >
                        {atividade.status}
                      </span>

                      <h3>
                        {atividade.titulo}
                      </h3>

                      <p
                        style={{
                          color: "#6b7280",
                        }}
                      >
                        {atividade.descricao}
                      </p>

                      <p>
                        <strong>
                          Disciplina:
                        </strong>{" "}
                        {atividade.disciplina}
                      </p>

                      <p>
                        <strong>
                          Prazo:
                        </strong>{" "}
                        {atividade.prazo}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </>
        )}

        {/* ====================================================
            ENTREGAS
        ==================================================== */}

        {secao === "entregas" && (
          <>
            <Titulo
              titulo="Entregas"
              descricao="Acompanhe as atividades enviadas pelos alunos."
            />

            <div
              style={{
                background: "#fff",
                borderRadius: "15px",
                overflow: "hidden",
                boxShadow:
                  "0 3px 15px rgba(0,0,0,.06)",
              }}
            >
              {entregas.length === 0 ? (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  Nenhuma entrega registrada.
                </div>
              ) : (
                entregas.map(
                  (entrega) => (
                    <div
                      key={entrega.id}
                      style={{
                        padding: "18px",
                        borderBottom:
                          "1px solid #e5e7eb",
                      }}
                    >
                      <strong>
                        {entrega.aluno}
                      </strong>

                      <div>
                        {entrega.atividade}
                      </div>

                      <small
                        style={{
                          color: "#6b7280",
                        }}
                      >
                        {entrega.data}
                      </small>

                      <div
                        style={{
                          marginTop: "8px",
                          fontWeight: "700",
                        }}
                      >
                        {entrega.status}
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </>
        )}

        {/* ====================================================
            NOTAS
        ==================================================== */}

        {secao === "notas" && (
          <>
            <Titulo
              titulo="Notas"
              descricao="Acompanhe as notas dos alunos."
            />

            <div
              style={{
                background: "#fff",
                borderRadius: "15px",
                padding: "25px",
                boxShadow:
                  "0 3px 15px rgba(0,0,0,.06)",
              }}
            >
              {entregas.length === 0 ? (
                <p
                  style={{
                    color: "#6b7280",
                  }}
                >
                  Ainda não existem notas
                  registradas.
                </p>
              ) : (
                entregas.map(
                  (entrega) => (
                    <div
                      key={entrega.id}
                      style={{
                        padding: "15px 0",
                        borderBottom:
                          "1px solid #e5e7eb",
                      }}
                    >
                      <strong>
                        {entrega.aluno}
                      </strong>

                      <span
                        style={{
                          marginLeft: "15px",
                          fontWeight: "700",
                          color: "#087f5b",
                        }}
                      >
                        {entrega.nota ??
                          "Sem nota"}
                      </span>
                    </div>
                  )
                )
              )}
            </div>
          </>
        )}

        {/* ====================================================
            CONFIGURAÇÃO
            TUDO DENTRO DESTA MESMA PAGE
        ==================================================== */}

        {secao === "configuracao" && (
          <>
            <Titulo
              titulo="Configuração"
              descricao="Configure sua área do professor."
            />

            {mensagemConfig && (
              <div
                style={{
                  background: "#d3f9d8",
                  color: "#2b8a3e",
                  padding: "15px",
                  borderRadius: "10px",
                  marginBottom: "20px",
                  fontWeight: "600",
                }}
              >
                {mensagemConfig}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {/* ==================================================
                  DADOS DO PROFESSOR
              ================================================== */}

              <div style={painelStyle}>
                <h2>
                  👤 Dados do professor
                </h2>

                <label style={labelStyle}>
                  Nome de exibição
                </label>

                <input
                  value={nomeExibicao}
                  onChange={(e) =>
                    setNomeExibicao(
                      e.target.value
                    )
                  }
                  style={inputStyle}
                  placeholder="Nome do professor"
                />

                <label style={labelStyle}>
                  Usuário
                </label>

                <input
                  value={professor.usuario}
                  disabled
                  style={{
                    ...inputStyle,
                    background: "#f1f3f5",
                    cursor: "not-allowed",
                  }}
                />

                <label style={labelStyle}>
                  Disciplina
                </label>

                <input
                  value={disciplina}
                  onChange={(e) =>
                    setDisciplina(
                      e.target.value
                    )
                  }
                  placeholder="Ex.: Programação"
                  style={inputStyle}
                />

                <label style={labelStyle}>
                  E-mail
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="professor@email.com"
                  style={inputStyle}
                />
              </div>

              {/* ==================================================
                  PREFERÊNCIAS
              ================================================== */}

              <div style={painelStyle}>
                <h2>
                  ⚙️ Preferências
                </h2>

                <ConfiguracaoSwitch
                  titulo="Notificações"
                  descricao="Receber notificações sobre novas entregas."
                  ativo={notificacoes}
                  onChange={() =>
                    setNotificacoes(
                      !notificacoes
                    )
                  }
                />

                <ConfiguracaoSwitch
                  titulo="Mostrar e-mail"
                  descricao="Permitir que o e-mail apareça para os alunos."
                  ativo={mostrarEmail}
                  onChange={() =>
                    setMostrarEmail(
                      !mostrarEmail
                    )
                  }
                />

                <ConfiguracaoSwitch
                  titulo="Modo compacto"
                  descricao="Utilizar uma interface com menos espaçamento."
                  ativo={modoCompacto}
                  onChange={() =>
                    setModoCompacto(
                      !modoCompacto
                    )
                  }
                />
              </div>

              {/* ==================================================
                  INFORMAÇÕES
              ================================================== */}

              <div style={painelStyle}>
                <h2>
                  ℹ️ Informações
                </h2>

                <p>
                  <strong>
                    Plataforma:
                  </strong>{" "}
                  P.A.C.
                </p>

                <p>
                  <strong>
                    Área:
                  </strong>{" "}
                  Professor
                </p>

                <p>
                  <strong>
                    Usuário:
                  </strong>{" "}
                  {professor.usuario}
                </p>

                <p>
                  <strong>
                    Disciplina:
                  </strong>{" "}
                  {disciplina ||
                    "Não informada"}
                </p>
              </div>
            </div>

            {/* ==================================================
                BOTÃO SALVAR
            ================================================== */}

            <div
              style={{
                marginTop: "25px",
                display: "flex",
                justifyContent:
                  "flex-end",
              }}
            >
              <button
                onClick={salvarConfiguracao}
                style={{
                  ...botaoPrincipal,
                  padding:
                    "13px 25px",
                }}
              >
                💾 Salvar configurações
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

/* ============================================================
   MENU ITEM
============================================================ */

function MenuItem({
  texto,
  icone,
  ativo,
  onClick,
}: {
  texto: string;
  icone: string;
  ativo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        border: "none",
        borderRadius: "9px",
        padding: "13px 15px",
        marginBottom: "6px",
        cursor: "pointer",
        textAlign: "left",
        background: ativo
          ? "#e6fcf5"
          : "transparent",
        color: ativo
          ? "#087f5b"
          : "#343a40",
        fontWeight: ativo
          ? "700"
          : "500",
        fontSize: "15px",
      }}
    >
      <span
        style={{
          marginRight: "12px",
        }}
      >
        {icone}
      </span>

      {texto}
    </button>
  );
}

/* ============================================================
   CARD
============================================================ */

function Card({
  titulo,
  valor,
  icone,
}: {
  titulo: string;
  valor: number;
  icone: string;
}) {
  return (
    <div style={painelStyle}>
      <div
        style={{
          fontSize: "28px",
        }}
      >
        {icone}
      </div>

      <div
        style={{
          color: "#6b7280",
          marginTop: "12px",
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          fontSize: "30px",
          fontWeight: "800",
          marginTop: "5px",
          color: "#087f5b",
        }}
      >
        {valor}
      </div>
    </div>
  );
}

/* ============================================================
   TÍTULO
============================================================ */

function Titulo({
  titulo,
  descricao,
}: {
  titulo: string;
  descricao: string;
}) {
  return (
    <div
      style={{
        marginBottom: "25px",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "30px",
        }}
      >
        {titulo}
      </h1>

      <p
        style={{
          color: "#6b7280",
          marginTop: "7px",
        }}
      >
        {descricao}
      </p>
    </div>
  );
}

/* ============================================================
   SWITCH DE CONFIGURAÇÃO
============================================================ */

function ConfiguracaoSwitch({
  titulo,
  descricao,
  ativo,
  onChange,
}: {
  titulo: string;
  descricao: string;
  ativo: boolean;
  onChange: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center",
        gap: "15px",
        padding: "18px 0",
        borderBottom:
          "1px solid #e9ecef",
      }}
    >
      <div>
        <strong>{titulo}</strong>

        <div
          style={{
            fontSize: "13px",
            color: "#6b7280",
            marginTop: "4px",
          }}
        >
          {descricao}
        </div>
      </div>

      <button
        onClick={onChange}
        aria-label={titulo}
        aria-pressed={ativo}
        style={{
          position: "relative",
          width: "48px",
          height: "26px",
          border: "none",
          borderRadius: "20px",
          background: ativo
            ? "#087f5b"
            : "#adb5bd",
          cursor: "pointer",
          padding: 0,
          flexShrink: 0,
          transition:
            "background .2s",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "3px",
            left: ativo
              ? "25px"
              : "3px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "#fff",
            transition:
              "left .2s",
            boxShadow:
              "0 1px 3px rgba(0,0,0,.25)",
          }}
        />
      </button>
    </div>
  );
}

/* ============================================================
   ESTILOS
============================================================ */

const painelStyle: CSSProperties = {
  background: "#fff",
  borderRadius: "15px",
  padding: "25px",
  boxShadow:
    "0 3px 15px rgba(0,0,0,.06)",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontWeight: "600",
  marginBottom: "7px",
  marginTop: "15px",
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border:
    "1px solid #ced4da",
  borderRadius: "8px",
  padding: "12px",
  fontSize: "14px",
  marginBottom: "12px",
  outline: "none",
  fontFamily:
    "Arial, Helvetica, sans-serif",
};

const botaoPrincipal: CSSProperties = {
  background: "#087f5b",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "11px 18px",
  cursor: "pointer",
  fontWeight: "700",
};

const botaoSecundario: CSSProperties = {
  background: "#e9ecef",
  color: "#343a40",
  border: "none",
  borderRadius: "8px",
  padding: "11px 18px",
  cursor: "pointer",
  fontWeight: "600",
};