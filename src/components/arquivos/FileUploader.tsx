"use client";

// ============================================================
// P.A.C.
// Plataforma de Atividade Curricular
//
// src/components/arquivos/FileUploader.tsx
//
// COMPONENTE DE ENVIO DE ARQUIVOS
// ============================================================

import {
  ChangeEvent,
  useRef,
  useState,
} from "react";


// ============================================================
// PROPRIEDADES DO COMPONENTE
// ============================================================

interface FileUploaderProps {

  // Permite selecionar vários arquivos
  multiple?: boolean;

  // Quantidade máxima de arquivos
  maxFiles?: number;

  // Tamanho máximo de cada arquivo em MB
  maxSizeMB?: number;

  // Retorna os arquivos selecionados
  onFilesChange?: (
    files: File[]
  ) => void;

  // Texto do botão
  buttonText?: string;

  // Desabilita o componente
  disabled?: boolean;
}


// ============================================================
// EXTENSÕES PERMITIDAS
// ============================================================

const EXTENSOES_PERMITIDAS = [

  ".pdf",

  ".doc",
  ".docx",

  ".xls",
  ".xlsx",

  ".ppt",
  ".pptx",

  ".txt",

  ".zip",
  ".rar",

  ".jpg",
  ".jpeg",
  ".png",

];


// ============================================================
// COMPONENTE
// ============================================================

