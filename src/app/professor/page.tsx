   "use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

/* ============================================================
   P.A.C.
   Plataforma de Atividade Curricular

   app/professor/page.tsx

   ÁREA DO PROFESSOR
   ============================================================ */

/* ============================================================
   ESTUDANTE
   ============================================================ */

interface Estudante {
  nome: string;
  idade: number;
  ensinoMedio: boolean;
  usuario: string;
  senha: string;
  tipo: "aluno";
  dataCadastro: string;
}

/* ============================================================
   COMPETÊNCIAS
   ============================================================ */

type Competencia = "A" | "B" | "C" | "D";

/* ============================================================
   DESTINO DA ATIVIDADE
   ============================================================ */

type DestinoAtividade = "todos" | string;

/* ============================================================
   ATIVIDADE
   ============================================================ */

interface Atividade {
  id: string;
  titulo: string;
  descricao: string;
  prazo: string;
  competencia: Competencia;
  destino: DestinoAtividade;
  professorUsuario: string;
  disciplina: string;
  dataCriacao: string;

  /*
    Usuários que receberam a atividade.
  */
  estudantes: string[];

  /*
    Usuários que já entregaram.
    Futuramente poderá ser preenchido
    pelo módulo do estudante.
  */
  entregas: string[];
}

/* ============================================================
   SEÇÕES
   ============================================================ */

type Secao =
  | "inicio"
  | "alunos"
  | "atividades"
  | "notas"
  | "perfil";

/* ============================================================
   PROFESSOR
   ============================================================ */

