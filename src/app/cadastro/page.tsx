  "use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

/* =========================================================
   INTERFACE DO ESTUDANTE
========================================================= */

interface Estudante {
  nome: string;
  idade: number;
  ensinoMedio: boolean;
  usuario: string;
  senha: string;
  tipo: "aluno";
  dataCadastro: string;
}

/* =========================================================
   PÁGINA DE CADASTRO
========================================================= */

export default function CadastroPage() {
  const router = useRouter();

  /* =======================================================
     ESTADOS
  ======================================================= */

  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [ensinoMedio, setEnsinoMedio] = useState(false);

  const [usuario, setUsuario] = useState("");

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [aceite, setAceite] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  /* =======================================================
     VALIDA NOME COMPLETO
  ======================================================= */

  function validarNomeCompleto(valor: string) {
    const partes = valor
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return partes.length >= 2;
  }

  /* =======================================================
     VALIDA USUÁRIO
  ======================================================= */

  function validarUsuario(valor: string) {
    return /^[a-zA-Z0-9._-]+$/.test(valor);
  }

  /* =======================================================
     LIMPA MENSAGENS
  ======================================================= */

  function limparMensagens() {
    setErro("");
    setSucesso("");
  }

  /* =======================================================
     CADASTRO
  ======================================================= */

  function handleCadastro(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    limparMensagens();

    const nomeLimpo = nome.trim();
    const usuarioLimpo = usuario.trim().toLowerCase();
    const idadeNumero = Number(idade);

    /* =====================================================
       NOME
    ===================================================== */

    if (!nomeLimpo) {
      setErro(
        "Digite o nome completo do aluno ou aluna."
      );
      return;
    }

    if (!validarNomeCompleto(nomeLimpo)) {
      setErro(
        "Digite o nome completo, incluindo pelo menos nome e sobrenome."
      );
      return;
    }

    /* =====================================================
       IDADE
    ===================================================== */

    if (
      !idade ||
      !Number.isInteger(idadeNumero)
    ) {
      setErro("Digite uma idade válida.");
      return;
    }

    if (idadeNumero <= 18) {
      setErro(
        "Para realizar o cadastro, o estudante precisa ter mais de 18 anos."
      );
      return;
    }

    if (idadeNumero > 120) {
      setErro("Digite uma idade válida.");
      return;
    }

    /* =====================================================
       ENSINO MÉDIO
    ===================================================== */

    if (!ensinoMedio) {
      setErro(
        "É necessário possuir o Ensino Médio completo para realizar o cadastro."
      );
      return;
    }

    /* =====================================================
       USUÁRIO
    ===================================================== */

    if (!usuarioLimpo) {
      setErro("Digite um usuário.");
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

    /* =====================================================
       USUÁRIOS RESERVADOS
    ===================================================== */

    const usuariosReservados = [
      "professor",
      "professora",
      "admin",
      "administrador",
    ];

    if (usuariosReservados.includes(usuarioLimpo)) {
      setErro(
        "Esse usuário é reservado pela plataforma. Escolha outro usuário."
      );
      return;
    }

    /* =====================================================
       SENHA
    ===================================================== */

    if (!senha) {
      setErro("Digite uma senha.");
      return;
    }

    if (senha.length < 6) {
      setErro(
        "A senha precisa ter pelo menos 6 caracteres."
      );
      return;
    }

    /* =====================================================
       CONFIRMAÇÃO DA SENHA
    ===================================================== */

    if (!confirmarSenha) {
      setErro("Confirme sua senha.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }

    /* =====================================================
       ACEITE
    ===================================================== */

    if (!aceite) {
      setErro(
        "Você precisa confirmar que as informações fornecidas são verdadeiras."
      );
      return;
    }

    setCarregando(true);

    try {
      /* ===================================================
         RECUPERA CADASTROS EXISTENTES
      =================================================== */

      const dadosSalvos =
        localStorage.getItem("pac_estudantes");

      let estudantes: Estudante[] = [];

      if (dadosSalvos) {
        try {
          const dados = JSON.parse(dadosSalvos);

          if (Array.isArray(dados)) {
            estudantes = dados.filter(
              (item): item is Estudante =>
                item &&
                typeof item === "object" &&
                typeof item.nome === "string" &&
                typeof item.usuario === "string" &&
                typeof item.senha === "string"
            );
          }
        } catch {
          estudantes = [];
        }
      }

      /* ===================================================
         VERIFICA USUÁRIO EXISTENTE
      =================================================== */

      const usuarioExiste = estudantes.some(
        (estudante) =>
          estudante.usuario
            .trim()
            .toLowerCase() === usuarioLimpo
      );

      if (usuarioExiste) {
        setErro(
          "Esse usuário já está cadastrado. Escolha outro."
        );

        setCarregando(false);
        return;
      }

      /* ===================================================
         CRIA NOVO ESTUDANTE
      =================================================== */

      const novoEstudante: Estudante = {
        nome: nomeLimpo,
        idade: idadeNumero,
        ensinoMedio: true,
        usuario: usuarioLimpo,
        senha: senha,
        tipo: "aluno",
        dataCadastro: new Date().toISOString(),
      };

      /* ===================================================
         NOVA LISTA
      =================================================== */

      const novosEstudantes = [
        ...estudantes,
        novoEstudante,
      ];

      /* ===================================================
         SALVA NO LOCALSTORAGE
      =================================================== */

      localStorage.setItem(
        "pac_estudantes",
        JSON.stringify(novosEstudantes)
      );

      /* ===================================================
         MENSAGEM DE SUCESSO
      =================================================== */

      setSucesso(
        `Cadastro realizado com sucesso, ${nomeLimpo}! Sua conta foi criada e já pode ser utilizada para acessar a P.A.C.`
      );

      /* ===================================================
         LIMPA FORMULÁRIO
      =================================================== */

      setNome("");
      setIdade("");
      setEnsinoMedio(false);
      setUsuario("");
      setSenha("");
      setConfirmarSenha("");
      setAceite(false);

      setCarregando(false);

    } catch (error) {
      console.error(
        "[P.A.C.] Erro ao salvar estudante:",
        error
      );

      setErro(
        "Não foi possível realizar o cadastro. Tente novamente."
      );

      setCarregando(false);
    }
  }

  /* =======================================================
     VOLTAR PARA LOGIN
  ======================================================= */

  function voltarLogin() {
    router.push("/login");
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="cadastro-page">

      {/* =================================================
          FUNDO
      ================================================= */}

      <div className="background">
        <div className="circle circle-one" />
        <div className="circle circle-two" />
        <div className="circle circle-three" />
      </div>

      {/* =================================================
          CONTAINER
      ================================================= */}

      <section className="cadastro-container">

        {/* =================================================
            CABEÇALHO
        ================================================= */}

        <header className="header">

          <button
            type="button"
            className="back-button"
            onClick={voltarLogin}
          >
            <span className="back-icon">
              ←
            </span>

            Voltar para o login
          </button>

          <div className="logo">
            <span>P.A.C</span>
          </div>

          <h1>
            Cadastro de Estudante
          </h1>

          <p>
            Crie sua conta acadêmica para acessar a plataforma
          </p>

        </header>

        {/* =================================================
            CARD
        ================================================= */}

        <div className="card">

          {/* =================================================
              TÍTULO
          ================================================= */}

          <div className="card-title">

            <div className="title-icon">
              🎓
            </div>

            <div className="title-content">

              <h2>
                Criar sua conta
              </h2>

              <p>
                Informe seus dados para começar.
              </p>

            </div>

          </div>

          {/* =================================================
              REQUISITOS
          ================================================= */}

          <div className="requirements">

            <div className="requirements-header">

              <span className="requirements-icon">
                ✓
              </span>

              <strong>
                Requisitos para cadastro
              </strong>

            </div>

            <div className="requirement-list">

              <span>
                <b>✓</b>
                Mais de 18 anos
              </span>

              <span>
                <b>✓</b>
                Ensino Médio completo
              </span>

              <span>
                <b>✓</b>
                Nome completo
              </span>

            </div>

          </div>

          {/* =================================================
              FORMULÁRIO
          ================================================= */}

          <form onSubmit={handleCadastro}>

            <div className="form-grid">

              {/* NOME */}

              <div className="form-group full">

                <label htmlFor="nome">
                  Nome completo do aluno ou aluna
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    👤
                  </span>

                  <input
                    id="nome"
                    type="text"
                    placeholder="Digite nome e sobrenome"
                    value={nome}
                    onChange={(event) => {
                      setNome(event.target.value);
                      limparMensagens();
                    }}
                    autoComplete="name"
                    required
                  />

                </div>

                <small>
                  Este nome será apresentado ao professor ou professora.
                </small>

              </div>

              {/* IDADE */}

              <div className="form-group">

                <label htmlFor="idade">
                  Idade
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    🎂
                  </span>

                  <input
                    id="idade"
                    type="number"
                    min="19"
                    max="120"
                    placeholder="Sua idade"
                    value={idade}
                    onChange={(event) => {
                      setIdade(event.target.value);
                      limparMensagens();
                    }}
                    required
                  />

                </div>

              </div>

              {/* USUÁRIO */}

              <div className="form-group">

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
                    placeholder="Crie seu usuário"
                    value={usuario}
                    onChange={(event) => {
                      setUsuario(event.target.value);
                      limparMensagens();
                    }}
                    autoComplete="username"
                    maxLength={30}
                    required
                  />

                </div>

                <small>
                  Letras, números, ponto, hífen e underline.
                </small>

              </div>

              {/* SENHA */}

              <div className="form-group">

                <label htmlFor="senha">
                  Senha
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    🔒
                  </span>

                  <input
                    id="senha"
                    type="password"
                    placeholder="Mínimo de 6 caracteres"
                    value={senha}
                    onChange={(event) => {
                      setSenha(event.target.value);
                      limparMensagens();
                    }}
                    autoComplete="new-password"
                    required
                  />

                </div>

                <small>
                  A senha será mantida como cadastrada.
                </small>

              </div>

              {/* CONFIRMAR SENHA */}

              <div className="form-group">

                <label htmlFor="confirmarSenha">
                  Confirmar senha
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    🔐
                  </span>

                  <input
                    id="confirmarSenha"
                    type="password"
                    placeholder="Digite novamente"
                    value={confirmarSenha}
                    onChange={(event) => {
                      setConfirmarSenha(event.target.value);
                      limparMensagens();
                    }}
                    autoComplete="new-password"
                    required
                  />

                </div>

              </div>

            </div>

            {/* =================================================
                ENSINO MÉDIO
            ================================================= */}

            <div className="education-box">

              <label className="checkbox-label">

                <input
                  type="checkbox"
                  checked={ensinoMedio}
                  onChange={(event) => {
                    setEnsinoMedio(event.target.checked);
                    limparMensagens();
                  }}
                />

                <span className="custom-check">
                  {ensinoMedio ? "✓" : ""}
                </span>

                <span className="checkbox-content">

                  <strong>
                    Ensino Médio completo
                  </strong>

                  <small>
                    Declaro possuir o Ensino Médio completo.
                  </small>

                </span>

              </label>

            </div>

            {/* =================================================
                ERRO
            ================================================= */}

            {erro && (
              <div className="message error">

                <span className="message-icon">
                  ⚠️
                </span>

                <p>
                  {erro}
                </p>

              </div>
            )}

            {/* =================================================
                SUCESSO
            ================================================= */}

            {sucesso && (
              <div className="success-area">

                <div className="message success">

                  <span className="message-icon">
                    ✓
                  </span>

                  <p>
                    {sucesso}
                  </p>

                </div>

                {/* =================================================
                    NOVO BOTÃO PARA VOLTAR AO LOGIN
                ================================================= */}

                <button
                  type="button"
                  className="success-login-button"
                  onClick={voltarLogin}
                >

                  <span className="success-login-icon">
                    ←
                  </span>

                  VOLTAR PARA O LOGIN

                </button>

              </div>
            )}

            {/* =================================================
                ACEITE
            ================================================= */}

            {!sucesso && (
              <div className="terms-box">

                <label className="checkbox-label">

                  <input
                    type="checkbox"
                    checked={aceite}
                    onChange={(event) => {
                      setAceite(event.target.checked);
                      limparMensagens();
                    }}
                  />

                  <span className="custom-check">
                    {aceite ? "✓" : ""}
                  </span>

                  <span className="checkbox-content">

                    <strong>
                      Confirmo minhas informações
                    </strong>

                    <small>
                      Declaro que os dados fornecidos são
                      verdadeiros e estou de acordo com os
                      requisitos da P.A.C.
                    </small>

                  </span>

                </label>

              </div>
            )}

            {/* =================================================
                BOTÃO CRIAR CONTA
            ================================================= */}

            {!sucesso && (
              <button
                type="submit"
                className="register-button"
                disabled={carregando}
              >

                {carregando ? (
                  <>
                    <span className="spinner" />
                    CRIANDO CONTA...
                  </>
                ) : (
                  <>
                    CRIAR CONTA

                    <span className="button-arrow">
                      →
                    </span>
                  </>
                )}

              </button>
            )}

          </form>

          {/* =================================================
              LOGIN
          ================================================= */}

          {!sucesso && (
            <div className="login-link">

              <span>
                Já possui uma conta?
              </span>

              <button
                type="button"
                onClick={voltarLogin}
              >
                Entrar na P.A.C. →
              </button>

            </div>
          )}

        </div>

        {/* =================================================
            RODAPÉ
        ================================================= */}

        <footer>

          <p>
            © {new Date().getFullYear()} P.A.C.
          </p>

          <span>
            Plataforma de Atividade Curricular
          </span>

        </footer>

      </section>

      {/* =================================================
          ESTILOS
      ================================================= */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .cadastro-page {
          min-height: 100vh;
          width: 100%;
          position: relative;

          display: flex;
          justify-content: center;

          overflow-x: hidden;

          padding: 20px 16px 24px;

          background:
            radial-gradient(
              circle at 10% 10%,
              rgba(33, 219, 199, 0.16),
              transparent 32%
            ),
            radial-gradient(
              circle at 90% 90%,
              rgba(11, 183, 199, 0.17),
              transparent 34%
            ),
            linear-gradient(
              135deg,
              #061b22 0%,
              #08353e 48%,
              #087b87 100%
            );

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .background {
          position: fixed;
          inset: 0;

          overflow: hidden;

          pointer-events: none;
        }

        .circle {
          position: absolute;

          border-radius: 50%;

          filter: blur(3px);

          pointer-events: none;
        }

        .circle-one {
          width: 420px;
          height: 420px;

          top: -240px;
          left: -160px;

          background: #20d9c5;

          opacity: 0.13;
        }

        .circle-two {
          width: 500px;
          height: 500px;

          right: -260px;
          bottom: -270px;

          background: #0bb7c7;

          opacity: 0.13;
        }

        .circle-three {
          width: 170px;
          height: 170px;

          right: 15%;
          top: 12%;

          background: white;

          opacity: 0.035;
        }

        .cadastro-container {
          position: relative;

          z-index: 2;

          width: 100%;
          max-width: 500px;

          margin: auto;
        }

        .header {
          text-align: center;

          color: white;

          margin-bottom: 13px;
        }

        .back-button {
          display: inline-flex;

          align-items: center;

          gap: 6px;

          margin-bottom: 10px;

          padding: 6px 11px;

          border:
            1px solid
            rgba(255, 255, 255, 0.12);

          border-radius: 8px;

          background:
            rgba(255, 255, 255, 0.07);

          color:
            rgba(255, 255, 255, 0.8);

          cursor: pointer;

          font-size: 10px;

          transition:
            background 0.2s,
            transform 0.2s;
        }

        .back-button:hover {
          background:
            rgba(255, 255, 255, 0.14);

          transform: translateX(-2px);
        }

        .back-icon {
          font-size: 13px;
        }

        .logo {
          width: 52px;
          height: 52px;

          margin: 0 auto 7px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 15px;

          background:
            linear-gradient(
              145deg,
              #25dec9,
              #079eae
            );

          border:
            1px solid
            rgba(255, 255, 255, 0.2);

          box-shadow:
            0 9px 24px
            rgba(0, 0, 0, 0.2);

          font-size: 15px;

          font-weight: 900;

          letter-spacing: 0.5px;
        }

        .header h1 {
          margin: 0;

          font-size: 19px;

          line-height: 1.2;

          font-weight: 800;
        }

        .header p {
          margin: 4px 0 0;

          color:
            rgba(255, 255, 255, 0.64);

          font-size: 10px;
        }

        .card {
          width: 100%;

          padding: 20px;

          border-radius: 18px;

          background:
            rgba(255, 255, 255, 0.98);

          border:
            1px solid
            rgba(255, 255, 255, 0.75);

          box-shadow:
            0 22px 55px
            rgba(0, 0, 0, 0.28);
        }

        .card-title {
          display: flex;

          align-items: center;

          gap: 10px;

          margin-bottom: 14px;
        }

        .title-icon {
          width: 38px;
          height: 38px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background: #e9faf8;

          font-size: 18px;
        }

        .title-content {
          min-width: 0;
        }

        .card-title h2 {
          margin: 0;

          color: #173a42;

          font-size: 16px;

          font-weight: 800;
        }

        .card-title p {
          margin: 3px 0 0;

          color: #849398;

          font-size: 10px;
        }

        .requirements {
          margin-bottom: 15px;

          padding: 10px 12px;

          border:
            1px solid #d6f0ec;

          border-radius: 10px;

          background: #f1fbfa;
        }

        .requirements-header {
          display: flex;

          align-items: center;

          gap: 7px;

          margin-bottom: 7px;
        }

        .requirements-icon {
          width: 18px;
          height: 18px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #0bb9a7;

          color: white;

          font-size: 10px;

          font-weight: 900;
        }

        .requirements strong {
          color: #236b66;

          font-size: 10px;
        }

        .requirement-list {
          display: flex;

          align-items: center;

          flex-wrap: wrap;

          gap: 5px 13px;
        }

        .requirement-list span {
          display: flex;

          align-items: center;

          gap: 4px;

          color: #567578;

          font-size: 9px;

          font-weight: 600;
        }

        .requirement-list b {
          color: #0aa391;

          font-size: 10px;
        }

        .form-grid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          column-gap: 12px;

          row-gap: 0;
        }

        .form-group {
          min-width: 0;

          margin-bottom: 12px;
        }

        .form-group.full {
          grid-column: 1 / -1;
        }

        .form-group label {
          display: block;

          margin-bottom: 5px;

          color: #29464d;

          font-size: 10px;

          font-weight: 800;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;

          left: 11px;
          top: 50%;

          transform:
            translateY(-50%);

          color: #7c9398;

          font-size: 13px;

          pointer-events: none;

          z-index: 1;
        }

        .form-group input {
          width: 100%;

          height: 41px;

          padding:
            0 10px 0 34px;

          border:
            1.5px solid #dce7e9;

          border-radius: 9px;

          outline: none;

          background: #f8fbfb;

          color: #173b43;

          font-size: 11px;

          transition:
            border-color 0.2s,
            box-shadow 0.2s,
            background 0.2s;
        }

        .form-group input:hover {
          border-color: #c9d9dc;
        }

        .form-group input:focus {
          border-color: #0bb9a7;

          background: white;

          box-shadow:
            0 0 0 3px
            rgba(11, 185, 167, 0.09);
        }

        .form-group input::placeholder {
          color: #a0adb0;
        }

        .form-group small {
          display: block;

          margin-top: 4px;

          color: #8b999d;

          font-size: 8px;

          line-height: 1.3;
        }

        .education-box,
        .terms-box {
          margin-bottom: 12px;

          padding: 9px 11px;

          border:
            1px solid #e0e9eb;

          border-radius: 9px;

          background: #fafcfc;
        }

        .education-box {
          border-color: #d5eee9;

          background: #f5fbfa;
        }

        .checkbox-label {
          display: flex;

          align-items: flex-start;

          gap: 9px;

          cursor: pointer;
        }

        .checkbox-label input {
          position: absolute;

          opacity: 0;

          width: 0;
          height: 0;

          pointer-events: none;
        }

        .custom-check {
          width: 19px;
          height: 19px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          margin-top: 1px;

          border:
            1.5px solid #beced1;

          border-radius: 5px;

          background: white;

          color: white;

          font-size: 11px;

          font-weight: 900;

          transition:
            background 0.2s,
            border-color 0.2s,
            transform 0.15s;
        }

        .checkbox-label input:checked + .custom-check {
          background: #0bb9a7;

          border-color: #0bb9a7;

          transform: scale(1.03);
        }

        .checkbox-content {
          display: flex;

          flex-direction: column;

          gap: 2px;

          min-width: 0;
        }

        .checkbox-content strong {
          color: #3c555a;

          font-size: 9px;

          font-weight: 800;
        }

        .checkbox-content small {
          color: #89999d;

          font-size: 8px;

          line-height: 1.3;
        }

        .message {
          display: flex;

          align-items: flex-start;

          gap: 8px;

          margin-bottom: 11px;

          padding: 9px 10px;

          border-radius: 8px;
        }

        .message-icon {
          flex-shrink: 0;

          font-size: 12px;
        }

        .message p {
          margin: 0;

          font-size: 9px;

          line-height: 1.4;
        }

        .message.error {
          background: #fff3f3;

          border:
            1px solid #ffd0d0;

          color: #a92828;
        }

        .message.success {
          margin-bottom: 10px;

          background: #edfaf5;

          border:
            1px solid #c9eee0;

          color: #23775b;
        }

        /* =================================================
           ÁREA DE SUCESSO
        ================================================= */

        .success-area {
          width: 100%;

          margin-bottom: 12px;

          padding: 10px;

          border:
            1px solid #c9eee0;

          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              #f4fffb,
              #ecfaf5
            );

          animation:
            successAppear 0.3s ease;
        }

        @keyframes successAppear {
          from {
            opacity: 0;

            transform:
              translateY(5px);
          }

          to {
            opacity: 1;

            transform:
              translateY(0);
          }
        }

        .success-area .message {
          margin: 0 0 10px;

          padding: 4px 2px;

          border: none;

          background: transparent;
        }

        .success-login-button {
          width: 100%;

          height: 40px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          border: none;

          border-radius: 8px;

          background:
            linear-gradient(
              135deg,
              #0bb9a7,
              #078c9b
            );

          color: white;

          font-size: 10px;

          font-weight: 800;

          letter-spacing: 0.4px;

          cursor: pointer;

          box-shadow:
            0 6px 16px
            rgba(7, 140, 155, 0.22);

          transition:
            transform 0.2s,
            box-shadow 0.2s,
            background 0.2s;
        }

        .success-login-button:hover {
          transform:
            translateY(-1px);

          box-shadow:
            0 9px 20px
            rgba(7, 140, 155, 0.3);

          background:
            linear-gradient(
              135deg,
              #0dc5b2,
              #079aaa
            );
        }

        .success-login-button:active {
          transform:
            translateY(0);
        }

        .success-login-icon {
          font-size: 15px;

          line-height: 1;
        }

        .register-button {
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
              #0bb9a7,
              #078c9b
            );

          color: white;

          font-size: 11px;

          font-weight: 800;

          letter-spacing: 0.5px;

          cursor: pointer;

          box-shadow:
            0 7px 17px
            rgba(7, 140, 155, 0.22);

          transition:
            transform 0.2s,
            box-shadow 0.2s,
            opacity 0.2s;
        }

        .register-button:hover:not(:disabled) {
          transform:
            translateY(-1px);

          box-shadow:
            0 10px 22px
            rgba(7, 140, 155, 0.3);
        }

        .register-button:active:not(:disabled) {
          transform:
            translateY(0);
        }

        .register-button:disabled {
          opacity: 0.65;

          cursor: not-allowed;
        }

        .button-arrow {
          font-size: 15px;

          line-height: 1;
        }

        .spinner {
          width: 13px;
          height: 13px;

          border:
            2px solid
            rgba(255, 255, 255, 0.35);

          border-top-color: white;

          border-radius: 50%;

          animation:
            spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .login-link {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 4px;

          margin-top: 12px;

          font-size: 9px;

          color: #89979b;
        }

        .login-link button {
          padding: 0;

          border: none;

          background: none;

          color: #078f87;

          font-size: 9px;

          font-weight: 800;

          cursor: pointer;
        }

        .login-link button:hover {
          text-decoration: underline;
        }

        footer {
          margin-top: 10px;

          text-align: center;

          color:
            rgba(255, 255, 255, 0.52);

          font-size: 8px;

          line-height: 1.4;
        }

        footer p {
          margin: 0 0 2px;
        }

        footer span {
          opacity: 0.75;
        }

        /* =================================================
           CELULAR
        ================================================= */

        @media (max-width: 600px) {

          .cadastro-page {
            min-height: 100svh;

            padding:
              15px 11px 20px;
          }

          .cadastro-container {
            max-width: 430px;
          }

          .header {
            margin-bottom: 10px;
          }

          .back-button {
            margin-bottom: 8px;
          }

          .logo {
            width: 47px;
            height: 47px;

            margin-bottom: 6px;

            border-radius: 13px;

            font-size: 14px;
          }

          .header h1 {
            font-size: 17px;
          }

          .header p {
            font-size: 9px;
          }

          .card {
            padding: 17px 15px;

            border-radius: 16px;
          }

          .card-title {
            margin-bottom: 12px;
          }

          .title-icon {
            width: 35px;
            height: 35px;

            border-radius: 9px;

            font-size: 16px;
          }

          .card-title h2 {
            font-size: 15px;
          }

          .requirements {
            margin-bottom: 13px;
          }

          .requirement-list {
            gap: 5px 10px;
          }

          .form-grid {
            grid-template-columns:
              1fr 1fr;

            column-gap: 9px;
          }

          .form-group input {
            height: 40px;
          }

          .success-login-button {
            height: 42px;

            font-size: 10px;
          }

          .circle-one {
            width: 300px;
            height: 300px;
          }

          .circle-two {
            width: 360px;
            height: 360px;
          }
        }

        /* =================================================
           CELULARES PEQUENOS
        ================================================= */

        @media (max-width: 430px) {

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full {
            grid-column: auto;
          }

          .form-group {
            margin-bottom: 10px;
          }

          .requirements {
            padding: 9px;
          }

          .requirement-list {
            flex-direction: column;

            align-items: flex-start;

            gap: 4px;
          }

          .success-area {
            padding: 9px;
          }
        }

        /* =================================================
           ALTURA PEQUENA
        ================================================= */

        @media (max-height: 720px) and (min-width: 601px) {

          .cadastro-page {
            padding-top: 10px;

            padding-bottom: 12px;
          }

          .header {
            margin-bottom: 8px;
          }

          .back-button {
            margin-bottom: 6px;
          }

          .logo {
            width: 43px;
            height: 43px;

            margin-bottom: 5px;

            border-radius: 12px;

            font-size: 12px;
          }

          .header h1 {
            font-size: 16px;
          }

          .header p {
            margin-top: 2px;

            font-size: 8px;
          }

          .card {
            padding: 16px;
          }

          .card-title {
            margin-bottom: 10px;
          }

          .requirements {
            margin-bottom: 10px;

            padding: 8px 10px;
          }

          .form-group {
            margin-bottom: 9px;
          }

          .form-group input {
            height: 37px;
          }

          .education-box,
          .terms-box {
            margin-bottom: 9px;

            padding: 7px 9px;
          }

          .register-button {
            height: 39px;
          }

          .success-login-button {
            height: 38px;
          }

          .login-link {
            margin-top: 9px;
          }

          footer {
            margin-top: 7px;
          }
        }

      `}</style>

    </main>
  );
}