export default function FileUploader({

  multiple = true,

  maxFiles = 10,

  maxSizeMB = 20,

  onFilesChange,

  buttonText = "+ ADICIONAR ARQUIVO",

  disabled = false,

}: FileUploaderProps) {


  // ==========================================================
  // REFERÊNCIA DO INPUT
  // ==========================================================

  const inputRef =
    useRef<HTMLInputElement | null>(
      null
    );


  // ==========================================================
  // ARQUIVOS SELECIONADOS
  // ==========================================================

  const [
    files,
    setFiles
  ] = useState<File[]>([]);


  // ==========================================================
  // MENSAGEM DE ERRO
  // ==========================================================

  const [
    error,
    setError
  ] = useState("");


  // ==========================================================
  // ABRIR SELETOR DE ARQUIVOS
  // ==========================================================

  function abrirSeletor() {

    if (disabled) {
      return;
    }

    inputRef.current?.click();
  }


  // ==========================================================
  // SELECIONAR ARQUIVOS
  // ==========================================================

  function selecionarArquivos(
    event: ChangeEvent<HTMLInputElement>
  ) {

    setError("");

    const selecionados =
      Array.from(
        event.target.files ?? []
      );


    if (
      selecionados.length === 0
    ) {
      return;
    }


    // ========================================================
    // LIMITE DE ARQUIVOS
    // ========================================================

    if (
      multiple &&
      selecionados.length > maxFiles
    ) {

      setError(
        `Você pode selecionar no máximo ${maxFiles} arquivos.`
      );

      return;
    }


    // ========================================================
    // APENAS UM ARQUIVO
    // ========================================================

    if (
      !multiple &&
      selecionados.length > 1
    ) {

      setError(
        "Selecione apenas um arquivo."
      );

      return;
    }


    // ========================================================
    // VALIDAR ARQUIVOS
    // ========================================================

    for (
      const file of selecionados
    ) {

      const nome =
        file.name.toLowerCase();


      // ------------------------------------------------------
      // EXTENSÃO
      // ------------------------------------------------------

      const permitido =
        EXTENSOES_PERMITIDAS.some(
          extensao =>
            nome.endsWith(extensao)
        );


      if (!permitido) {

        setError(
          `Arquivo não permitido: ${file.name}`
        );

        return;
      }


      // ------------------------------------------------------
      // TAMANHO
      // ------------------------------------------------------

      const tamanhoMB =
        file.size /
        (1024 * 1024);


      if (
        tamanhoMB > maxSizeMB
      ) {

        setError(
          `${file.name} ultrapassa o limite de ${maxSizeMB} MB.`
        );

        return;
      }

    }


    // ========================================================
    // NOVA LISTA
    // ========================================================

    const novosArquivos =
      multiple
        ? [
            ...files,
            ...selecionados
          ].slice(
            0,
            maxFiles
          )
        : selecionados;


    // ========================================================
    // ATUALIZAR ESTADO
    // ========================================================

    setFiles(
      novosArquivos
    );


    // ========================================================
    // INFORMAR COMPONENTE PAI
    // ========================================================

    onFilesChange?.(
      novosArquivos
    );


    // ========================================================
    // LIMPAR INPUT
    // ========================================================
    //
    // Permite selecionar novamente o mesmo arquivo.
    //

    event.target.value = "";
  }


  // ==========================================================
  // REMOVER ARQUIVO
  // ==========================================================

  function removerArquivo(
    indice: number
  ) {

    const novosArquivos =
      files.filter(
        (_, index) =>
          index !== indice
      );


    setFiles(
      novosArquivos
    );


    onFilesChange?.(
      novosArquivos
    );
  }


  // ==========================================================
  // FORMATAR TAMANHO
  // ==========================================================

  function formatarTamanho(
    bytes: number
  ): string {

    if (
      bytes < 1024
    ) {

      return `${bytes} B`;
    }


    if (
      bytes < 1024 * 1024
    ) {

      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }


    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }


  // ==========================================================
  // ÍCONE DO ARQUIVO
  // ==========================================================

  function iconeArquivo(
    nome: string
  ): string {

    const arquivo =
      nome.toLowerCase();


    if (
      arquivo.endsWith(".pdf")
    ) {

      return "📕";
    }


    if (
      arquivo.endsWith(".doc") ||
      arquivo.endsWith(".docx")
    ) {

      return "📘";
    }


    if (
      arquivo.endsWith(".xls") ||
      arquivo.endsWith(".xlsx")
    ) {

      return "📗";
    }


    if (
      arquivo.endsWith(".ppt") ||
      arquivo.endsWith(".pptx")
    ) {

      return "📙";
    }


    if (
      arquivo.endsWith(".jpg") ||
      arquivo.endsWith(".jpeg") ||
      arquivo.endsWith(".png")
    ) {

      return "🖼️";
    }


    if (
      arquivo.endsWith(".zip") ||
      arquivo.endsWith(".rar")
    ) {

      return "📦";
    }


    if (
      arquivo.endsWith(".txt")
    ) {

      return "📄";
    }


    return "📎";
  }


  // ==========================================================
  // RENDERIZAÇÃO
  // ==========================================================

  return (

    <div className="w-full">

      {/* ================================================== */}
      {/* INPUT REAL */}
      {/* ================================================== */}

      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={EXTENSOES_PERMITIDAS.join(",")}
        onChange={selecionarArquivos}
        disabled={disabled}
        className="hidden"
      />


      {/* ================================================== */}
      {/* ÁREA DE SELEÇÃO */}
      {/* ================================================== */}

      <button
        type="button"
        onClick={abrirSeletor}
        disabled={disabled}
        className="
          group
          w-full
          rounded-2xl
          border-2
          border-dashed
          border-slate-300
          bg-slate-50
          px-5
          py-7
          text-center
          transition-all
          duration-200
          hover:border-cyan-500
          hover:bg-cyan-50
          hover:shadow-sm
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >

        {/* ÍCONE */}

        <div
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-cyan-100
            text-2xl
            transition
            group-hover:scale-105
          "
        >
          📎
        </div>


        {/* TEXTO PRINCIPAL */}

        <div
          className="
            mt-3
            text-sm
            font-bold
            text-slate-700
          "
        >
          {buttonText}
        </div>


        {/* FORMATOS */}

        <div
          className="
            mx-auto
            mt-2
            max-w-lg
            text-xs
            leading-5
            text-slate-500
          "
        >
          PDF, DOC, DOCX, XLS, XLSX,
          PPT, PPTX, TXT, ZIP, RAR,
          JPG e PNG
        </div>


        {/* LIMITE */}

        <div
          className="
            mt-1
            text-xs
            text-slate-400
          "
        >
          Máximo de {maxSizeMB} MB
          por arquivo
        </div>

      </button>


      {/* ================================================== */}
      {/* ERRO */}
      {/* ================================================== */}

      {error && (

        <div
          role="alert"
          className="
            mt-3
            flex
            items-start
            gap-2
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            font-medium
            text-red-700
          "
        >

          <span>
            ⚠️
          </span>

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ================================================== */}
      {/* ARQUIVOS SELECIONADOS */}
      {/* ================================================== */}

      {files.length > 0 && (

        <div
          className="
            mt-5
            rounded-2xl
            border
            border-slate-200
            bg-slate-50
            p-4
          "
        >

          {/* CABEÇALHO */}

          <div
            className="
              mb-3
              flex
              items-center
              justify-between
            "
          >

            <div
              className="
                text-sm
                font-bold
                text-slate-700
              "
            >
              📎 Arquivos selecionados
            </div>

            <div
              className="
                rounded-full
                bg-cyan-100
                px-2.5
                py-1
                text-xs
                font-bold
                text-cyan-700
              "
            >
              {files.length}
              {multiple
                ? `/${maxFiles}`
                : ""}
            </div>

          </div>


          {/* LISTA */}

          <div className="space-y-2">

            {files.map(
              (file, index) => (

                <div
                  key={`${file.name}-${index}`}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    p-3
                    shadow-sm
                  "
                >

                  {/* ÍCONE */}

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-slate-100
                      text-xl
                    "
                  >
                    {iconeArquivo(
                      file.name
                    )}
                  </div>


                  {/* INFORMAÇÕES */}

                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >

                    <div
                      className="
                        truncate
                        text-sm
                        font-semibold
                        text-slate-700
                      "
                      title={file.name}
                    >
                      {file.name}
                    </div>


                    <div
                      className="
                        mt-0.5
                        text-xs
                        text-slate-400
                      "
                    >
                      {formatarTamanho(
                        file.size
                      )}
                    </div>

                  </div>


                  {/* REMOVER */}

                  <button
                    type="button"
                    onClick={() =>
                      removerArquivo(index)
                    }
                    disabled={disabled}
                    aria-label={`Remover ${file.name}`}
                    title="Remover arquivo"
                    className="
                      shrink-0
                      rounded-lg
                      px-3
                      py-2
                      text-sm
                      font-bold
                      text-red-500
                      transition
                      hover:bg-red-50
                      hover:text-red-600
                      disabled:opacity-50
                    "
                  >
                    ✕
                  </button>

                </div>

              )
            )}

          </div>

        </div>

      )}

    </div>
  );
}