export default function ProfessorPage() {
  const router = useRouter();

  /* ==========================================================
     DADOS DO PROFESSOR
  ========================================================== */

  const [nomeProfessor, setNomeProfessor] =
    useState("");

  const [usuarioProfessor, setUsuarioProfessor] =
    useState("");

  const [disciplina, setDisciplina] =
    useState("");

  const [tipoProfessor, setTipoProfessor] =
    useState<"professor" | "professora">(
      "professor"
    );

  /* ==========================================================
     ESTUDANTES
  ========================================================== */

  const [estudantes, setEstudantes] =
    useState<Estudante[]>([]);

  /* ==========================================================
     ATIVIDADES
  ========================================================== */

  const [atividades, setAtividades] =
    useState<Atividade[]>([]);

  /* ==========================================================
     SEÇÃO
  ========================================================== */

  const [secao, setSecao] =
    useState<Secao>("inicio");

  /* ==========================================================
     PESQUISA
  ========================================================== */

  const [pesquisa, setPesquisa] =
    useState("");

  const [pesquisaAtividade, setPesquisaAtividade] =
    useState("");

  /* ==========================================================
     MENU MOBILE
  ========================================================== */

  const [menuAberto, setMenuAberto] =
    useState(false);

  /* ==========================================================
     ALUNO SELECIONADO
  ========================================================== */

  const [alunoSelecionado, setAlunoSelecionado] =
    useState<Estudante | null>(null);

  /* ==========================================================
     ATIVIDADE SELECIONADA
  ========================================================== */

  const [atividadeSelecionada, setAtividadeSelecionada] =
    useState<Atividade | null>(null);

  /* ==========================================================
     MODAL NOVA ATIVIDADE
  ========================================================== */

  const [modalNovaAtividade, setModalNovaAtividade] =
    useState(false);

  /* ==========================================================
     FORMULÁRIO
  ========================================================== */

  const [tituloAtividade, setTituloAtividade] =
    useState("");

  const [descricaoAtividade, setDescricaoAtividade] =
    useState("");

  const [prazoAtividade, setPrazoAtividade] =
    useState("");

  const [competenciaAtividade, setCompetenciaAtividade] =
    useState<Competencia>("A");

  const [destinoAtividade, setDestinoAtividade] =
    useState<DestinoAtividade>("todos");

  /* ==========================================================
     CARREGAMENTO
  ========================================================== */

  const [carregando, setCarregando] =
    useState(true);

  /* ============================================================
     CARREGAR SESSÃO
     ============================================================ */

  useEffect(() => {
    try {
      const tipoUsuario =
        sessionStorage.getItem(
          "pac_tipo_usuario"
        );

      if (tipoUsuario !== "professor") {
        router.replace("/login");
        return;
      }

      const nome =
        sessionStorage.getItem(
          "pac_nome_usuario"
        );

      const usuario =
        sessionStorage.getItem(
          "pac_usuario"
        );

      const disciplinaSalva =
        sessionStorage.getItem(
          "pac_disciplina"
        );

      const tipoSalvo =
        sessionStorage.getItem(
          "pac_tipo_professor"
        );

      if (!usuario) {
        router.replace("/login");
        return;
      }

      setNomeProfessor(
        nome || "Professor"
      );

      setUsuarioProfessor(
        usuario
      );

      setDisciplina(
        disciplinaSalva ||
          "Computação"
      );

      setTipoProfessor(
        tipoSalvo === "professora"
          ? "professora"
          : "professor"
      );

      carregarEstudantes();

      carregarAtividades();

      setCarregando(false);
    } catch (error) {
      console.error(
        "[P.A.C.] Erro ao carregar sessão:",
        error
      );

      router.replace("/login");
    }
  }, [router]);

  /* ============================================================
     CARREGAR ESTUDANTES
     ============================================================ */

  function carregarEstudantes() {
    try {
      const dados =
        localStorage.getItem(
          "pac_estudantes"
        );

      if (!dados) {
        setEstudantes([]);
        return;
      }

      const lista =
        JSON.parse(dados);

      if (!Array.isArray(lista)) {
        setEstudantes([]);
        return;
      }

      const estudantesValidos =
        lista.filter(
          (
            item
          ): item is Estudante =>
            item !== null &&
            typeof item === "object" &&
            typeof item.nome ===
              "string" &&
            typeof item.usuario ===
              "string" &&
            typeof item.senha ===
              "string"
        );

      setEstudantes(
        estudantesValidos
      );
    } catch (error) {
      console.error(
        "[P.A.C.] Erro ao carregar estudantes:",
        error
      );

      setEstudantes([]);
    }
  }

  /* ============================================================
     CARREGAR ATIVIDADES
     ============================================================ */

  function carregarAtividades() {
    try {
      const dados =
        localStorage.getItem(
          "pac_atividades"
        );

      if (!dados) {
        setAtividades([]);
        return;
      }

      const lista =
        JSON.parse(dados);

      if (!Array.isArray(lista)) {
        setAtividades([]);
        return;
      }

      const atividadesValidas =
        lista.filter(
          (item): item is Atividade =>
            item !== null &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.titulo === "string" &&
            typeof item.descricao === "string" &&
            typeof item.prazo === "string" &&
            ["A", "B", "C", "D"].includes(
              item.competencia
            ) &&
            typeof item.destino === "string" &&
            Array.isArray(item.estudantes) &&
            Array.isArray(item.entregas)
        );

      /*
        Mostra somente as atividades
        deste professor.
      */
      const minhasAtividades =
        atividadesValidas.filter(
          (atividade) =>
            !atividade.professorUsuario ||
            atividade.professorUsuario ===
              usuarioProfessorAtual()
        );

      setAtividades(
        minhasAtividades
      );
    } catch (error) {
      console.error(
        "[P.A.C.] Erro ao carregar atividades:",
        error
      );

      setAtividades([]);
    }
  }

  /* ============================================================
     USUÁRIO ATUAL
     ============================================================ */

  function usuarioProfessorAtual() {
    if (typeof window === "undefined") {
      return "";
    }

    return (
      sessionStorage.getItem(
        "pac_usuario"
      ) || ""
    );
  }

  /* ============================================================
     SALVAR ATIVIDADES
     ============================================================ */

  function salvarAtividades(
    novaLista: Atividade[]
  ) {
    try {
      /*
        Recupera todas as atividades existentes
        para não apagar atividades de outros professores.
      */

      const dados =
        localStorage.getItem(
          "pac_atividades"
        );

      let todas: Atividade[] = [];

      if (dados) {
        try {
          const parsed =
            JSON.parse(dados);

          if (Array.isArray(parsed)) {
            todas = parsed;
          }
        } catch {
          todas = [];
        }
      }

      const usuarioAtual =
        usuarioProfessorAtual();

      const outrasAtividades =
        todas.filter(
          (atividade) =>
            atividade.professorUsuario !==
            usuarioAtual
        );

      const resultado = [
        ...outrasAtividades,
        ...novaLista,
      ];

      localStorage.setItem(
        "pac_atividades",
        JSON.stringify(resultado)
      );

      setAtividades(
        novaLista
      );
    } catch (error) {
      console.error(
        "[P.A.C.] Erro ao salvar atividades:",
        error
      );
    }
  }

  /* ============================================================
     LOGOUT
     ============================================================ */

  function sair() {
    sessionStorage.removeItem(
      "pac_tipo_usuario"
    );

    sessionStorage.removeItem(
      "pac_usuario"
    );

    sessionStorage.removeItem(
      "pac_nome_usuario"
    );

    sessionStorage.removeItem(
      "pac_tipo_professor"
    );

    sessionStorage.removeItem(
      "pac_disciplina"
    );

    router.replace("/login");
  }

  /* ============================================================
     MENU
     ============================================================ */

  function selecionarSecao(
    novaSecao: Secao
  ) {
    setSecao(novaSecao);
    setMenuAberto(false);
    setAlunoSelecionado(null);
    setAtividadeSelecionada(null);
  }

  /* ============================================================
     PESQUISA ESTUDANTES
     ============================================================ */

  const estudantesFiltrados =
    useMemo(() => {
      const termo =
        pesquisa
          .trim()
          .toLowerCase();

      if (!termo) {
        return estudantes;
      }

      return estudantes.filter(
        (estudante) =>
          estudante.nome
            .toLowerCase()
            .includes(termo) ||
          estudante.usuario
            .toLowerCase()
            .includes(termo)
      );
    }, [
      estudantes,
      pesquisa,
    ]);

  /* ============================================================
     PESQUISA ATIVIDADES
     ============================================================ */

  const atividadesFiltradas =
    useMemo(() => {
      const termo =
        pesquisaAtividade
          .trim()
          .toLowerCase();

      if (!termo) {
        return atividades;
      }

      return atividades.filter(
        (atividade) =>
          atividade.titulo
            .toLowerCase()
            .includes(termo) ||
          atividade.descricao
            .toLowerCase()
            .includes(termo)
      );
    }, [
      atividades,
      pesquisaAtividade,
    ]);

  /* ============================================================
     ESTATÍSTICAS
     ============================================================ */

  const totalAlunos =
    estudantes.length;

  const alunosEnsinoMedio =
    estudantes.filter(
      (aluno) =>
        aluno.ensinoMedio
    ).length;

  const alunosAdultos =
    estudantes.filter(
      (aluno) =>
        Number(aluno.idade) > 18
    ).length;

  const totalAtividades =
    atividades.length;

  /* ============================================================
     DATA
     ============================================================ */

  const dataAtual =
    new Date().toLocaleDateString(
      "pt-BR",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
      }
    );

  /* ============================================================
     DATA PARA EXIBIÇÃO
     ============================================================ */

  function formatarData(
    data: string
  ) {
    if (!data) {
      return "Sem prazo";
    }

    try {
      /*
        Evita problemas de fuso horário
        ao converter YYYY-MM-DD.
      */

      const partes =
        data.split("-");

      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }

      return new Date(
        data
      ).toLocaleDateString(
        "pt-BR"
      );
    } catch {
      return data;
    }
  }

  /* ============================================================
     TEXTO DA COMPETÊNCIA
     ============================================================ */

  function textoCompetencia(
    competencia: Competencia
  ) {
    if (competencia === "A") {
      return "A — PASSOU";
    }

    if (competencia === "B") {
      return "B — PASSOU";
    }

    if (competencia === "C") {
      return "C — PASSOU";
    }

    return "D — REPROVADO";
  }

  /* ============================================================
     CLASSE DA COMPETÊNCIA
     ============================================================ */

  function classeCompetencia(
    competencia: Competencia
  ) {
    return `competencia competencia-${competencia.toLowerCase()}`;
  }

  /* ============================================================
     ABRIR NOVA ATIVIDADE
     ============================================================ */

  function abrirNovaAtividade() {
    setTituloAtividade("");
    setDescricaoAtividade("");
    setPrazoAtividade("");
    setCompetenciaAtividade("A");
    setDestinoAtividade("todos");

    setModalNovaAtividade(true);
  }

  /* ============================================================
     FECHAR NOVA ATIVIDADE
     ============================================================ */

  function fecharNovaAtividade() {
    setModalNovaAtividade(false);
  }

  /* ============================================================
     CRIAR ATIVIDADE
     ============================================================ */

  function criarAtividade(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const titulo =
      tituloAtividade.trim();

    const descricao =
      descricaoAtividade.trim();

    if (!titulo) {
      alert(
        "Informe o título da atividade."
      );
      return;
    }

    if (!descricao) {
      alert(
        "Informe a descrição da atividade."
      );
      return;
    }

    if (!prazoAtividade) {
      alert(
        "Informe o prazo da atividade."
      );
      return;
    }

    /*
      Define quais estudantes receberão
      a atividade.
    */

    let estudantesDestino: string[] = [];

    if (
      destinoAtividade ===
      "todos"
    ) {
      estudantesDestino =
        estudantes.map(
          (aluno) =>
            aluno.usuario
        );
    } else {
      estudantesDestino = [
        destinoAtividade,
      ];
    }

    const novaAtividade: Atividade = {
      id:
        `atividade_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}`,

      titulo,

      descricao,

      prazo:
        prazoAtividade,

      competencia:
        competenciaAtividade,

      destino:
        destinoAtividade,

      professorUsuario:
        usuarioProfessorAtual(),

      disciplina,

      dataCriacao:
        new Date().toISOString(),

      estudantes:
        estudantesDestino,

      entregas: [],
    };

    const novaLista = [
      novaAtividade,
      ...atividades,
    ];

    salvarAtividades(
      novaLista
    );

    setModalNovaAtividade(false);

    setSecao("atividades");

    setAtividadeSelecionada(
      novaAtividade
    );
  }

  /* ============================================================
     EXCLUIR ATIVIDADE
     ============================================================ */

  function excluirAtividade(
    atividade: Atividade
  ) {
    const confirmar =
      window.confirm(
        `Deseja realmente excluir a atividade "${atividade.titulo}"?`
      );

    if (!confirmar) {
      return;
    }

    const novaLista =
      atividades.filter(
        (item) =>
          item.id !==
          atividade.id
      );

    salvarAtividades(
      novaLista
    );

    setAtividadeSelecionada(
      null
    );
  }

  /* ============================================================
     QUANTIDADE DE ALUNOS
     ============================================================ */

  function quantidadeAlunos(
    atividade: Atividade
  ) {
    return atividade.estudantes.length;
  }

  /* ============================================================
     ENTREGUES
     ============================================================ */

  function quantidadeEntregues(
    atividade: Atividade
  ) {
    return atividade.entregas.length;
  }

  /* ============================================================
     PENDENTES
     ============================================================ */

  function quantidadePendentes(
    atividade: Atividade
  ) {
    return Math.max(
      0,
      quantidadeAlunos(
        atividade
      ) -
        quantidadeEntregues(
          atividade
        )
    );
  }

  /* ============================================================
     DESTINO
     ============================================================ */

  function textoDestino(
    atividade: Atividade
  ) {
    if (
      atividade.destino ===
      "todos"
    ) {
      return "Todos os estudantes";
    }

    const aluno =
      estudantes.find(
        (item) =>
          item.usuario ===
          atividade.destino
      );

    return aluno
      ? aluno.nome
      : atividade.destino;
  }

  /* ============================================================
     CARREGAMENTO
     ============================================================ */

  if (carregando) {
    return (
      <main className="loading-page">

        <div className="loading-box">

          <div className="loading-logo">
            P.A.C.
          </div>

          <div className="spinner" />

          <strong>
            Carregando área docente...
          </strong>

        </div>

        <style jsx>{`

          .loading-page {
            min-height: 100vh;

            display: flex;
            align-items: center;
            justify-content: center;

            background:
              linear-gradient(
                135deg,
                #04191f,
                #075b65
              );

            font-family:
              Arial,
              sans-serif;
          }

          .loading-box {
            display: flex;
            flex-direction: column;

            align-items: center;

            gap: 14px;

            color: white;

            font-size: 11px;
          }

          .loading-logo {
            width: 60px;
            height: 60px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 16px;

            background:
              linear-gradient(
                145deg,
                #20ddc7,
                #078e9e
              );

            font-size: 14px;
            font-weight: 900;
          }

          .spinner {
            width: 22px;
            height: 22px;

            border:
              3px solid
              rgba(255,255,255,.25);

            border-top-color:
              #20ddc7;

            border-radius: 50%;

            animation:
              spin .7s linear infinite;
          }

          @keyframes spin {
            to {
              transform:
                rotate(360deg);
            }
          }

        `}</style>

      </main>
    );
  }

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <main className="page">

      {/* ======================================================
          FUNDO
      ====================================================== */}

      <div className="background">

        <div className="glow glow-one" />

        <div className="glow glow-two" />

        <div className="grid" />

      </div>

      {/* ======================================================
          OVERLAY MOBILE
      ====================================================== */}

      {menuAberto && (
        <div
          className="mobile-overlay"
          onClick={() =>
            setMenuAberto(false)
          }
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={
          menuAberto
            ? "sidebar open"
            : "sidebar"
        }
      >

        <div className="sidebar-header">

          <div className="brand-logo">

            <span>P</span>

            <small>.A.C.</small>

          </div>

          <div className="brand-text">

            <strong>P.A.C.</strong>

            <span>
              Área Docente
            </span>

          </div>

        </div>

        <div className="teacher-mini">

          <div className="teacher-avatar">
            {nomeProfessor
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>

            <strong>
              {nomeProfessor}
            </strong>

            <span>
              {disciplina}
            </span>

          </div>

        </div>

        <nav className="navigation">

          <button
            className={
              secao === "inicio"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              selecionarSecao(
                "inicio"
              )
            }
          >

            <span>🏠</span>

            Início

          </button>

          <button
            className={
              secao === "alunos"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              selecionarSecao(
                "alunos"
              )
            }
          >

            <span>👨‍🎓</span>

            Estudantes

            <b>
              {totalAlunos}
            </b>

          </button>

          <button
            className={
              secao === "atividades"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              selecionarSecao(
                "atividades"
              )
            }
          >

            <span>📝</span>

            Atividades

            <b>
              {totalAtividades}
            </b>

          </button>

          <button
            className={
              secao === "notas"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              selecionarSecao(
                "notas"
              )
            }
          >

            <span>📊</span>

            Notas e competências

          </button>

          <button
            className={
              secao === "perfil"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              selecionarSecao(
                "perfil"
              )
            }
          >

            <span>👤</span>

            Meu perfil

          </button>

        </nav>

        <div className="sidebar-bottom">

          <button
            className="logout"
            onClick={sair}
          >

            <span>⇥</span>

            Sair da conta

          </button>

          <div className="version">
            P.A.C. v1.0
          </div>

        </div>

      </aside>

      {/* ======================================================
          CONTEÚDO PRINCIPAL
      ====================================================== */}

      <section className="main">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="topbar">

          <button
            className="menu-button"
            onClick={() =>
              setMenuAberto(true)
            }
          >
            ☰
          </button>

          <div className="topbar-title">

            <span>
              ÁREA DOCENTE
            </span>

            <strong>

              {secao === "inicio"
                ? "Painel"
                : secao === "alunos"
                ? "Estudantes"
                : secao === "atividades"
                ? "Atividades"
                : secao === "notas"
                ? "Notas e competências"
                : "Meu perfil"}

            </strong>

          </div>

          <div className="topbar-user">

            <div className="top-avatar">

              {nomeProfessor
                .charAt(0)
                .toUpperCase()}

            </div>

            <div className="top-user-info">

              <strong>
                {nomeProfessor}
              </strong>

              <span>
                {usuarioProfessor}
              </span>

            </div>

          </div>

        </header>

        {/* ====================================================
            CONTEÚDO
        ==================================================== */}

        <div className="content">

          {/* ==================================================
              INÍCIO
          ================================================== */}

          {secao === "inicio" && (
            <>

              <section className="welcome-card">

                <div>

                  <div className="welcome-label">
                    {dataAtual}
                  </div>

                  <h1>

                    Olá,{" "}

                    {tipoProfessor ===
                    "professora"
                      ? "Professora"
                      : "Professor"}{" "}

                    {nomeProfessor.split(
                      " "
                    )[0]}

                    !

                  </h1>

                  <p>
                    Bem-vindo à sua área
                    docente. Aqui você pode
                    acompanhar seus estudantes
                    e organizar suas atividades
                    curriculares.
                  </p>

                </div>

                <div className="welcome-symbol">
                  🎓
                </div>

              </section>

              <section className="stats">

                <div className="stat-card">

                  <div className="stat-icon teal">
                    👨‍🎓
                  </div>

                  <div>

                    <span>
                      ESTUDANTES
                    </span>

                    <strong>
                      {totalAlunos}
                    </strong>

                    <small>
                      cadastrados na P.A.C.
                    </small>

                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon blue">
                    ✓
                  </div>

                  <div>

                    <span>
                      ENSINO MÉDIO
                    </span>

                    <strong>
                      {alunosEnsinoMedio}
                    </strong>

                    <small>
                      com requisito confirmado
                    </small>

                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon purple">
                    📝
                  </div>

                  <div>

                    <span>
                      ATIVIDADES
                    </span>

                    <strong>
                      {totalAtividades}
                    </strong>

                    <small>
                      atividades criadas
                    </small>

                  </div>

                </div>

              </section>

              <section className="panel">

                <div className="panel-header">

                  <div>

                    <h2>
                      Estudantes cadastrados
                    </h2>

                    <p>
                      Consulte os estudantes
                      disponíveis na plataforma.
                    </p>

                  </div>

                  <button
                    className="panel-button"
                    onClick={() =>
                      selecionarSecao(
                        "alunos"
                      )
                    }
                  >
                    Ver todos →
                  </button>

                </div>

                {estudantes.length === 0 ? (

                  <div className="empty">

                    <div className="empty-icon">
                      👨‍🎓
                    </div>

                    <strong>
                      Nenhum estudante cadastrado
                    </strong>

                    <span>
                      Quando novos estudantes
                      forem cadastrados, eles
                      aparecerão aqui.
                    </span>

                  </div>

                ) : (

                  <div className="student-list">

                    {estudantes
                      .slice(0, 5)
                      .map((aluno) => (

                        <button
                          key={
                            aluno.usuario
                          }
                          className="student-row"
                          onClick={() =>
                            setAlunoSelecionado(
                              aluno
                            )
                          }
                        >

                          <div className="student-avatar">

                            {aluno.nome
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div className="student-info">

                            <strong>
                              {aluno.nome}
                            </strong>

                            <span>
                              @{aluno.usuario}
                            </span>

                          </div>

                          <span className="student-status">
                            Ativo
                          </span>

                          <b>→</b>

                        </button>

                      ))}

                  </div>

                )}

              </section>

            </>
          )}

          {/* ==================================================
              ESTUDANTES
          ================================================== */}

          {secao === "alunos" && (

            <section className="panel large-panel">

              <div className="panel-header">

                <div>

                  <h2>
                    Estudantes
                  </h2>

                  <p>
                    Consulte os estudantes
                    cadastrados na P.A.C.
                  </p>

                </div>

                <div className="count-badge">
                  {estudantes.length}
                </div>

              </div>

              <div className="search-box">

                <span>🔎</span>

                <input
                  type="text"
                  value={pesquisa}
                  placeholder="Pesquisar estudante..."
                  onChange={(event) =>
                    setPesquisa(
                      event.target.value
                    )
                  }
                />

                {pesquisa && (
                  <button
                    onClick={() =>
                      setPesquisa("")
                    }
                  >
                    ×
                  </button>
                )}

              </div>

              {estudantesFiltrados.length ===
              0 ? (

                <div className="empty">

                  <div className="empty-icon">
                    🔎
                  </div>

                  <strong>
                    Nenhum estudante encontrado
                  </strong>

                  <span>
                    Tente pesquisar por outro
                    nome ou usuário.
                  </span>

                </div>

              ) : (

                <div className="student-list">

                  {estudantesFiltrados.map(
                    (aluno) => (

                      <button
                        key={
                          aluno.usuario
                        }
                        className="student-row"
                        onClick={() =>
                          setAlunoSelecionado(
                            aluno
                          )
                        }
                      >

                        <div className="student-avatar">

                          {aluno.nome
                            .charAt(0)
                            .toUpperCase()}

                        </div>

                        <div className="student-info">

                          <strong>
                            {aluno.nome}
                          </strong>

                          <span>
                            @{aluno.usuario}
                            {" • "}
                            {aluno.idade} anos
                          </span>

                        </div>

                        <span className="student-status">

                          {aluno.ensinoMedio
                            ? "Regular"
                            : "Pendente"}

                        </span>

                        <b>→</b>

                      </button>

                    )
                  )}

                </div>

              )}

            </section>

          )}

          {/* ==================================================
              ATIVIDADES
          ================================================== */}

          {secao === "atividades" && (

            <section className="activities-section">

              {/* =================================================
                  CABEÇALHO
              ================================================= */}

              <div className="activities-header">

                <div>

                  <div className="section-eyebrow">
                    ORGANIZAÇÃO CURRICULAR
                  </div>

                  <h1>
                    Atividades
                  </h1>

                  <p>
                    Crie atividades, defina
                    competências e acompanhe
                    as entregas dos estudantes.
                  </p>

                </div>

                <button
                  className="new-activity-button"
                  onClick={
                    abrirNovaAtividade
                  }
                >

                  <span>+</span>

                  Nova

                </button>

              </div>

              {/* =================================================
                  BARRA DE PESQUISA
              ================================================= */}

              {atividades.length > 0 && (

                <div className="activity-toolbar">

                  <div className="activity-search">

                    <span>🔎</span>

                    <input
                      type="text"
                      value={
                        pesquisaAtividade
                      }
                      placeholder="Pesquisar atividade..."
                      onChange={(event) =>
                        setPesquisaAtividade(
                          event.target.value
                        )
                      }
                    />

                    {pesquisaAtividade && (

                      <button
                        onClick={() =>
                          setPesquisaAtividade(
                            ""
                          )
                        }
                      >
                        ×
                      </button>

                    )}

                  </div>

                  <div className="activity-count">
                    {atividades.length}{" "}
                    {atividades.length === 1
                      ? "atividade"
                      : "atividades"}
                  </div>

                </div>

              )}

              {/* =================================================
                  LISTA
              ================================================= */}

              {atividadesFiltradas.length === 0 ? (

                <div className="activities-empty">

                  <div className="activities-empty-icon">
                    📝
                  </div>

                  <h2>
                    Nenhuma atividade criada
                  </h2>

                  <p>
                    Crie sua primeira atividade
                    curricular clicando no botão
                    <strong>
                      {" "}+ Nova
                    </strong>.
                  </p>

                  <button
                    className="empty-new-button"
                    onClick={
                      abrirNovaAtividade
                    }
                  >
                    + Nova atividade
                  </button>

                </div>

              ) : (

                <div className="activities-list">

                  {atividadesFiltradas.map(
                    (atividade) => {

                      const entregues =
                        quantidadeEntregues(
                          atividade
                        );

                      const pendentes =
                        quantidadePendentes(
                          atividade
                        );

                      const alunos =
                        quantidadeAlunos(
                          atividade
                        );

                      return (

                        <article
                          key={
                            atividade.id
                          }
                          className="activity-card"
                          onClick={() =>
                            setAtividadeSelecionada(
                              atividade
                            )
                          }
                        >

                          <div className="activity-card-main">

                            <div className="activity-card-top">

                              <div>

                                <h2>
                                  {
                                    atividade.titulo
                                  }
                                </h2>

                                <p>
                                  {
                                    atividade.descricao
                                  }
                                </p>

                              </div>

                              <span
                                className={
                                  classeCompetencia(
                                    atividade.competencia
                                  )
                                }
                              >
                                {
                                  atividade.competencia
                                }
                              </span>

                            </div>

                            <div className="activity-card-info">

                              <span>

                                <b>
                                  👨‍🎓
                                </b>

                                {alunos}{" "}
                                {alunos === 1
                                  ? "aluno"
                                  : "alunos"}

                              </span>

                              <span>

                                <b>
                                  📅
                                </b>

                                {
                                  formatarData(
                                    atividade.prazo
                                  )
                                }

                              </span>

                              <span>

                                <b>
                                  🎯
                                </b>

                                {
                                  textoCompetencia(
                                    atividade.competencia
                                  )
                                }

                              </span>

                            </div>

                            <div className="activity-progress-area">

                              <div className="activity-progress-label">

                                <span>
                                  Entregas
                                </span>

                                <strong>
                                  {entregues} de{" "}
                                  {alunos}
                                </strong>

                              </div>

                              <div className="activity-progress">

                                <div
                                  style={{
                                    width:
                                      alunos > 0
                                        ? `${Math.min(
                                            100,
                                            (entregues /
                                              alunos) *
                                              100
                                          )}%`
                                        : "0%",
                                  }}
                                />

                              </div>

                            </div>

                            <div className="activity-bottom">

                              <span className="delivered">

                                {entregues}{" "}
                                entregues

                              </span>

                              <span className="pending">

                                {pendentes}{" "}
                                pendentes

                              </span>

                              <span className="activity-open">
                                Ver atividade →
                              </span>

                            </div>

                          </div>

                        </article>

                      );
                    }
                  )}

                </div>

              )}

            </section>

          )}

          {/* ==================================================
              NOTAS
          ================================================== */}

          {secao === "notas" && (

            <section className="panel feature-panel">

              <div className="feature-icon">
                📊
              </div>

              <h2>
                Notas e competências
              </h2>

              <p>
                Nesta área será possível
                registrar as competências dos
                estudantes e acompanhar seus
                resultados.
              </p>

              <div className="competencies">

                <span>
                  A — PASSOU
                </span>

                <span>
                  B — PASSOU
                </span>

                <span>
                  C — PASSOU
                </span>

                <span>
                  D — REPROVADO
                </span>

              </div>

              <div className="coming">
                MÓDULO DE AVALIAÇÃO
              </div>

            </section>

          )}

          {/* ==================================================
              PERFIL
          ================================================== */}

          {secao === "perfil" && (

            <section className="panel profile-panel">

              <div className="profile-big-avatar">

                {nomeProfessor
                  .charAt(0)
                  .toUpperCase()}

              </div>

              <h2>
                {nomeProfessor}
              </h2>

              <p>
                {usuarioProfessor}
              </p>

              <div className="profile-data">

                <div>

                  <span>
                    Tipo de acesso
                  </span>

                  <strong>

                    {tipoProfessor ===
                    "professora"
                      ? "Professora"
                      : "Professor"}

                  </strong>

                </div>

                <div>

                  <span>
                    Disciplina
                  </span>

                  <strong>
                    {disciplina}
                  </strong>

                </div>

                <div>

                  <span>
                    Área
                  </span>

                  <strong>
                    Docente
                  </strong>

                </div>

              </div>

            </section>

          )}

        </div>

      </section>

      {/* ======================================================
          MODAL DO ALUNO
      ====================================================== */}

      {alunoSelecionado && (

        <div
          className="modal-background"
          onClick={() =>
            setAlunoSelecionado(null)
          }
        >

          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setAlunoSelecionado(null)
              }
            >
              ×
            </button>

            <div className="modal-avatar">

              {alunoSelecionado.nome
                .charAt(0)
                .toUpperCase()}

            </div>

            <div className="modal-eyebrow">
              ESTUDANTE
            </div>

            <h2>
              {alunoSelecionado.nome}
            </h2>

            <p className="modal-user">
              @{alunoSelecionado.usuario}
            </p>

            <div className="modal-data">

              <div>

                <span>
                  Idade
                </span>

                <strong>
                  {alunoSelecionado.idade} anos
                </strong>

              </div>

              <div>

                <span>
                  Ensino Médio
                </span>

                <strong>
                  {alunoSelecionado.ensinoMedio
                    ? "Completo"
                    : "Não informado"}
                </strong>

              </div>

              <div>

                <span>
                  Situação
                </span>

                <strong className="active-text">
                  Ativo
                </strong>

              </div>

            </div>

            <button
              className="modal-button"
              onClick={() =>
                setAlunoSelecionado(null)
              }
            >
              FECHAR
            </button>

          </div>

        </div>

      )}

      {/* ======================================================
          MODAL NOVA ATIVIDADE
      ====================================================== */}

      {modalNovaAtividade && (

        <div
          className="modal-background activity-modal-background"
          onClick={
            fecharNovaAtividade
          }
        >

          <form
            className="new-activity-modal"
            onSubmit={
              criarAtividade
            }
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <div className="new-activity-modal-header">

              <div>

                <span>
                  P.A.C. • ATIVIDADE
                </span>

                <h2>
                  NOVA ATIVIDADE
                </h2>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  fecharNovaAtividade
                }
              >
                ×
              </button>

            </div>

            {/* =================================================
                TÍTULO
            ================================================= */}

            <div className="form-field">

              <label>
                Título
              </label>

              <input
                type="text"
                value={
                  tituloAtividade
                }
                onChange={(event) =>
                  setTituloAtividade(
                    event.target.value
                  )
                }
                placeholder="Ex.: Introdução à lógica de programação"
                autoFocus
              />

            </div>

            {/* =================================================
                DESCRIÇÃO
            ================================================= */}

            <div className="form-field">

              <label>
                Descrição
              </label>

              <textarea
                value={
                  descricaoAtividade
                }
                onChange={(event) =>
                  setDescricaoAtividade(
                    event.target.value
                  )
                }
                placeholder="Descreva o que os estudantes deverão realizar..."
                rows={4}
              />

            </div>

            {/* =================================================
                PRAZO
            ================================================= */}

            <div className="form-field">

              <label>
                Prazo
              </label>

              <input
                type="date"
                value={
                  prazoAtividade
                }
                onChange={(event) =>
                  setPrazoAtividade(
                    event.target.value
                  )
                }
              />

            </div>

            {/* =================================================
                COMPETÊNCIA
            ================================================= */}

            <div className="form-field">

              <label>
                Competência
              </label>

              <div className="competencia-selector">

                {(
                  [
                    "A",
                    "B",
                    "C",
                    "D",
                  ] as Competencia[]
                ).map(
                  (competencia) => (

                    <button
                      key={
                        competencia
                      }
                      type="button"
                      className={
                        competenciaAtividade ===
                        competencia
                          ? `competencia-option selected ${competencia.toLowerCase()}`
                          : `competencia-option ${competencia.toLowerCase()}`
                      }
                      onClick={() =>
                        setCompetenciaAtividade(
                          competencia
                        )
                      }
                    >

                      <strong>
                        {competencia}
                      </strong>

                      <span>

                        {competencia ===
                        "D"
                          ? "Reprovado"
                          : "Passou"}

                      </span>

                    </button>

                  )
                )}

              </div>

            </div>

            {/* =================================================
                ENVIAR PARA
            ================================================= */}

            <div className="form-field">

              <label>
                Enviar para
              </label>

              <select
                value={
                  destinoAtividade
                }
                onChange={(event) =>
                  setDestinoAtividade(
                    event.target
                      .value
                  )
                }
              >

                <option value="todos">
                  Todos os estudantes
                </option>

                {estudantes.map(
                  (aluno) => (

                    <option
                      key={
                        aluno.usuario
                      }
                      value={
                        aluno.usuario
                      }
                    >
                      {aluno.nome}
                    </option>

                  )
                )}

              </select>

              {estudantes.length ===
                0 && (

                <small className="form-warning">
                  Nenhum estudante cadastrado.
                  A atividade será criada, mas
                  não terá estudantes associados.
                </small>

              )}

            </div>

            {/* =================================================
                RESUMO
            ================================================= */}

            <div className="activity-form-summary">

              <div>

                <span>
                  Disciplina
                </span>

                <strong>
                  {disciplina}
                </strong>

              </div>

              <div>

                <span>
                  Destinatários
                </span>

                <strong>

                  {destinoAtividade ===
                  "todos"
                    ? `${estudantes.length} estudantes`
                    : "1 estudante"}

                </strong>

              </div>

            </div>

            {/* =================================================
                BOTÕES
            ================================================= */}

            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={
                  fecharNovaAtividade
                }
              >
                CANCELAR
              </button>

              <button
                type="submit"
                className="submit-button"
              >

                <span>
                  ✓
                </span>

                ENVIAR

              </button>

            </div>

          </form>

        </div>

      )}

      {/* ======================================================
          MODAL DETALHES DA ATIVIDADE
      ====================================================== */}

      {atividadeSelecionada && (

        <div
          className="modal-background"
          onClick={() =>
            setAtividadeSelecionada(
              null
            )
          }
        >

          <div
            className="activity-detail-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setAtividadeSelecionada(
                  null
                )
              }
            >
              ×
            </button>

            <div className="detail-top">

              <div className="detail-icon">
                📝
              </div>

              <div>

                <span className="modal-eyebrow">
                  ATIVIDADE CURRICULAR
                </span>

                <h2>
                  {
                    atividadeSelecionada.titulo
                  }
                </h2>

              </div>

              <span
                className={
                  classeCompetencia(
                    atividadeSelecionada.competencia
                  )
                }
              >
                {
                  atividadeSelecionada.competencia
                }
              </span>

            </div>

            <div className="detail-description">

              <span>
                DESCRIÇÃO
              </span>

              <p>
                {
                  atividadeSelecionada.descricao
                }
              </p>

            </div>

            <div className="detail-grid">

              <div>

                <span>
                  Prazo
                </span>

                <strong>
                  📅{" "}
                  {formatarData(
                    atividadeSelecionada.prazo
                  )}
                </strong>

              </div>

              <div>

                <span>
                  Enviar para
                </span>

                <strong>
                  👨‍🎓{" "}
                  {textoDestino(
                    atividadeSelecionada
                  )}
                </strong>

              </div>

              <div>

                <span>
                  Entregues
                </span>

                <strong className="detail-green">
                  {
                    quantidadeEntregues(
                      atividadeSelecionada
                    )
                  }
                </strong>

              </div>

              <div>

                <span>
                  Pendentes
                </span>

                <strong className="detail-orange">
                  {
                    quantidadePendentes(
                      atividadeSelecionada
                    )
                  }
                </strong>

              </div>

            </div>

            <div className="detail-progress">

              <div className="activity-progress-label">

                <span>
                  Progresso das entregas
                </span>

                <strong>

                  {
                    quantidadeEntregues(
                      atividadeSelecionada
                    )
                  }{" "}

                  de{" "}

                  {
                    quantidadeAlunos(
                      atividadeSelecionada
                    )
                  }

                </strong>

              </div>

              <div className="activity-progress">

                <div
                  style={{
                    width:
                      quantidadeAlunos(
                        atividadeSelecionada
                      ) > 0
                        ? `${Math.min(
                            100,
                            (quantidadeEntregues(
                              atividadeSelecionada
                            ) /
                              quantidadeAlunos(
                                atividadeSelecionada
                              )) *
                              100
                          )}%`
                        : "0%",
                  }}
                />

              </div>

            </div>

            <div className="detail-actions">

              <button
                className="delete-button"
                onClick={() =>
                  excluirAtividade(
                    atividadeSelecionada
                  )
                }
              >
                🗑 Excluir atividade
              </button>

              <button
                className="modal-button detail-close-button"
                onClick={() =>
                  setAtividadeSelecionada(
                    null
                  )
                }
              >
                FECHAR
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ======================================================
          ESTILOS
      ====================================================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;

          display: flex;

          background: #f3f7f7;

          color: #193b42;

          font-family:
            Inter,
            Arial,
            sans-serif;
        }

        /* ====================================================
           FUNDO
        ==================================================== */

        .background {
          position: fixed;

          inset: 0;

          pointer-events: none;

          overflow: hidden;
        }

        .glow {
          position: absolute;

          border-radius: 50%;
        }

        .glow-one {
          width: 500px;
          height: 500px;

          left: -300px;
          top: -250px;

          background:
            rgba(17,190,174,.05);
        }

        .glow-two {
          width: 500px;
          height: 500px;

          right: -300px;
          bottom: -300px;

          background:
            rgba(8,139,155,.06);
        }

        .grid {
          position: absolute;

          inset: 0;

          opacity: .25;

          background-image:
            linear-gradient(
              #d9e7e8 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              #d9e7e8 1px,
              transparent 1px
            );

          background-size:
            45px 45px;
        }

        /* ====================================================
           SIDEBAR
        ==================================================== */

        .sidebar {
          position: fixed;

          z-index: 20;

          left: 0;
          top: 0;
          bottom: 0;

          width: 220px;

          display: flex;
          flex-direction: column;

          padding: 19px 12px;

          background:
            linear-gradient(
              180deg,
              #05252c,
              #063b45
            );

          box-shadow:
            8px 0 30px
            rgba(0,0,0,.10);
        }

        .sidebar-header {
          display: flex;
          align-items: center;

          gap: 9px;

          padding:
            0 7px 18px;

          border-bottom:
            1px solid
            rgba(255,255,255,.08);
        }

        .brand-logo {
          width: 39px;
          height: 39px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background:
            linear-gradient(
              145deg,
              #20ddc7,
              #078e9e
            );

          color: white;
        }

        .brand-logo span {
          font-size: 17px;
          font-weight: 900;
        }

        .brand-logo small {
          margin-top: 7px;

          font-size: 5px;
          font-weight: 900;
        }

        .brand-text {
          display: flex;
          flex-direction: column;

          gap: 2px;
        }

        .brand-text strong {
          color: white;

          font-size: 13px;
          font-weight: 900;
        }

        .brand-text span {
          color:
            rgba(255,255,255,.55);

          font-size: 7px;
        }

        .teacher-mini {
          display: flex;
          align-items: center;

          gap: 9px;

          padding: 17px 7px;
        }

        .teacher-avatar {
          width: 35px;
          height: 35px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background:
            rgba(26,204,184,.17);

          border:
            1px solid
            rgba(36,221,200,.25);

          color: #46dfcd;

          font-size: 13px;
          font-weight: 900;
        }

        .teacher-mini div:last-child {
          min-width: 0;

          display: flex;
          flex-direction: column;

          gap: 2px;
        }

        .teacher-mini strong {
          overflow: hidden;

          color: white;

          font-size: 8px;

          text-overflow: ellipsis;

          white-space: nowrap;
        }

        .teacher-mini span {
          overflow: hidden;

          color:
            rgba(255,255,255,.47);

          font-size: 7px;

          text-overflow: ellipsis;

          white-space: nowrap;
        }

        .navigation {
          display: flex;
          flex-direction: column;

          gap: 4px;
        }

        .nav-item {
          width: 100%;
          height: 40px;

          display: flex;
          align-items: center;

          gap: 9px;

          padding: 0 10px;

          border: none;

          border-radius: 9px;

          background: transparent;

          color:
            rgba(255,255,255,.62);

          cursor: pointer;

          text-align: left;

          font-family: inherit;

          font-size: 8px;
          font-weight: 700;

          transition:
            .18s ease;
        }

        .nav-item span {
          width: 20px;

          text-align: center;

          font-size: 13px;
        }

        .nav-item b {
          margin-left: auto;

          min-width: 18px;
          height: 18px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 6px;

          background:
            rgba(255,255,255,.08);

          color:
            rgba(255,255,255,.65);

          font-size: 7px;
        }

        .nav-item:hover {
          background:
            rgba(255,255,255,.06);

          color: white;
        }

        .nav-item.active {
          background:
            linear-gradient(
              135deg,
              rgba(20,200,181,.20),
              rgba(7,142,158,.16)
            );

          color: #55e1d0;

          box-shadow:
            inset 3px 0 0
            #1bd0bc;
        }

        .nav-item.active b {
          background:
            rgba(20,200,181,.18);

          color:
            #5be1d0;
        }

        .sidebar-bottom {
          margin-top: auto;
        }

        .logout {
          width: 100%;
          height: 38px;

          display: flex;
          align-items: center;

          gap: 9px;

          padding: 0 10px;

          border:
            1px solid
            rgba(255,255,255,.08);

          border-radius: 9px;

          background:
            rgba(255,255,255,.035);

          color:
            rgba(255,255,255,.62);

          cursor: pointer;

          text-align: left;

          font-size: 8px;
          font-weight: 700;
        }

        .logout:hover {
          background:
            rgba(255,255,255,.08);

          color: white;
        }

        .logout span {
          font-size: 15px;
        }

        .version {
          padding-top: 10px;

          text-align: center;

          color:
            rgba(255,255,255,.28);

          font-size: 6px;
        }

        /* ====================================================
           MAIN
        ==================================================== */

        .main {
          position: relative;

          z-index: 2;

          width: calc(100% - 220px);

          margin-left: 220px;
        }

        .topbar {
          height: 70px;

          display: flex;
          align-items: center;

          padding:
            0 30px;

          border-bottom:
            1px solid #e2eaeb;

          background:
            rgba(255,255,255,.93);

          backdrop-filter:
            blur(10px);
        }

        .menu-button {
          display: none;
        }

        .topbar-title {
          display: flex;
          flex-direction: column;

          gap: 2px;
        }

        .topbar-title span {
          color: #1aac9d;

          font-size: 7px;
          font-weight: 900;

          letter-spacing: 1.2px;
        }

        .topbar-title strong {
          color: #1b3d44;

          font-size: 14px;
        }

        .topbar-user {
          margin-left: auto;

          display: flex;
          align-items: center;

          gap: 8px;
        }

        .top-avatar {
          width: 34px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background:
            linear-gradient(
              145deg,
              #11c2ae,
              #087f90
            );

          color: white;

          font-size: 11px;
          font-weight: 900;
        }

        .top-user-info {
          display: flex;
          flex-direction: column;

          gap: 2px;
        }

        .top-user-info strong {
          color: #365258;

          font-size: 8px;
        }

        .top-user-info span {
          color: #98a7aa;

          font-size: 7px;
        }

        .content {
          position: relative;

          z-index: 2;

          max-width: 1050px;

          margin: auto;

          padding:
            27px 30px 40px;
        }

        /* ====================================================
           WELCOME
        ==================================================== */

        .welcome-card {
          min-height: 145px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding:
            25px 28px;

          border:
            1px solid #dbe9e9;

          border-radius: 18px;

          background:
            linear-gradient(
              135deg,
              #ffffff,
              #f0fbf9
            );

          box-shadow:
            0 10px 35px
            rgba(19,67,74,.06);
        }

        .welcome-label {
          margin-bottom: 6px;

          color: #11a796;

          font-size: 7px;
          font-weight: 900;

          text-transform: uppercase;

          letter-spacing: 1px;
        }

        .welcome-card h1 {
          margin: 0 0 6px;

          color: #183b43;

          font-size: 25px;

          letter-spacing: -.7px;
        }

        .welcome-card p {
          max-width: 570px;

          margin: 0;

          color: #7a8d91;

          font-size: 9px;

          line-height: 1.55;
        }

        .welcome-symbol {
          width: 78px;
          height: 78px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 22px;

          background:
            linear-gradient(
              145deg,
              #e4faf6,
              #d7f3ef
            );

          font-size: 36px;

          box-shadow:
            0 10px 25px
            rgba(8,151,143,.10);
        }

        /* ====================================================
           STATS
        ==================================================== */

        .stats {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 12px;

          margin-top: 14px;
        }

        .stat-card {
          display: flex;
          align-items: center;

          gap: 12px;

          min-height: 92px;

          padding: 14px;

          border:
            1px solid #e0e9ea;

          border-radius: 14px;

          background: white;

          box-shadow:
            0 7px 25px
            rgba(20,70,76,.045);
        }

        .stat-icon {
          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 12px;

          font-size: 17px;
        }

        .stat-icon.teal {
          background: #e6faf6;
        }

        .stat-icon.blue {
          background: #eaf7fb;
        }

        .stat-icon.purple {
          background: #f1edfb;
        }

        .stat-card div:last-child {
          display: flex;
          flex-direction: column;

          gap: 2px;
        }

        .stat-card span {
          color: #91a0a3;

          font-size: 6px;
          font-weight: 900;

          letter-spacing: .8px;
        }

        .stat-card strong {
          color: #23474e;

          font-size: 20px;

          line-height: 1;
        }

        .stat-card small {
          color: #9aa7aa;

          font-size: 6.5px;
        }

        /* ====================================================
           PANEL
        ==================================================== */

        .panel {
          margin-top: 14px;

          padding: 20px;

          border:
            1px solid #e0e9ea;

          border-radius: 15px;

          background: white;

          box-shadow:
            0 7px 25px
            rgba(20,70,76,.045);
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 15px;
        }

        .panel-header h2 {
          margin: 0 0 3px;

          color: #24474e;

          font-size: 13px;
        }

        .panel-header p {
          margin: 0;

          color: #95a3a6;

          font-size: 7.5px;
        }

        .panel-button {
          padding: 7px 10px;

          border:
            1px solid #d3e9e5;

          border-radius: 8px;

          background: #f1fbf9;

          color: #098d83;

          cursor: pointer;

          font-size: 7px;
          font-weight: 900;
        }

        .panel-button:hover {
          background: #e5f8f4;
        }

        .student-list {
          display: flex;
          flex-direction: column;

          gap: 5px;
        }

        .student-row {
          width: 100%;

          min-height: 52px;

          display: flex;
          align-items: center;

          gap: 9px;

          padding: 7px 9px;

          border:
            1px solid #edf1f2;

          border-radius: 9px;

          background: #fbfcfc;

          cursor: pointer;

          text-align: left;

          transition: .16s ease;
        }

        .student-row:hover {
          border-color:
            #cce7e3;

          background:
            #f4fbfa;

          transform:
            translateX(2px);
        }

        .student-avatar {
          width: 33px;
          height: 33px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 9px;

          background:
            #e7f8f5;

          color: #098f83;

          font-size: 10px;
          font-weight: 900;
        }

        .student-info {
          min-width: 0;

          display: flex;
          flex-direction: column;

          gap: 3px;

          flex: 1;
        }

        .student-info strong {
          overflow: hidden;

          color: #3c575d;

          font-size: 8px;

          text-overflow: ellipsis;

          white-space: nowrap;
        }

        .student-info span {
          color: #9ba8ab;

          font-size: 6.5px;
        }

        .student-status {
          padding: 4px 7px;

          border-radius: 6px;

          background: #eaf9f3;

          color: #29916e;

          font-size: 6px;
          font-weight: 800;
        }

        .student-row > b {
          color: #9eacad;

          font-size: 12px;

          font-weight: 400;
        }

        .empty {
          min-height: 180px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-direction: column;

          gap: 6px;

          text-align: center;
        }

        .empty-icon {
          width: 48px;
          height: 48px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 3px;

          border-radius: 14px;

          background: #f0f7f7;

          font-size: 21px;
        }

        .empty strong {
          color: #526a6f;

          font-size: 9px;
        }

        .empty span {
          max-width: 280px;

          color: #a0adaf;

          font-size: 7px;

          line-height: 1.4;
        }

        /* ====================================================
           SEARCH
        ==================================================== */

        .large-panel {
          min-height: 400px;
        }

        .count-badge {
          min-width: 31px;
          height: 26px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;

          background: #e9f9f6;

          color: #098e83;

          font-size: 8px;
          font-weight: 900;
        }

        .search-box {
          position: relative;

          margin-bottom: 12px;
        }

        .search-box span {
          position: absolute;

          left: 11px;
          top: 50%;

          transform:
            translateY(-50%);

          font-size: 11px;
        }

        .search-box input {
          width: 100%;
          height: 38px;

          padding:
            0 36px;

          border:
            1px solid #dce7e8;

          border-radius: 9px;

          outline: none;

          background: #f9fbfb;

          color: #29474f;

          font-size: 9px;
        }

        .search-box input:focus {
          border-color: #0bb9a7;

          background: white;

          box-shadow:
            0 0 0 3px
            rgba(11,185,167,.07);
        }

        .search-box button {
          position: absolute;

          right: 8px;
          top: 50%;

          transform:
            translateY(-50%);

          width: 24px;
          height: 24px;

          border: none;

          background: transparent;

          color: #91a0a3;

          cursor: pointer;

          font-size: 16px;
        }

        /* ====================================================
           ATIVIDADES
        ==================================================== */

        .activities-section {
          width: 100%;
        }

        .activities-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          margin-bottom: 16px;
        }

        .section-eyebrow {
          margin-bottom: 5px;

          color: #10a494;

          font-size: 6.5px;
          font-weight: 900;

          letter-spacing: 1.2px;
        }

        .activities-header h1 {
          margin: 0 0 5px;

          color: #183b43;

          font-size: 23px;

          letter-spacing: -.5px;
        }

        .activities-header p {
          margin: 0;

          color: #849599;

          font-size: 8px;

          line-height: 1.5;
        }

        .new-activity-button {
          min-width: 82px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 6px;

          border: none;

          border-radius: 9px;

          background:
            linear-gradient(
              135deg,
              #0dbbaa,
              #078c9c
            );

          color: white;

          cursor: pointer;

          box-shadow:
            0 8px 20px
            rgba(7,145,143,.16);

          font-size: 8px;
          font-weight: 900;

          transition:
            .18s ease;
        }

        .new-activity-button:hover {
          transform:
            translateY(-1px);

          box-shadow:
            0 10px 25px
            rgba(7,145,143,.22);
        }

        .new-activity-button span {
          font-size: 15px;

          line-height: 1;
        }

        .activity-toolbar {
          display: flex;
          align-items: center;

          gap: 10px;

          margin-bottom: 12px;
        }

        .activity-search {
          position: relative;

          flex: 1;
        }

        .activity-search > span {
          position: absolute;

          left: 12px;
          top: 50%;

          transform:
            translateY(-50%);

          font-size: 10px;
        }

        .activity-search input {
          width: 100%;
          height: 36px;

          padding:
            0 35px;

          border:
            1px solid #dce7e8;

          border-radius: 9px;

          outline: none;

          background: white;

          color: #29474f;

          font-size: 8px;
        }

        .activity-search input:focus {
          border-color: #0bb9a7;

          box-shadow:
            0 0 0 3px
            rgba(11,185,167,.07);
        }

        .activity-search button {
          position: absolute;

          right: 8px;
          top: 50%;

          transform:
            translateY(-50%);

          width: 22px;
          height: 22px;

          border: none;

          background: transparent;

          color: #91a0a3;

          cursor: pointer;

          font-size: 15px;
        }

        .activity-count {
          height: 36px;

          display: flex;
          align-items: center;

          padding: 0 11px;

          border:
            1px solid #dfeaea;

          border-radius: 9px;

          background: white;

          color: #7e9194;

          font-size: 7px;
          font-weight: 800;

          white-space: nowrap;
        }

        .activities-list {
          display: flex;
          flex-direction: column;

          gap: 10px;
        }

        .activity-card {
          position: relative;

          overflow: hidden;

          border:
            1px solid #dfe9e9;

          border-radius: 14px;

          background: white;

          box-shadow:
            0 7px 25px
            rgba(20,70,76,.045);

          cursor: pointer;

          transition:
            .18s ease;
        }

        .activity-card::before {
          content: "";

          position: absolute;

          left: 0;
          top: 0;
          bottom: 0;

          width: 3px;

          background:
            linear-gradient(
              180deg,
              #13c6b3,
              #078d9c
            );
        }

        .activity-card:hover {
          border-color:
            #cbe5e2;

          transform:
            translateY(-1px);

          box-shadow:
            0 10px 30px
            rgba(20,70,76,.08);
        }

        .activity-card-main {
          padding:
            17px 18px 14px 20px;
        }

        .activity-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 15px;
        }

        .activity-card-top h2 {
          margin: 0 0 5px;

          color: #24474e;

          font-size: 12px;
        }

        .activity-card-top p {
          max-width: 620px;

          margin: 0;

          overflow: hidden;

          color: #87989b;

          font-size: 7.5px;

          line-height: 1.45;

          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .competencia {
          min-width: 30px;
          height: 30px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 9px;

          font-size: 11px;
          font-weight: 900;
        }

        .competencia-a {
          background: #e5f8f3;
          color: #168f70;
        }

        .competencia-b {
          background: #eaf7fb;
          color: #20829b;
        }

        .competencia-c {
          background: #f3effb;
          color: #7657a7;
        }

        .competencia-d {
          background: #fff0ef;
          color: #c45a53;
        }

        .activity-card-info {
          display: flex;
          align-items: center;

          flex-wrap: wrap;

          gap: 16px;

          margin-top: 14px;

          padding-top: 11px;

          border-top:
            1px solid #edf2f2;
        }

        .activity-card-info span {
          display: flex;
          align-items: center;

          gap: 5px;

          color: #819397;

          font-size: 7px;
        }

        .activity-card-info b {
          font-size: 10px;
        }

        .activity-progress-area {
          margin-top: 12px;
        }

        .activity-progress-label {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 5px;
        }

        .activity-progress-label span {
          color: #99a7aa;

          font-size: 6.5px;
        }

        .activity-progress-label strong {
          color: #687d81;

          font-size: 6.5px;
        }

        .activity-progress {
          width: 100%;
          height: 5px;

          overflow: hidden;

          border-radius: 99px;

          background: #edf3f3;
        }

        .activity-progress > div {
          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #16c5b1,
              #07919f
            );

          transition:
            width .25s ease;
        }

        .activity-bottom {
          display: flex;
          align-items: center;

          gap: 12px;

          margin-top: 10px;
        }

        .activity-bottom span {
          font-size: 6.5px;
          font-weight: 800;
        }

        .delivered {
          color: #27926e;
        }

        .pending {
          color: #b58a49;
        }

        .activity-open {
          margin-left: auto;

          color: #098e83;
        }

        .activities-empty {
          min-height: 350px;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          padding: 30px;

          border:
            1px dashed #d7e5e5;

          border-radius: 15px;

          background:
            rgba(255,255,255,.75);

          text-align: center;
        }

        .activities-empty-icon {
          width: 62px;
          height: 62px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 12px;

          border-radius: 18px;

          background: #eaf9f6;

          font-size: 27px;
        }

        .activities-empty h2 {
          margin: 0 0 6px;

          color: #526a6f;

          font-size: 13px;
        }

        .activities-empty p {
          max-width: 330px;

          margin: 0;

          color: #9aa8aa;

          font-size: 7.5px;

          line-height: 1.5;
        }

        .activities-empty strong {
          color: #098e83;
        }

        .empty-new-button {
          margin-top: 16px;

          padding: 9px 13px;

          border:
            1px solid #d1e9e5;

          border-radius: 8px;

          background: #effaf8;

          color: #098d83;

          cursor: pointer;

          font-size: 7px;
          font-weight: 900;
        }

        /* ====================================================
           FEATURE
        ==================================================== */

        .feature-panel {
          min-height: 390px;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          text-align: center;
        }

        .feature-icon {
          width: 65px;
          height: 65px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 12px;

          border-radius: 18px;

          background: #eaf9f7;

          font-size: 27px;
        }

        .feature-panel h2 {
          margin: 0 0 7px;

          color: #274950;

          font-size: 17px;
        }

        .feature-panel p {
          max-width: 420px;

          margin: 0;

          color: #8b9b9e;

          font-size: 8px;

          line-height: 1.5;
        }

        .coming {
          margin-top: 17px;

          padding: 7px 10px;

          border-radius: 7px;

          background: #f1f5f5;

          color: #94a2a4;

          font-size: 6px;
          font-weight: 900;

          letter-spacing: .8px;
        }

        .competencies {
          display: flex;
          flex-wrap: wrap;

          justify-content: center;

          gap: 6px;

          margin-top: 15px;
        }

        .competencies span {
          padding: 6px 9px;

          border-radius: 7px;

          background: #f0f8f7;

          color: #397b74;

          font-size: 7px;
          font-weight: 800;
        }

        /* ====================================================
           PROFILE
        ==================================================== */

        .profile-panel {
          min-height: 420px;

          display: flex;
          flex-direction: column;

          align-items: center;

          text-align: center;
        }

        .profile-big-avatar {
          width: 72px;
          height: 72px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 10px;

          border-radius: 20px;

          background:
            linear-gradient(
              145deg,
              #16c6b3,
              #078c9c
            );

          color: white;

          font-size: 26px;
          font-weight: 900;
        }

        .profile-panel h2 {
          margin: 0;

          color: #25474e;

          font-size: 17px;
        }

        .profile-panel > p {
          margin: 4px 0 18px;

          color: #9aa8aa;

          font-size: 8px;
        }

        .profile-data {
          width: 100%;
          max-width: 500px;

          display: grid;

          grid-template-columns:
            repeat(3,1fr);

          gap: 8px;
        }

        .profile-data div {
          padding: 12px 8px;

          border:
            1px solid #e3ebec;

          border-radius: 9px;

          background: #fafcfc;
        }

        .profile-data span {
          display: block;

          margin-bottom: 5px;

          color: #9aa7a9;

          font-size: 6px;
          font-weight: 800;
        }

        .profile-data strong {
          color: #476268;

          font-size: 8px;
        }

        /* ====================================================
           MODAIS
        ==================================================== */

        .modal-background {
          position: fixed;

          z-index: 100;

          inset: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 20px;

          background:
            rgba(3,28,34,.60);

          backdrop-filter:
            blur(5px);
        }

        .modal {
          position: relative;

          width: 100%;
          max-width: 350px;

          padding: 25px;

          border-radius: 18px;

          background: white;

          box-shadow:
            0 25px 70px
            rgba(0,0,0,.30);

          text-align: center;

          animation:
            modal-in .2s ease;
        }

        @keyframes modal-in {
          from {
            opacity: 0;

            transform:
              translateY(10px)
              scale(.97);
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }
        }

        .modal-close {
          position: absolute;

          right: 11px;
          top: 11px;

          width: 28px;
          height: 28px;

          border: none;

          border-radius: 8px;

          background: #f3f6f6;

          color: #819194;

          cursor: pointer;

          font-size: 18px;
        }

        .modal-close:hover {
          background: #e8f0f0;

          color: #536c70;
        }

        .modal-avatar {
          width: 55px;
          height: 55px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin: 0 auto 8px;

          border-radius: 16px;

          background: #e5f8f5;

          color: #078d82;

          font-size: 19px;
          font-weight: 900;
        }

        .modal-eyebrow {
          color: #0ba393;

          font-size: 6px;
          font-weight: 900;

          letter-spacing: 1px;
        }

        .modal h2 {
          margin: 5px 0 2px;

          color: #23474e;

          font-size: 16px;
        }

        .modal-user {
          margin: 0;

          color: #98a6a9;

          font-size: 8px;
        }

        .modal-data {
          display: grid;

          grid-template-columns:
            repeat(3,1fr);

          gap: 6px;

          margin-top: 17px;
        }

        .modal-data div {
          padding: 9px 5px;

          border-radius: 8px;

          background: #f7fafa;
        }

        .modal-data span {
          display: block;

          margin-bottom: 4px;

          color: #9ba8aa;

          font-size: 6px;
        }

        .modal-data strong {
          color: #4b6469;

          font-size: 7px;
        }

        .active-text {
          color: #20926d !important;
        }

        .modal-button {
          width: 100%;
          height: 37px;

          margin-top: 13px;

          border: none;

          border-radius: 8px;

          background:
            linear-gradient(
              135deg,
              #0bb9a7,
              #078c9b
            );

          color: white;

          cursor: pointer;

          font-size: 8px;
          font-weight: 900;
        }

        .modal-button:hover {
          filter: brightness(1.04);
        }

        /* ====================================================
           NOVA ATIVIDADE
        ==================================================== */

        .activity-modal-background {
          align-items: center;

          overflow-y: auto;
        }

        .new-activity-modal {
          position: relative;

          width: 100%;

          max-width: 480px;

          max-height:
            calc(100vh - 40px);

          overflow-y: auto;

          padding: 24px;

          border-radius: 18px;

          background: white;

          box-shadow:
            0 25px 70px
            rgba(0,0,0,.30);

          animation:
            modal-in .2s ease;
        }

        .new-activity-modal-header {
          position: relative;

          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          margin-bottom: 21px;

          padding-bottom: 15px;

          border-bottom:
            1px solid #edf2f2;
        }

        .new-activity-modal-header > div {
          display: flex;
          flex-direction: column;

          gap: 3px;
        }

        .new-activity-modal-header span {
          color: #0ba393;

          font-size: 6px;
          font-weight: 900;

          letter-spacing: 1px;
        }

        .new-activity-modal-header h2 {
          margin: 0;

          color: #24474e;

          font-size: 15px;

          letter-spacing: -.2px;
        }

        .form-field {
          margin-bottom: 14px;
        }

        .form-field label {
          display: block;

          margin-bottom: 6px;

          color: #536a6f;

          font-size: 7px;
          font-weight: 900;
        }

        .form-field input,
        .form-field textarea,
        .form-field select {
          width: 100%;

          border:
            1px solid #dce7e8;

          border-radius: 8px;

          outline: none;

          background: #fafcfc;

          color: #29474f;

          font-family: inherit;

          font-size: 8px;

          transition:
            .16s ease;
        }

        .form-field input,
        .form-field select {
          height: 37px;

          padding:
            0 10px;
        }

        .form-field textarea {
          min-height: 82px;

          padding: 10px;

          resize: vertical;

          line-height: 1.5;
        }

        .form-field input::placeholder,
        .form-field textarea::placeholder {
          color: #b1bdbe;
        }

        .form-field input:focus,
        .form-field textarea:focus,
        .form-field select:focus {
          border-color: #0bb9a7;

          background: white;

          box-shadow:
            0 0 0 3px
            rgba(11,185,167,.07);
        }

        .form-field select {
          cursor: pointer;
        }

        .competencia-selector {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 7px;
        }

        .competencia-option {
          height: 51px;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          gap: 2px;

          border:
            1px solid #e0e9e9;

          border-radius: 9px;

          background: #fafcfc;

          cursor: pointer;

          transition:
            .16s ease;
        }

        .competencia-option strong {
          font-size: 13px;
        }

        .competencia-option span {
          font-size: 5.5px;
          font-weight: 800;
        }

        .competencia-option.a {
          color: #168f70;
        }

        .competencia-option.b {
          color: #20829b;
        }

        .competencia-option.c {
          color: #7657a7;
        }

        .competencia-option.d {
          color: #c45a53;
        }

        .competencia-option.a:hover,
        .competencia-option.a.selected {
          background: #e5f8f3;

          border-color:
            #bce9df;
        }

        .competencia-option.b:hover,
        .competencia-option.b.selected {
          background: #eaf7fb;

          border-color:
            #c9e8ef;
        }

        .competencia-option.c:hover,
        .competencia-option.c.selected {
          background: #f3effb;

          border-color:
            #dfd2ef;
        }

        .competencia-option.d:hover,
        .competencia-option.d.selected {
          background: #fff0ef;

          border-color:
            #f2cfcb;
        }

        .form-warning {
          display: block;

          margin-top: 5px;

          color: #b18145;

          font-size: 6px;

          line-height: 1.4;
        }

        .activity-form-summary {
          display: grid;

          grid-template-columns:
            repeat(2,1fr);

          gap: 7px;

          margin-top: 4px;
          margin-bottom: 17px;

          padding: 10px;

          border-radius: 9px;

          background: #f5faf9;
        }

        .activity-form-summary div {
          display: flex;
          flex-direction: column;

          gap: 3px;
        }

        .activity-form-summary span {
          color: #91a1a3;

          font-size: 5.5px;

          text-transform: uppercase;

          letter-spacing: .4px;
        }

        .activity-form-summary strong {
          overflow: hidden;

          color: #487077;

          font-size: 7px;

          text-overflow: ellipsis;

          white-space: nowrap;
        }

        .form-actions {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 8px;
        }

        .cancel-button,
        .submit-button {
          height: 38px;

          border-radius: 8px;

          cursor: pointer;

          font-family: inherit;

          font-size: 7px;
          font-weight: 900;
        }

        .cancel-button {
          border:
            1px solid #dfe8e8;

          background: #f7f9f9;

          color: #75888b;
        }

        .cancel-button:hover {
          background: #eef3f3;
        }

        .submit-button {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 5px;

          border: none;

          background:
            linear-gradient(
              135deg,
              #0bb9a7,
              #078c9b
            );

          color: white;

          box-shadow:
            0 7px 17px
            rgba(7,145,143,.15);
        }

        .submit-button span {
          font-size: 11px;
        }

        .submit-button:hover {
          filter: brightness(1.04);
        }

        /* ====================================================
           DETALHES DA ATIVIDADE
        ==================================================== */

        .activity-detail-modal {
          position: relative;

          width: 100%;

          max-width: 520px;

          padding: 24px;

          border-radius: 18px;

          background: white;

          box-shadow:
            0 25px 70px
            rgba(0,0,0,.30);

          animation:
            modal-in .2s ease;
        }

        .detail-top {
          display: flex;
          align-items: center;

          gap: 10px;

          padding-right: 25px;

          padding-bottom: 15px;

          border-bottom:
            1px solid #edf2f2;
        }

        .detail-icon {
          width: 45px;
          height: 45px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 13px;

          background: #eaf9f6;

          font-size: 20px;
        }

        .detail-top > div:nth-child(2) {
          min-width: 0;

          flex: 1;
        }

        .detail-top h2 {
          margin: 4px 0 0;

          overflow: hidden;

          color: #24474e;

          font-size: 14px;

          text-overflow: ellipsis;
        }

        .detail-description {
          margin-top: 15px;

          padding: 12px;

          border-radius: 9px;

          background: #f7faf9;
        }

        .detail-description > span {
          color: #8fa0a2;

          font-size: 5.5px;
          font-weight: 900;

          letter-spacing: .7px;
        }

        .detail-description p {
          margin: 6px 0 0;

          color: #5d7378;

          font-size: 8px;

          line-height: 1.55;
        }

        .detail-grid {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap: 7px;

          margin-top: 10px;
        }

        .detail-grid div {
          min-width: 0;

          padding: 10px;

          border:
            1px solid #e5eded;

          border-radius: 9px;

          background: #fbfcfc;
        }

        .detail-grid span {
          display: block;

          margin-bottom: 5px;

          color: #98a6a8;

          font-size: 5.5px;
        }

        .detail-grid strong {
          display: block;

          overflow: hidden;

          color: #506a70;

          font-size: 7px;

          text-overflow: ellipsis;

          white-space: nowrap;
        }

        .detail-green {
          color: #29916e !important;
        }

        .detail-orange {
          color: #b38448 !important;
        }

        .detail-progress {
          margin-top: 15px;
        }

        .detail-actions {
          display: grid;

          grid-template-columns:
            auto 1fr;

          gap: 8px;

          margin-top: 17px;
        }

        .delete-button {
          height: 37px;

          padding: 0 12px;

          border:
            1px solid #f0d8d6;

          border-radius: 8px;

          background: #fff7f6;

          color: #b75b54;

          cursor: pointer;

          font-size: 7px;
          font-weight: 900;
        }

        .delete-button:hover {
          background: #fff0ee;
        }

        .detail-close-button {
          margin-top: 0;
        }

        /* ====================================================
           MOBILE OVERLAY
        ==================================================== */

        .mobile-overlay {
          display: none;
        }

        /* ====================================================
           TABLET
        ==================================================== */

        @media (max-width: 850px) {

          .sidebar {
            width: 200px;
          }

          .main {
            width:
              calc(100% - 200px);

            margin-left: 200px;
          }

          .content {
            padding:
              22px 18px 35px;
          }

          .topbar {
            padding:
              0 18px;
          }

          .stats {
            gap: 8px;
          }

        }

        /* ====================================================
           CELULAR
        ==================================================== */

        @media (max-width: 700px) {

          .sidebar {
            width: 235px;

            transform:
              translateX(-100%);

            transition:
              transform .25s ease;
          }

          .sidebar.open {
            transform:
              translateX(0);
          }

          .mobile-overlay {
            position: fixed;

            z-index: 15;

            inset: 0;

            display: block;

            background:
              rgba(0,0,0,.45);
          }

          .main {
            width: 100%;

            margin-left: 0;
          }

          .topbar {
            height: 62px;

            padding:
              0 14px;
          }

          .menu-button {
            width: 34px;
            height: 34px;

            display: flex;
            align-items: center;
            justify-content: center;

            margin-right: 9px;

            border: none;

            border-radius: 9px;

            background: #eaf8f6;

            color: #078d82;

            cursor: pointer;

            font-size: 16px;
          }

          .top-user-info {
            display: none;
          }

          .content {
            padding:
              15px 11px 30px;
          }

          .welcome-card {
            min-height: 135px;

            padding:
              19px;

            border-radius: 15px;
          }

          .welcome-card h1 {
            font-size: 21px;
          }

          .welcome-card p {
            max-width: 80%;

            font-size: 8px;
          }

          .welcome-symbol {
            width: 58px;
            height: 58px;

            border-radius: 16px;

            font-size: 27px;
          }

          .stats {
            grid-template-columns:
              1fr;

            gap: 7px;
          }

          .stat-card {
            min-height: 70px;
          }

          .panel {
            padding: 15px;

            border-radius: 13px;
          }

          .panel-header h2 {
            font-size: 12px;
          }

          .student-status {
            display: none;
          }

          .profile-data {
            grid-template-columns:
              1fr;
          }

          /* ================================================
             ATIVIDADES MOBILE
          ================================================ */

          .activities-header {
            align-items: flex-start;
          }

          .activities-header h1 {
            font-size: 20px;
          }

          .activities-header p {
            max-width: 220px;
          }

          .new-activity-button {
            min-width: 70px;

            height: 36px;
          }

          .activity-toolbar {
            align-items: stretch;

            flex-direction: column;
          }

          .activity-count {
            width: fit-content;
          }

          .activity-card-main {
            padding:
              15px 14px 13px 17px;
          }

          .activity-card-top {
            gap: 8px;
          }

          .activity-card-top h2 {
            font-size: 11px;
          }

          .activity-card-top p {
            font-size: 7px;
          }

          .activity-card-info {
            gap: 10px;
          }

          .activity-bottom {
            flex-wrap: wrap;
          }

          .activity-open {
            width: 100%;

            margin-left: 0;

            padding-top: 2px;
          }

          .new-activity-modal {
            max-height:
              calc(100vh - 20px);

            padding: 19px;

            border-radius: 15px;
          }

          .competencia-selector {
            gap: 5px;
          }

          .competencia-option {
            height: 47px;
          }

          .activity-detail-modal {
            padding: 19px;
          }

        }

        /* ====================================================
           CELULARES PEQUENOS
        ==================================================== */

        @media (max-width: 420px) {

          .welcome-card {
            align-items: flex-start;
          }

          .welcome-symbol {
            width: 48px;
            height: 48px;

            font-size: 21px;
          }

          .welcome-card h1 {
            font-size: 19px;
          }

          .topbar-title strong {
            font-size: 12px;
          }

          .student-row {
            min-height: 49px;
          }

          .student-avatar {
            width: 30px;
            height: 30px;
          }

          .modal {
            padding: 20px;
          }

          .modal-data {
            grid-template-columns:
              1fr;
          }

          .activities-header {
            gap: 8px;
          }

          .activities-header p {
            max-width: 190px;
          }

          .new-activity-button {
            min-width: 63px;

            padding: 0 8px;

            font-size: 7px;
          }

          .new-activity-modal {
            padding: 17px;
          }

          .competencia-option strong {
            font-size: 12px;
          }

          .competencia-option span {
            font-size: 5px;
          }

          .activity-form-summary {
            grid-template-columns:
              1fr;
          }

          .form-actions {
            grid-template-columns:
              1fr;
          }

          .detail-grid {
            grid-template-columns:
              1fr;
          }

          .detail-actions {
            grid-template-columns:
              1fr;
          }

          .delete-button {
            width: 100%;
          }

        }

      `}</style>

    </main>
  );
}