 "use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

/* ============================================================
   P.A.C.
   Plataforma de Atividade Curricular

   app/cadastro-professor/page.tsx
   ============================================================ */

interface Professor {
  nome: string;
  usuario: string;
  senha: string;
  disciplina: string;
  tipo: "professor" | "professora";
  dataCadastro: string;
}

export default function CadastroProfessorPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] =
    useState("");

  const [disciplina, setDisciplina] =
    useState("");

  const [tipo, setTipo] =
    useState<
      "professor" | "professora"
    >("professor");

  const [aceite, setAceite] =
    useState(false);

  const [mostrarSenha, setMostrarSenha] =
    useState(false);

  const [
    mostrarConfirmarSenha,
    setMostrarConfirmarSenha,
  ] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] =
    useState(false);

  /* ============================================================
     LIMPAR MENSAGENS
  ============================================================ */

  function limparMensagens() {
    setErro("");
    setSucesso("");
  }

  /* ============================================================
     VALIDAR NOME
  ============================================================ */

  function validarNome(
    valor: string
  ) {
    const partes = valor
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return partes.length >= 2;
  }

  /* ============================================================
     VALIDAR USUÁRIO
  ============================================================ */

  function validarUsuario(
    valor: string
  ) {
    return /^[a-zA-Z0-9._-]+$/.test(
      valor
    );
  }

  /* ============================================================
     CADASTRO
  ============================================================ */

  function handleCadastro(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (carregando) return;

    limparMensagens();

    const nomeLimpo =
      nome.trim();

    const usuarioLimpo =
      usuario
        .trim()
        .toLowerCase();

    const disciplinaLimpa =
      disciplina.trim();

    /* --------------------------------------------------------
       NOME
    -------------------------------------------------------- */

    if (!nomeLimpo) {
      setErro(
        "Digite o nome completo do professor ou professora."
      );
      return;
    }

    if (!validarNome(nomeLimpo)) {
      setErro(
        "Digite o nome completo, incluindo nome e sobrenome."
      );
      return;
    }

    /* --------------------------------------------------------
       DISCIPLINA
    -------------------------------------------------------- */

    if (!disciplinaLimpa) {
      setErro(
        "Informe a disciplina que você leciona."
      );
      return;
    }

    if (disciplinaLimpa.length < 2) {
      setErro(
        "Informe uma disciplina válida."
      );
      return;
    }

    /* --------------------------------------------------------
       USUÁRIO
    -------------------------------------------------------- */

    if (!usuarioLimpo) {
      setErro(
        "Digite um usuário."
      );
      return;
    }

    if (usuarioLimpo.length < 3) {
      setErro(
        "O usuário precisa ter pelo menos 3 caracteres."
      );
      return;
    }

    if (usuarioLimpo.length > 30) {
      setErro(
        "O usuário pode ter no máximo 30 caracteres."
      );
      return;
    }

    if (!validarUsuario(usuarioLimpo)) {
      setErro(
        "O usuário pode conter apenas letras, números, ponto, hífen e underline."
      );
      return;
    }

    /* --------------------------------------------------------
       USUÁRIOS RESERVADOS
    -------------------------------------------------------- */

    const usuariosReservados = [
      "professor",
      "professora",
      "admin",
      "administrador",
    ];

    if (
      usuariosReservados.includes(
        usuarioLimpo
      )
    ) {
      setErro(
        "Esse usuário é reservado pela plataforma. Escolha outro usuário."
      );
      return;
    }

    /* --------------------------------------------------------
       SENHA
    -------------------------------------------------------- */

    if (!senha) {
      setErro(
        "Digite uma senha."
      );
      return;
    }

    if (senha.length < 6) {
      setErro(
        "A senha precisa ter pelo menos 6 caracteres."
      );
      return;
    }

    /* --------------------------------------------------------
       CONFIRMAR SENHA
    -------------------------------------------------------- */

    if (!confirmarSenha) {
      setErro(
        "Confirme sua senha."
      );
      return;
    }

    if (senha !== confirmarSenha) {
      setErro(
        "As senhas não são iguais."
      );
      return;
    }

    /* --------------------------------------------------------
       ACEITE
    -------------------------------------------------------- */

    if (!aceite) {
      setErro(
        "Confirme que as informações fornecidas são verdadeiras."
      );
      return;
    }

    setCarregando(true);

    try {
      /* ------------------------------------------------------
         RECUPERA PROFESSORES
      ------------------------------------------------------ */

      const dadosSalvos =
        localStorage.getItem(
          "pac_professores"
        );

      let professores: Professor[] =
        [];

      if (dadosSalvos) {
        try {
          const dados =
            JSON.parse(
              dadosSalvos
            );

          if (Array.isArray(dados)) {
            professores =
              dados.filter(
                (
                  item
                ): item is Professor =>
                  item !== null &&
                  typeof item ===
                    "object" &&
                  typeof item.nome ===
                    "string" &&
                  typeof item.usuario ===
                    "string" &&
                  typeof item.senha ===
                    "string"
              );
          }
        } catch {
          professores = [];
        }
      }

      /* ------------------------------------------------------
         VERIFICA USUÁRIO EXISTENTE
      ------------------------------------------------------ */

      const usuarioExiste =
        professores.some(
          (professor) =>
            professor.usuario
              .trim()
              .toLowerCase() ===
            usuarioLimpo
        );

      if (usuarioExiste) {
        setErro(
          "Esse usuário já está cadastrado. Escolha outro."
        );

        setCarregando(false);
        return;
      }

      /* ------------------------------------------------------
         NOVO PROFESSOR
      ------------------------------------------------------ */

      const novoProfessor: Professor =
        {
          nome: nomeLimpo,

          usuario:
            usuarioLimpo,

          senha,

          disciplina:
            disciplinaLimpa,

          tipo,

          dataCadastro:
            new Date().toISOString(),
        };

      /* ------------------------------------------------------
         SALVA
      ------------------------------------------------------ */

      const novosProfessores = [
        ...professores,
        novoProfessor,
      ];

      localStorage.setItem(
        "pac_professores",
        JSON.stringify(
          novosProfessores
        )
      );

      /* ------------------------------------------------------
         SUCESSO
      ------------------------------------------------------ */

      setSucesso(
        `Cadastro realizado com sucesso, ${nomeLimpo}! Seu acesso à área docente já está disponível.`
      );

      setNome("");
      setUsuario("");
      setSenha("");
      setConfirmarSenha("");
      setDisciplina("");
      setAceite(false);
      setMostrarSenha(false);
      setMostrarConfirmarSenha(false);

      setCarregando(false);
    } catch (error) {
      console.error(
        "[P.A.C.] Erro ao cadastrar professor:",
        error
      );

      setErro(
        "Não foi possível realizar o cadastro. Tente novamente."
      );

      setCarregando(false);
    }
  }

  /* ============================================================
     VOLTAR
  ============================================================ */

  function voltarLogin() {
    router.push("/login");
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <main className="page">

      <div className="background">
        <div className="glow glow-one" />
        <div className="glow glow-two" />
        <div className="glow glow-three" />
        <div className="grid" />
      </div>

      <section className="container">

        {/* =====================================================
            CABEÇALHO
        ===================================================== */}

        <header className="header">

          <button
            type="button"
            className="back-button"
            onClick={voltarLogin}
          >
            ← Voltar para o login
          </button>

          <div className="logo">
            P.A.C.
          </div>

          <div className="eyebrow">
            ÁREA DOCENTE
          </div>

          <h1>
            Cadastro de Professor
          </h1>

          <p>
            Crie seu acesso à área docente da P.A.C.
          </p>

        </header>

        {/* =====================================================
            CARD
        ===================================================== */}

        <section className="card">

          <div className="card-heading">

            <div className="heading-icon">
              👨‍🏫
            </div>

            <div>
              <h2>
                Criar acesso docente
              </h2>

              <p>
                Informe seus dados profissionais.
              </p>
            </div>

          </div>

          {/* ===================================================
              INFORMAÇÕES
          =================================================== */}

          <div className="info-box">

            <div className="info-icon">
              ✓
            </div>

            <div>

              <strong>
                Acesso à área do professor
              </strong>

              <span>
                Após o cadastro, utilize seu usuário e senha no login da P.A.C.
              </span>

            </div>

          </div>

          {/* ===================================================
              FORMULÁRIO
          =================================================== */}

          <form
            onSubmit={handleCadastro}
          >

            {/* NOME */}

            <div className="field">

              <label htmlFor="nome">
                Nome completo
              </label>

              <div className="input-wrapper">

                <span>
                  👤
                </span>

                <input
                  id="nome"
                  type="text"
                  value={nome}
                  placeholder="Nome e sobrenome"
                  autoComplete="name"
                  onChange={(event) => {
                    setNome(
                      event.target.value
                    );
                    limparMensagens();
                  }}
                  disabled={carregando}
                />

              </div>

            </div>

            {/* DISCIPLINA */}

            <div className="field">

              <label htmlFor="disciplina">
                Disciplina
              </label>

              <div className="input-wrapper">

                <span>
                  📚
                </span>

                <input
                  id="disciplina"
                  type="text"
                  value={disciplina}
                  placeholder="Ex.: Programação"
                  onChange={(event) => {
                    setDisciplina(
                      event.target.value
                    );
                    limparMensagens();
                  }}
                  disabled={carregando}
                />

              </div>

            </div>

            {/* TIPO */}

            <div className="field">

              <label>
                Identificação
              </label>

              <div className="type-grid">

                <button
                  type="button"
                  className={
                    tipo === "professor"
                      ? "type active"
                      : "type"
                  }
                  onClick={() =>
                    setTipo(
                      "professor"
                    )
                  }
                  disabled={carregando}
                >
                  👨‍🏫 Professor
                </button>

                <button
                  type="button"
                  className={
                    tipo === "professora"
                      ? "type active"
                      : "type"
                  }
                  onClick={() =>
                    setTipo(
                      "professora"
                    )
                  }
                  disabled={carregando}
                >
                  👩‍🏫 Professora
                </button>

              </div>

            </div>

            {/* USUÁRIO */}

            <div className="field">

              <label htmlFor="usuario">
                Usuário
              </label>

              <div className="input-wrapper">

                <span>
                  @
                </span>

                <input
                  id="usuario"
                  type="text"
                  value={usuario}
                  placeholder="Crie seu usuário"
                  autoComplete="username"
                  maxLength={30}
                  onChange={(event) => {
                    setUsuario(
                      event.target.value
                    );
                    limparMensagens();
                  }}
                  disabled={carregando}
                />

              </div>

              <small>
                Letras, números, ponto, hífen e underline.
              </small>

            </div>

            {/* SENHA */}

            <div className="field">

              <label htmlFor="senha">
                Senha
              </label>

              <div className="input-wrapper">

                <span>
                  🔒
                </span>

                <input
                  id="senha"
                  type={
                    mostrarSenha
                      ? "text"
                      : "password"
                  }
                  value={senha}
                  placeholder="Mínimo de 6 caracteres"
                  autoComplete="new-password"
                  onChange={(event) => {
                    setSenha(
                      event.target.value
                    );
                    limparMensagens();
                  }}
                  disabled={carregando}
                />

                <button
                  type="button"
                  className="eye"
                  onClick={() =>
                    setMostrarSenha(
                      (valor) =>
                        !valor
                    )
                  }
                >
                  {mostrarSenha
                    ? "◉"
                    : "○"}
                </button>

              </div>

            </div>

            {/* CONFIRMAR */}

            <div className="field">

              <label htmlFor="confirmarSenha">
                Confirmar senha
              </label>

              <div className="input-wrapper">

                <span>
                  🔐
                </span>

                <input
                  id="confirmarSenha"
                  type={
                    mostrarConfirmarSenha
                      ? "text"
                      : "password"
                  }
                  value={
                    confirmarSenha
                  }
                  placeholder="Digite novamente"
                  autoComplete="new-password"
                  onChange={(event) => {
                    setConfirmarSenha(
                      event.target.value
                    );
                    limparMensagens();
                  }}
                  disabled={carregando}
                />

                <button
                  type="button"
                  className="eye"
                  onClick={() =>
                    setMostrarConfirmarSenha(
                      (valor) =>
                        !valor
                    )
                  }
                >
                  {mostrarConfirmarSenha
                    ? "◉"
                    : "○"}
                </button>

              </div>

            </div>

            {/* ACEITE */}

            <label className="check-row">

              <input
                type="checkbox"
                checked={aceite}
                onChange={(event) => {
                  setAceite(
                    event.target.checked
                  );
                  limparMensagens();
                }}
                disabled={carregando}
              />

              <span className="check">
                {aceite
                  ? "✓"
                  : ""}
              </span>

              <span className="check-text">

                <strong>
                  Confirmo minhas informações
                </strong>

                <small>
                  Declaro que os dados fornecidos são verdadeiros.
                </small>

              </span>

            </label>

            {/* ERRO */}

            {erro && (
              <div className="message error">

                <b>!</b>

                <span>
                  {erro}
                </span>

              </div>
            )}

            {/* SUCESSO */}

            {sucesso && (
              <div className="success-area">

                <div className="message success">

                  <b>✓</b>

                  <span>
                    {sucesso}
                  </span>

                </div>

                <button
                  type="button"
                  className="success-button"
                  onClick={
                    voltarLogin
                  }
                >
                  ← VOLTAR PARA O LOGIN
                </button>

              </div>
            )}

            {/* CRIAR */}

            {!sucesso && (
              <button
                type="submit"
                className="submit"
                disabled={carregando}
              >

                {carregando ? (
                  <>
                    <span className="spinner" />
                    CADASTRANDO...
                  </>
                ) : (
                  <>
                    CRIAR ACESSO DOCENTE
                    <b>→</b>
                  </>
                )}

              </button>
            )}

          </form>

          {!sucesso && (
            <div className="login-link">

              Já possui acesso?

              <button
                type="button"
                onClick={
                  voltarLogin
                }
              >
                Entrar na P.A.C. →
              </button>

            </div>
          )}

        </section>

        <footer>
          <strong>
            P.A.C. v1.0
          </strong>

          <span>
            Plataforma de Atividade Curricular
          </span>
        </footer>

      </section>

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          min-height: 100svh;

          position: relative;

          display: flex;
          justify-content: center;

          padding: 22px 15px;

          overflow-x: hidden;

          background:
            radial-gradient(
              circle at 10% 10%,
              rgba(30,220,198,.17),
              transparent 32%
            ),
            radial-gradient(
              circle at 90% 90%,
              rgba(9,155,173,.20),
              transparent 35%
            ),
            linear-gradient(
              135deg,
              #04191f,
              #06333d 50%,
              #087986
            );

          font-family:
            Inter,
            Arial,
            sans-serif;
        }

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
          width: 430px;
          height: 430px;

          top: -250px;
          left: -180px;

          background:
            rgba(31,220,199,.13);
        }

        .glow-two {
          width: 520px;
          height: 520px;

          right: -280px;
          bottom: -300px;

          background:
            rgba(5,178,197,.13);
        }

        .glow-three {
          width: 200px;
          height: 200px;

          right: 15%;
          top: 15%;

          background:
            rgba(255,255,255,.025);
        }

        .grid {
          position: absolute;
          inset: 0;

          opacity: .025;

          background-image:
            linear-gradient(
              rgba(255,255,255,.8) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,.8) 1px,
              transparent 1px
            );

          background-size: 35px 35px;
        }

        .container {
          position: relative;

          z-index: 2;

          width: 100%;
          max-width: 470px;

          margin: auto;
        }

        .header {
          text-align: center;

          color: white;

          margin-bottom: 13px;
        }

        .back-button {
          margin-bottom: 9px;

          padding: 6px 11px;

          border:
            1px solid
            rgba(255,255,255,.13);

          border-radius: 8px;

          background:
            rgba(255,255,255,.07);

          color:
            rgba(255,255,255,.82);

          cursor: pointer;

          font-size: 9px;
        }

        .back-button:hover {
          background:
            rgba(255,255,255,.13);
        }

        .logo {
          width: 48px;
          height: 48px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin: 0 auto 7px;

          border-radius: 14px;

          background:
            linear-gradient(
              145deg,
              #20ddc7,
              #078e9e
            );

          font-size: 13px;
          font-weight: 900;

          box-shadow:
            0 9px 25px
            rgba(0,0,0,.22);
        }

        .eyebrow {
          margin-bottom: 3px;

          color: #43d9c6;

          font-size: 7px;
          font-weight: 900;

          letter-spacing: 1.5px;
        }

        .header h1 {
          margin: 0;

          font-size: 20px;
          font-weight: 850;
        }

        .header p {
          margin: 4px 0 0;

          color:
            rgba(255,255,255,.63);

          font-size: 9px;
        }

        .card {
          padding: 20px;

          border:
            1px solid
            rgba(255,255,255,.85);

          border-radius: 18px;

          background:
            rgba(255,255,255,.985);

          box-shadow:
            0 25px 60px
            rgba(0,0,0,.30);
        }

        .card-heading {
          display: flex;
          align-items: center;

          gap: 10px;

          margin-bottom: 13px;
        }

        .heading-icon {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background: #e8faf7;

          font-size: 17px;
        }

        .card-heading h2 {
          margin: 0;

          color: #173b43;

          font-size: 15px;
        }

        .card-heading p {
          margin: 3px 0 0;

          color: #89979a;

          font-size: 9px;
        }

        .info-box {
          display: flex;

          gap: 8px;

          padding: 9px 10px;

          margin-bottom: 13px;

          border:
            1px solid #d2eee9;

          border-radius: 9px;

          background: #f1fbf9;
        }

        .info-icon {
          width: 19px;
          height: 19px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #0bb8a7;

          color: white;

          font-size: 10px;
          font-weight: 900;
        }

        .info-box div:last-child {
          display: flex;
          flex-direction: column;

          gap: 2px;
        }

        .info-box strong {
          color: #246962;

          font-size: 9px;
        }

        .info-box span {
          color: #718789;

          font-size: 8px;

          line-height: 1.35;
        }

        form {
          display: flex;
          flex-direction: column;

          gap: 10px;
        }

        .field {
          display: flex;
          flex-direction: column;

          gap: 4px;
        }

        .field label {
          color: #3f575d;

          font-size: 9px;
          font-weight: 800;
        }

        .input-wrapper {
          position: relative;
        }

        .input-wrapper > span {
          position: absolute;

          left: 11px;
          top: 50%;

          transform:
            translateY(-50%);

          font-size: 12px;

          pointer-events: none;
        }

        .input-wrapper input {
          width: 100%;
          height: 40px;

          padding:
            0 38px 0 34px;

          border:
            1px solid #dbe6e8;

          border-radius: 9px;

          outline: none;

          background: #f9fbfb;

          color: #173b43;

          font-size: 10px;
        }

        .input-wrapper input:focus {
          border-color: #0bb9a7;

          background: white;

          box-shadow:
            0 0 0 3px
            rgba(11,185,167,.08);
        }

        .field small {
          color: #8c9a9d;

          font-size: 7.5px;
        }

        .eye {
          position: absolute;

          right: 7px;
          top: 50%;

          transform:
            translateY(-50%);

          width: 26px;
          height: 26px;

          border: none;

          background: transparent;

          color: #8ba0a4;

          cursor: pointer;
        }

        .type-grid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 8px;
        }

        .type {
          height: 38px;

          border:
            1px solid #dce7e9;

          border-radius: 9px;

          background: #f8fafb;

          color: #64777b;

          cursor: pointer;

          font-size: 9px;
          font-weight: 700;
        }

        .type.active {
          border-color: #0bb9a7;

          background: #eafaf7;

          color: #087f8c;

          box-shadow:
            0 4px 12px
            rgba(11,185,167,.08);
        }

        .check-row {
          display: flex;

          align-items: flex-start;

          gap: 8px;

          padding: 9px;

          border:
            1px solid #e0e9eb;

          border-radius: 9px;

          background: #fafcfc;

          cursor: pointer;
        }

        .check-row input {
          position: absolute;

          opacity: 0;

          width: 0;
          height: 0;
        }

        .check {
          width: 18px;
          height: 18px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border:
            1.5px solid #c2d0d2;

          border-radius: 5px;

          background: white;

          color: white;

          font-size: 10px;
          font-weight: 900;
        }

        .check-row input:checked
        + .check {
          background: #0bb9a7;

          border-color:
            #0bb9a7;
        }

        .check-text {
          display: flex;
          flex-direction: column;

          gap: 2px;
        }

        .check-text strong {
          color: #43595e;

          font-size: 8.5px;
        }

        .check-text small {
          color: #89999d;

          font-size: 7.5px;
        }

        .message {
          display: flex;

          align-items: flex-start;

          gap: 7px;

          padding: 9px;

          border-radius: 8px;

          font-size: 8px;

          line-height: 1.4;
        }

        .message b {
          width: 17px;
          height: 17px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 50%;
        }

        .error {
          border:
            1px solid #ffd1d1;

          background: #fff4f4;

          color: #a63333;
        }

        .error b {
          background: #eb6c6c;
          color: white;
        }

        .success-area {
          padding: 10px;

          border:
            1px solid #c8ecdf;

          border-radius: 10px;

          background: #f1fcf7;
        }

        .success {
          padding: 3px;

          color: #28765d;
        }

        .success b {
          background: #0bb992;
          color: white;
        }

        .success-button {
          width: 100%;
          height: 38px;

          margin-top: 8px;

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

          font-size: 9px;
          font-weight: 900;
        }

        .submit {
          width: 100%;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          border: none;

          border-radius: 9px;

          background:
            linear-gradient(
              135deg,
              #0bb9a7,
              #078c9b
            );

          color: white;

          cursor: pointer;

          font-size: 9px;
          font-weight: 900;

          box-shadow:
            0 7px 17px
            rgba(7,140,155,.22);
        }

        .submit:hover:not(:disabled) {
          transform:
            translateY(-1px);
        }

        .submit:disabled {
          opacity: .65;
          cursor: wait;
        }

        .submit b {
          font-size: 14px;
          font-weight: 400;
        }

        .spinner {
          width: 12px;
          height: 12px;

          border:
            2px solid
            rgba(255,255,255,.35);

          border-top-color:
            white;

          border-radius: 50%;

          animation:
            spin .7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .login-link {
          display: flex;
          justify-content: center;

          gap: 4px;

          margin-top: 11px;

          color: #89979b;

          font-size: 8px;
        }

        .login-link button {
          padding: 0;

          border: none;

          background: transparent;

          color: #078f87;

          cursor: pointer;

          font-size: 8px;
          font-weight: 900;
        }

        footer {
          margin-top: 9px;

          text-align: center;

          color:
            rgba(255,255,255,.55);

          font-size: 7px;
        }

        footer strong {
          display: block;

          margin-bottom: 2px;
        }

        @media (max-width: 500px) {

          .page {
            padding:
              15px 10px 20px;
          }

          .card {
            padding: 17px 15px;
          }

          .header h1 {
            font-size: 18px;
          }

        }

      `}</style>

    </main>
  );
}