  "use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

/* ============================================================
   P.A.C.
   Plataforma de Atividade Curricular

   app/login/page.tsx

   LOGIN
   ------------------------------------------------------------
   ALUNO
   PROFESSOR

   Professores padrão:
   professor / professor
   professora / professora

   Professores cadastrados:
   localStorage -> pac_professores
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

interface Professor {
  nome: string;
  usuario: string;
  senha: string;
  disciplina: string;
  tipo: "professor" | "professora";
  dataCadastro: string;
}

type TipoLogin = "aluno" | "professor";

export default function LoginPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [tipo, setTipo] =
    useState<TipoLogin>("aluno");

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] =
    useState(false);

  /* ============================================================
     TROCAR TIPO
  ============================================================ */

  function trocarTipo(novoTipo: TipoLogin) {
    if (carregando) return;

    setTipo(novoTipo);
    setErro("");
    setSenha("");
    setMostrarSenha(false);
  }

  /* ============================================================
     LIMPAR SESSÃO
  ============================================================ */

  function limparSessaoAnterior() {
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

    sessionStorage.removeItem(
      "pac_aluno_nome"
    );

    sessionStorage.removeItem(
      "pac_aluno_usuario"
    );

    sessionStorage.removeItem(
      "pac_aluno"
    );
  }

  /* ============================================================
     LOGIN
  ============================================================ */

  function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (carregando) return;

    setErro("");

    const usuarioDigitado =
      usuario.trim().toLowerCase();

    const senhaDigitada = senha;

    if (!usuarioDigitado) {
      setErro("Digite seu usuário.");
      return;
    }

    if (!senhaDigitada) {
      setErro("Digite sua senha.");
      return;
    }

    setCarregando(true);

    if (tipo === "professor") {
      loginProfessor(
        usuarioDigitado,
        senhaDigitada
      );
    } else {
      loginAluno(
        usuarioDigitado,
        senhaDigitada
      );
    }
  }

  /* ============================================================
     LOGIN ALUNO
  ============================================================ */

  function loginAluno(
    usuarioDigitado: string,
    senhaDigitada: string
  ) {
    try {
      const dadosSalvos =
        localStorage.getItem(
          "pac_estudantes"
        );

      if (!dadosSalvos) {
        setErro(
          "Nenhum estudante cadastrado. Faça o cadastro primeiro."
        );

        setCarregando(false);
        return;
      }

      const dados = JSON.parse(
        dadosSalvos
      );

      if (!Array.isArray(dados)) {
        setErro(
          "Não foi possível acessar os estudantes cadastrados."
        );

        setCarregando(false);
        return;
      }

      const estudantes =
        dados.filter(
          (
            item
          ): item is Estudante =>
            item !== null &&
            typeof item === "object" &&
            typeof item.usuario === "string" &&
            typeof item.senha === "string"
        );

      const estudante =
        estudantes.find(
          (item) =>
            item.usuario
              .trim()
              .toLowerCase() ===
              usuarioDigitado &&
            item.senha === senhaDigitada
        );

      if (!estudante) {
        setErro(
          "Usuário ou senha inválidos."
        );

        setCarregando(false);
        return;
      }

      limparSessaoAnterior();

      sessionStorage.setItem(
        "pac_tipo_usuario",
        "aluno"
      );

      sessionStorage.setItem(
        "pac_usuario",
        estudante.usuario
      );

      sessionStorage.setItem(
        "pac_nome_usuario",
        estudante.nome
      );

      sessionStorage.setItem(
        "pac_aluno_nome",
        estudante.nome
      );

      sessionStorage.setItem(
        "pac_aluno_usuario",
        estudante.usuario
      );

      sessionStorage.setItem(
        "pac_aluno",
        JSON.stringify(estudante)
      );

      router.replace("/aluno");
    } catch (error) {
      console.error(
        "[P.A.C.] Erro ao realizar login do aluno:",
        error
      );

      setErro(
        "Erro ao acessar os estudantes cadastrados."
      );

      setCarregando(false);
    }
  }

  /* ============================================================
     LOGIN PROFESSOR
  ============================================================ */

  function loginProfessor(
    usuarioDigitado: string,
    senhaDigitada: string
  ) {
    try {
      /* --------------------------------------------------------
         PROFESSOR PADRÃO
      -------------------------------------------------------- */

      if (
        usuarioDigitado === "professor" &&
        senhaDigitada === "professor"
      ) {
        entrarComoProfessor(
          "professor",
          "Professor",
          "professor",
          "Computação"
        );

        return;
      }

      /* --------------------------------------------------------
         PROFESSORA PADRÃO
      -------------------------------------------------------- */

      if (
        usuarioDigitado === "professora" &&
        senhaDigitada === "professora"
      ) {
        entrarComoProfessor(
          "professora",
          "Professora",
          "professora",
          "Computação"
        );

        return;
      }

      /* --------------------------------------------------------
         PROFESSORES CADASTRADOS
      -------------------------------------------------------- */

      const dadosSalvos =
        localStorage.getItem(
          "pac_professores"
        );

      if (!dadosSalvos) {
        setErro(
          "Professor não encontrado. Verifique seu usuário e senha."
        );

        setCarregando(false);
        return;
      }

      const dados = JSON.parse(
        dadosSalvos
      );

      if (!Array.isArray(dados)) {
        setErro(
          "Não foi possível acessar os professores cadastrados."
        );

        setCarregando(false);
        return;
      }

      const professores =
        dados.filter(
          (
            item
          ): item is Professor =>
            item !== null &&
            typeof item === "object" &&
            typeof item.usuario === "string" &&
            typeof item.senha === "string" &&
            (
              item.tipo === "professor" ||
              item.tipo === "professora"
            )
        );

      const professor =
        professores.find(
          (item) =>
            item.usuario
              .trim()
              .toLowerCase() ===
              usuarioDigitado &&
            item.senha === senhaDigitada
        );

      if (!professor) {
        setErro(
          "Usuário ou senha inválidos."
        );

        setCarregando(false);
        return;
      }

      entrarComoProfessor(
        professor.tipo,
        professor.nome ||
          "Professor",
        professor.usuario,
        professor.disciplina ||
          "Computação"
      );
    } catch (error) {
      console.error(
        "[P.A.C.] Erro ao realizar login do professor:",
        error
      );

      setErro(
        "Erro ao acessar os professores cadastrados."
      );

      setCarregando(false);
    }
  }

  /* ============================================================
     ENTRAR COMO PROFESSOR
  ============================================================ */

  function entrarComoProfessor(
    tipoOriginal:
      | "professor"
      | "professora",
    nome: string,
    usuarioProfessor: string,
    disciplina: string
  ) {
    limparSessaoAnterior();

    sessionStorage.setItem(
      "pac_tipo_usuario",
      "professor"
    );

    sessionStorage.setItem(
      "pac_usuario",
      usuarioProfessor
    );

    sessionStorage.setItem(
      "pac_nome_usuario",
      nome
    );

    sessionStorage.setItem(
      "pac_tipo_professor",
      tipoOriginal
    );

    sessionStorage.setItem(
      "pac_disciplina",
      disciplina
    );

    router.replace("/professor");
  }

  /* ============================================================
     CADASTROS
  ============================================================ */

  function irParaCadastroAluno() {
    if (carregando) return;

    router.push("/cadastro");
  }

  function irParaCadastroProfessor() {
    if (carregando) return;

    router.push("/cadastro-professor");
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

      <div className="content">

        <header className="top-header">

          <div className="brand">

            <div className="brand-logo">
              <span>P</span>
              <small>.A.C.</small>
            </div>

            <div className="brand-text">
              <strong>P.A.C.</strong>

              <span>
                Plataforma de Atividade Curricular
              </span>
            </div>

          </div>

          <div className="online">
            <span />
            Online
          </div>

        </header>

        <section className="welcome">

          <div className="eyebrow">
            ACESSO ACADÊMICO
          </div>

          <h1>
            Bem-vindo
          </h1>

          <p>
            Acesse sua área acadêmica.
          </p>

        </section>

        <section className="login-card">

          <div className="profiles">

            <button
              type="button"
              className={`profile ${
                tipo === "aluno"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                trocarTipo("aluno")
              }
              disabled={carregando}
            >

              <span className="profile-icon">
                🎓
              </span>

              <span className="profile-info">

                <strong>
                  Aluno
                </strong>

                <small>
                  Área do estudante
                </small>

              </span>

              <span className="radio">
                {tipo === "aluno" && (
                  <i />
                )}
              </span>

            </button>

            <button
              type="button"
              className={`profile ${
                tipo === "professor"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                trocarTipo("professor")
              }
              disabled={carregando}
            >

              <span className="profile-icon">
                👨‍🏫
              </span>

              <span className="profile-info">

                <strong>
                  Professor
                </strong>

                <small>
                  Área docente
                </small>

              </span>

              <span className="radio">
                {tipo === "professor" && (
                  <i />
                )}
              </span>

            </button>

          </div>

          <form onSubmit={handleLogin}>

            <div className="field">

              <label htmlFor="usuario">
                Usuário
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  @
                </span>

                <input
                  id="usuario"
                  type="text"
                  value={usuario}
                  placeholder="Digite seu usuário"
                  autoComplete="username"
                  disabled={carregando}
                  onChange={(event) => {
                    setUsuario(
                      event.target.value
                    );
                    setErro("");
                  }}
                />

              </div>

            </div>

            <div className="field">

              <label htmlFor="senha">
                Senha
              </label>

              <div className="input-wrapper">

                <span className="input-icon lock">
                  ●
                </span>

                <input
                  id="senha"
                  type={
                    mostrarSenha
                      ? "text"
                      : "password"
                  }
                  value={senha}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  disabled={carregando}
                  onChange={(event) => {
                    setSenha(
                      event.target.value
                    );
                    setErro("");
                  }}
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setMostrarSenha(
                      (valor) =>
                        !valor
                    )
                  }
                  disabled={carregando}
                  aria-label={
                    mostrarSenha
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                >
                  {mostrarSenha
                    ? "◉"
                    : "○"}
                </button>

              </div>

            </div>

            {erro && (
              <div className="error">

                <span className="error-icon">
                  !
                </span>

                <span>
                  {erro}
                </span>

              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={carregando}
            >

              {carregando ? (
                <>
                  <span className="spinner" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <b>→</b>
                </>
              )}

            </button>

          </form>

          <div className="divider">
            <span>ou</span>
          </div>

          {tipo === "aluno" ? (

            <button
              type="button"
              className="register"
              onClick={
                irParaCadastroAluno
              }
            >

              <span className="register-plus">
                +
              </span>

              <span className="register-text">

                <strong>
                  Criar cadastro de aluno
                </strong>

                <small>
                  Ainda não possui uma conta?
                </small>

              </span>

              <span className="register-arrow">
                →
              </span>

            </button>

          ) : (

            <button
              type="button"
              className="register"
              onClick={
                irParaCadastroProfessor
              }
            >

              <span className="register-plus">
                +
              </span>

              <span className="register-text">

                <strong>
                  Cadastrar professor
                </strong>

                <small>
                  Criar acesso à área docente
                </small>

              </span>

              <span className="register-arrow">
                →
              </span>

            </button>

          )}

          <footer className="footer">
            <span>
              P.A.C. v1.0
            </span>

            <i />

            <span>
              Plataforma Acadêmica
            </span>
          </footer>

        </section>

      </div>

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
          align-items: center;

          padding: 30px 20px;

          overflow-x: hidden;

          background:
            radial-gradient(
              circle at 15% 10%,
              rgba(30,220,198,.18),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 90%,
              rgba(9,155,173,.20),
              transparent 32%
            ),
            linear-gradient(
              135deg,
              #04191f 0%,
              #062c35 48%,
              #075b65 100%
            );

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
        }

        .background {
          position: absolute;
          inset: 0;

          pointer-events: none;
          overflow: hidden;
        }

        .glow {
          position: absolute;
          border-radius: 50%;
        }

        .glow-one {
          width: 420px;
          height: 420px;

          left: -220px;
          top: -220px;

          background:
            rgba(25,220,199,.12);
        }

        .glow-two {
          width: 500px;
          height: 500px;

          right: -280px;
          bottom: -280px;

          background:
            rgba(5,178,197,.13);
        }

        .glow-three {
          width: 300px;
          height: 300px;

          right: 10%;
          top: -180px;

          background:
            rgba(21,220,198,.06);
        }

        .grid {
          position: absolute;
          inset: 0;

          opacity: .025;

          background-image:
            linear-gradient(
              rgba(255,255,255,.7) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,.7) 1px,
              transparent 1px
            );

          background-size: 35px 35px;
        }

        .content {
          position: relative;
          z-index: 2;

          width: 100%;
          max-width: 365px;
        }

        .top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 24px;
        }

        .brand {
          display: flex;
          align-items: center;

          gap: 10px;
        }

        .brand-logo {
          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background:
            linear-gradient(
              145deg,
              #16ccb7,
              #087f8c
            );

          color: white;

          box-shadow:
            0 8px 20px
            rgba(8,127,140,.30);
        }

        .brand-logo span {
          font-size: 18px;
          font-weight: 900;
        }

        .brand-logo small {
          margin-top: 8px;
          margin-left: -2px;

          font-size: 6px;
          font-weight: 900;
        }

        .brand-text {
          display: flex;
          flex-direction: column;

          gap: 2px;
        }

        .brand-text strong {
          color: white;

          font-size: 14px;
          font-weight: 900;
        }

        .brand-text span {
          color:
            rgba(255,255,255,.60);

          font-size: 7px;
          font-weight: 600;
        }

        .online {
          display: flex;
          align-items: center;

          gap: 6px;

          color:
            rgba(255,255,255,.72);

          font-size: 8px;
          font-weight: 700;
        }

        .online span {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #12c8a8;

          box-shadow:
            0 0 0 4px
            rgba(18,200,168,.12);
        }

        .welcome {
          margin-bottom: 20px;
        }

        .eyebrow {
          color: #42d9c5;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: 1.5px;
        }

        .welcome h1 {
          margin: 5px 0 4px;

          color: white;

          font-size: 27px;
          line-height: 1.1;

          letter-spacing: -.8px;
        }

        .welcome p {
          margin: 0;

          color:
            rgba(255,255,255,.62);

          font-size: 10px;
        }

        .login-card {
          width: 100%;

          padding: 23px 23px 17px;

          border:
            1px solid
            rgba(255,255,255,.92);

          border-radius: 18px;

          background:
            rgba(255,255,255,.985);

          box-shadow:
            0 30px 75px
            rgba(0,0,0,.35),
            0 5px 20px
            rgba(0,0,0,.10);

          animation:
            card-enter .4s ease both;
        }

        @keyframes card-enter {

          from {
            opacity: 0;
            transform:
              translateY(12px)
              scale(.98);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }

        }

        .profiles {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 8px;

          margin-bottom: 15px;
        }

        .profile {
          position: relative;

          height: 58px;

          display: flex;
          align-items: center;

          padding: 7px 9px;

          border:
            1px solid #e0e9eb;

          border-radius: 11px;

          background: #f8fafb;

          cursor: pointer;

          text-align: left;

          font-family: inherit;

          transition: .18s ease;
        }

        .profile:hover:not(:disabled) {
          transform:
            translateY(-1px);

          border-color:
            #b9ddd8;

          background:
            #fbfefe;
        }

        .profile.active {
          border-color:
            #10b9a7;

          background:
            linear-gradient(
              135deg,
              #effcf9,
              #e6f8f5
            );

          box-shadow:
            0 5px 14px
            rgba(11,180,162,.08);
        }

        .profile:disabled {
          opacity: .7;
          cursor: wait;
        }

        .profile-icon {
          width: 33px;
          height: 33px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 9px;

          background: white;

          font-size: 15px;

          box-shadow:
            0 2px 7px
            rgba(0,0,0,.05);
        }

        .profile-info {
          min-width: 0;

          display: flex;
          flex-direction: column;

          gap: 2px;

          margin-left: 7px;
        }

        .profile-info strong {
          color: #294b53;

          font-size: 9px;
          font-weight: 800;
        }

        .profile.active
        .profile-info strong {
          color: #087f8c;
        }

        .profile-info small {
          color: #97a6aa;

          font-size: 6.5px;

          white-space: nowrap;
        }

        .radio {
          position: absolute;

          top: 7px;
          right: 7px;

          width: 12px;
          height: 12px;

          display: flex;
          align-items: center;
          justify-content: center;

          border:
            1px solid #cad8da;

          border-radius: 50%;

          background: white;
        }

        .profile.active .radio {
          border-color:
            #10b9a7;
        }

        .radio i {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background:
            #10b9a7;
        }

        form {
          display: flex;
          flex-direction: column;

          gap: 10px;
        }

        .field {
          display: flex;
          flex-direction: column;

          gap: 5px;
        }

        label {
          color: #52696e;

          font-size: 8px;
          font-weight: 800;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;

          left: 12px;
          top: 50%;

          transform:
            translateY(-50%);

          color: #8ca0a4;

          font-size: 10px;
          font-weight: 900;

          pointer-events: none;
        }

        input {
          width: 100%;
          height: 42px;

          padding:
            0 38px 0 31px;

          border:
            1px solid #dce7e9;

          border-radius: 9px;

          outline: none;

          background: #f9fbfb;

          color: #29474f;

          font-family: inherit;

          font-size: 9px;
        }

        input:focus {
          border-color:
            #10b9a7;

          background: white;

          box-shadow:
            0 0 0 3px
            rgba(16,185,167,.08);
        }

        .show-password {
          position: absolute;

          right: 8px;
          top: 50%;

          transform:
            translateY(-50%);

          width: 25px;
          height: 25px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: none;
          border-radius: 7px;

          background: transparent;

          color: #8ba0a4;

          cursor: pointer;
        }

        .error {
          display: flex;
          align-items: center;

          gap: 7px;

          padding: 8px 9px;

          border:
            1px solid #ffd4d4;

          border-radius: 8px;

          background:
            #fff5f5;

          color:
            #ad4b4b;

          font-size: 8px;
          font-weight: 600;
        }

        .error-icon {
          width: 17px;
          height: 17px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 50%;

          background:
            #ee7070;

          color: white;

          font-weight: 900;
        }

        .login-button {
          width: 100%;
          height: 43px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          border: none;
          border-radius: 9px;

          background:
            linear-gradient(
              135deg,
              #11bba8,
              #078b9b
            );

          color: white;

          cursor: pointer;

          font-family: inherit;

          font-size: 9px;
          font-weight: 900;

          box-shadow:
            0 7px 17px
            rgba(7,139,155,.20);
        }

        .login-button:hover:not(:disabled) {
          transform:
            translateY(-1px);
        }

        .login-button:disabled {
          opacity: .65;
          cursor: wait;
        }

        .login-button b {
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

        .divider {
          display: flex;
          align-items: center;

          gap: 8px;

          margin: 12px 0;

          color: #a8b6b9;

          font-size: 7px;
          font-weight: 800;
        }

        .divider::before,
        .divider::after {
          content: "";

          flex: 1;

          height: 1px;

          background: #e7edef;
        }

        .register {
          width: 100%;
          min-height: 42px;

          display: flex;
          align-items: center;

          gap: 8px;

          padding: 6px 8px;

          border:
            1px solid #d7e9e6;

          border-radius: 9px;

          background: #f7fcfb;

          color: #078e85;

          cursor: pointer;

          font-family: inherit;

          text-align: left;
        }

        .register:hover {
          transform:
            translateY(-1px);

          background:
            #eefaf8;
        }

        .register-plus {
          width: 28px;
          height: 28px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 8px;

          background:
            #dff6f2;

          color:
            #078e85;

          font-size: 16px;
          font-weight: 700;
        }

        .register-text {
          min-width: 0;
          flex: 1;

          display: flex;
          flex-direction: column;

          gap: 1px;
        }

        .register-text strong {
          font-size: 8px;
          font-weight: 900;
        }

        .register-text small {
          color: #8c9b9e;

          font-size: 6.5px;
        }

        .register-arrow {
          font-size: 14px;
          font-weight: 700;
        }

        .footer {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          margin-top: 11px;

          color: #aebbbd;

          font-size: 6.5px;
          font-weight: 600;
        }

        .footer i {
          width: 3px;
          height: 3px;

          border-radius: 50%;

          background: #ccd5d7;
        }

        @media (max-width: 600px) {

          .page {
            padding: 22px 10px;
          }

          .online {
            display: none;
          }

          .top-header {
            margin-bottom: 20px;
          }

          .welcome h1 {
            font-size: 24px;
          }

          .login-card {
            padding:
              20px 18px 15px;
          }

        }

        @media (max-width: 380px) {

          .page {
            padding: 16px 7px;
          }

          .login-card {
            padding:
              18px 15px 13px;
          }

          .brand-logo {
            width: 37px;
            height: 37px;
          }

          .welcome h1 {
            font-size: 22px;
          }

          .profile {
            height: 53px;
          }

        }

        @media (max-height: 700px) {

          .page {
            align-items: flex-start;

            padding-top: 20px;
            padding-bottom: 20px;
          }

          .top-header {
            margin-bottom: 16px;
          }

          .welcome {
            margin-bottom: 14px;
          }

        }

      `}</style>

    </main>
  );
}