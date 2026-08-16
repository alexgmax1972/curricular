// ============================================================
// P.A.C.
// Plataforma de Atividade Curricular
//
// atividades.ts
//
// SISTEMA DE ATIVIDADES E ARQUIVOS
//
// PROFESSOR
//    ↓
//    │ envia atividade
//    ↓
// ALUNO
//
// ALUNO
//    ↓
//    │ envia trabalho/arquivos
//    ↓
// PROFESSOR
//
// ============================================================


// ============================================================
// TIPOS BÁSICOS
// ============================================================

export type TipoUsuarioAtividade =
  | "aluno"
  | "professor";


// ============================================================
// STATUS DA ATIVIDADE
// ============================================================
//
// ENVIADA
//    ↓
// DISPONÍVEL PARA O ALUNO
//
// EM_ANDAMENTO
//    ↓
// ALUNO JÁ COMEÇOU
//
// ENTREGUE
//    ↓
// ALUNO ENVIOU
//
// ATRASADA
//    ↓
// ENTREGA DEPOIS DO PRAZO
//
// ENCERRADA
//    ↓
// PROFESSOR ENCERROU
//
// ============================================================

export type StatusAtividade =
  | "ENVIADA"
  | "EM_ANDAMENTO"
  | "ENTREGUE"
  | "ATRASADA"
  | "ENCERRADA";


// ============================================================
// STATUS DO ARQUIVO
// ============================================================

export type StatusArquivo =
  | "DISPONIVEL"
  | "ENVIADO"
  | "REMOVIDO"
  | "ERRO";


// ============================================================
// TIPO: ARQUIVO
// ============================================================
//
// Representa um arquivo anexado à atividade.
//
// O sistema guarda os dados do arquivo.
//
// O conteúdo físico do arquivo poderá ficar em:
// - servidor
// - storage
// - banco
// - serviço externo
//
// ============================================================

export interface ArquivoAtividade {

  // Identificação do arquivo
  id: string;

  // Nome original do arquivo
  nome: string;

  // Nome armazenado pelo sistema
  nomeArmazenado: string;

  // Tipo MIME
  tipo: string;

  // Tamanho em bytes
  tamanho: number;

  // Extensão
  extensao: string;

  // Localização do arquivo
  //
  // Pode ser:
  // /uploads/arquivo.pdf
  // URL externa
  // caminho do storage
  //
  url?: string;

  // Caminho interno
  caminho?: string;

  // Usuário que enviou
  usuarioId: string;

  // Tipo do usuário
  usuarioTipo: TipoUsuarioAtividade;

  // Data do envio
  dataEnvio: string;

  // Status
  status: StatusArquivo;
}


// ============================================================
// TIPO: DESTINATÁRIO
// ============================================================
//
// Define para quem o professor está enviando.
//
// Pode ser:
// - uma turma
// - um aluno
// - vários alunos
//
// ============================================================

export interface DestinatarioAtividade {

  // ID do aluno
  alunoId: string;

  // Nome do aluno
  nomeAluno: string;

  // Usuário do aluno
  usuarioAluno: string;
}


// ============================================================
// TIPO: ATIVIDADE
// ============================================================
//
// A atividade é criada pelo professor.
//
// Exemplo:
//
// Professor:
// João da Silva
//
// Disciplina:
// Programação I
//
// Título:
// Trabalho de Algoritmos
//
// Prazo:
// 25/08/2026
//
// Arquivo:
// atividade.pdf
//
// ============================================================

export interface Atividade {

  // ==========================================================
  // IDENTIFICAÇÃO
  // ==========================================================

  id: string;

  // Título da atividade
  titulo: string;

  // Descrição
  descricao: string;

  // ==========================================================
  // PROFESSOR
  // ==========================================================

  professorId: string;

  professorNome: string;

  professorUsuario: string;

  // ==========================================================
  // DISCIPLINA
  // ==========================================================

  disciplina: string;

  disciplinaId?: string;

  // ==========================================================
  // SEMESTRE
  // ==========================================================

  semestre: number;

  // ==========================================================
  // PRAZO
  // ==========================================================

  dataCriacao: string;

  dataInicio?: string;

  prazoEntrega: string;

  // ==========================================================
  // ARQUIVOS ENVIADOS PELO PROFESSOR
  // ==========================================================

  arquivos: ArquivoAtividade[];

  // ==========================================================
  // DESTINATÁRIOS
  // ==========================================================

  destinatarios: DestinatarioAtividade[];

  // ==========================================================
  // STATUS
  // ==========================================================

  status: StatusAtividade;

  // ==========================================================
  // CONFIGURAÇÕES
  // ==========================================================

  permiteReenvio: boolean;

  permiteMultiplosArquivos: boolean;

  tamanhoMaximoArquivo?: number;

  extensoesPermitidas?: string[];
}


// ============================================================
// TIPO: ENVIO DO ALUNO
// ============================================================
//
// Representa o trabalho que o aluno enviou ao professor.
//
// ============================================================

export interface EnvioAluno {

  // ==========================================================
  // IDENTIFICAÇÃO
  // ==========================================================

  id: string;

  // ==========================================================
  // ATIVIDADE
  // ==========================================================

  atividadeId: string;

  atividadeTitulo: string;

  // ==========================================================
  // ALUNO
  // ==========================================================

  alunoId: string;

  alunoNome: string;

  alunoUsuario: string;

  // ==========================================================
  // PROFESSOR
  // ==========================================================

  professorId: string;

  professorNome: string;

  professorUsuario: string;

  // ==========================================================
  // DISCIPLINA
  // ==========================================================

  disciplina: string;

  // ==========================================================
  // ENVIO
  // ==========================================================

  dataEnvio: string;

  observacao: string;

  // ==========================================================
  // ARQUIVOS
  // ==========================================================

  arquivos: ArquivoAtividade[];

  // ==========================================================
  // STATUS
  // ==========================================================

  status: StatusEnvioAluno;

  // ==========================================================
  // AVALIAÇÃO
  // ==========================================================

  professorVisualizou: boolean;

  dataVisualizacao?: string;

  comentarioProfessor?: string;

  nota?: number;

  competencia?: "A" | "B" | "C" | "D";
}


// ============================================================
// STATUS DO ENVIO DO ALUNO
// ============================================================

export type StatusEnvioAluno =
  | "RASCUNHO"
  | "ENVIADO"
  | "VISUALIZADO"
  | "AVALIADO"
  | "ATRASADO"
  | "DEVOLVIDO";


// ============================================================
// TIPO: ENTREGA COMPLETA
// ============================================================
//
// Junta atividade + envio do aluno.
//
// Muito útil para a tela do aluno.
//
// ============================================================

export interface AtividadeAluno {

  atividade: Atividade;

  envio?: EnvioAluno;

  // Indica se o aluno já entregou
  entregue: boolean;

  // Indica se está atrasado
  atrasada: boolean;

  // Indica se ainda pode enviar
  podeEnviar: boolean;
}


// ============================================================
// TIPO: CAIXA DE ENTRADA DO ALUNO
// ============================================================
//
// Representa o que o aluno recebe.
//
// ============================================================

export interface CaixaEntradaAluno {

  atividades: AtividadeAluno[];

  total: number;

  pendentes: number;

  entregues: number;

  atrasadas: number;
}


// ============================================================
// TIPO: CAIXA DE ENTRADA DO PROFESSOR
// ============================================================
//
// Representa os trabalhos recebidos dos alunos.
//
// ============================================================

export interface CaixaEntradaProfessor {

  envios: EnvioAluno[];

  total: number;

  novos: number;

  visualizados: number;

  avaliados: number;
}


// ============================================================
// FUNÇÃO: CRIAR ARQUIVO
// ============================================================

export function criarArquivoAtividade(
  dados: Partial<ArquivoAtividade> &
    Pick<
      ArquivoAtividade,
      | "id"
      | "nome"
      | "tipo"
      | "tamanho"
      | "usuarioId"
      | "usuarioTipo"
    >
): ArquivoAtividade {

  const extensao =
    dados.extensao ??
    obterExtensaoArquivo(
      dados.nome
    );

  return {

    id:
      dados.id,

    nome:
      dados.nome,

    nomeArmazenado:
      dados.nomeArmazenado ??
      dados.nome,

    tipo:
      dados.tipo,

    tamanho:
      dados.tamanho,

    extensao,

    url:
      dados.url,

    caminho:
      dados.caminho,

    usuarioId:
      dados.usuarioId,

    usuarioTipo:
      dados.usuarioTipo,

    dataEnvio:
      dados.dataEnvio ??
      new Date().toISOString(),

    status:
      dados.status ??
      "DISPONIVEL"
  };
}


// ============================================================
// FUNÇÃO: OBTER EXTENSÃO
// ============================================================

export function obterExtensaoArquivo(
  nome: string
): string {

  const partes =
    nome.split(".");

  if (
    partes.length <= 1
  ) {
    return "";
  }

  return (
    partes[
      partes.length - 1
    ] ?? ""
  ).toLowerCase();
}


// ============================================================
// FUNÇÃO: VERIFICAR EXTENSÃO
// ============================================================

export function extensaoPermitida(
  nome: string,
  extensoesPermitidas: string[]
): boolean {

  const extensao =
    obterExtensaoArquivo(
      nome
    );

  return extensoesPermitidas.some(
    item =>
      item
        .replace(".", "")
        .toLowerCase() ===
      extensao
  );
}


// ============================================================
// FUNÇÃO: CRIAR ATIVIDADE
// ============================================================

export function criarAtividade(
  dados: Partial<Atividade> &
    Pick<
      Atividade,
      | "id"
      | "titulo"
      | "descricao"
      | "professorId"
      | "professorNome"
      | "professorUsuario"
      | "disciplina"
      | "semestre"
      | "prazoEntrega"
    >
): Atividade {

  return {

    id:
      dados.id,

    titulo:
      dados.titulo,

    descricao:
      dados.descricao,

    professorId:
      dados.professorId,

    professorNome:
      dados.professorNome,

    professorUsuario:
      dados.professorUsuario,

    disciplina:
      dados.disciplina,

    disciplinaId:
      dados.disciplinaId,

    semestre:
      dados.semestre,

    dataCriacao:
      dados.dataCriacao ??
      new Date().toISOString(),

    dataInicio:
      dados.dataInicio,

    prazoEntrega:
      dados.prazoEntrega,

    arquivos:
      dados.arquivos ??
      [],

    destinatarios:
      dados.destinatarios ??
      [],

    status:
      dados.status ??
      "ENVIADA",

    permiteReenvio:
      dados.permiteReenvio ??
      true,

    permiteMultiplosArquivos:
      dados.permiteMultiplosArquivos ??
      true,

    tamanhoMaximoArquivo:
      dados.tamanhoMaximoArquivo,

    extensoesPermitidas:
      dados.extensoesPermitidas ??
      [
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
        "txt",
        "zip",
        "rar",
        "jpg",
        "jpeg",
        "png"
      ]
  };
}


// ============================================================
// FUNÇÃO: CRIAR ENVIO DO ALUNO
// ============================================================

export function criarEnvioAluno(
  dados: Partial<EnvioAluno> &
    Pick<
      EnvioAluno,
      | "id"
      | "atividadeId"
      | "atividadeTitulo"
      | "alunoId"
      | "alunoNome"
      | "alunoUsuario"
      | "professorId"
      | "professorNome"
      | "professorUsuario"
      | "disciplina"
    >
): EnvioAluno {

  return {

    id:
      dados.id,

    atividadeId:
      dados.atividadeId,

    atividadeTitulo:
      dados.atividadeTitulo,

    alunoId:
      dados.alunoId,

    alunoNome:
      dados.alunoNome,

    alunoUsuario:
      dados.alunoUsuario,

    professorId:
      dados.professorId,

    professorNome:
      dados.professorNome,

    professorUsuario:
      dados.professorUsuario,

    disciplina:
      dados.disciplina,

    dataEnvio:
      dados.dataEnvio ??
      new Date().toISOString(),

    observacao:
      dados.observacao ??
      "",

    arquivos:
      dados.arquivos ??
      [],

    status:
      dados.status ??
      "ENVIADO",

    professorVisualizou:
      dados.professorVisualizou ??
      false,

    dataVisualizacao:
      dados.dataVisualizacao,

    comentarioProfessor:
      dados.comentarioProfessor,

    nota:
      dados.nota,

    competencia:
      dados.competencia
  };
}


// ============================================================
// FUNÇÃO: VERIFICAR PRAZO
// ============================================================

export function prazoExpirado(
  atividade: Atividade
): boolean {

  const agora =
    new Date().getTime();

  const prazo =
    new Date(
      atividade.prazoEntrega
    ).getTime();

  return agora > prazo;
}


// ============================================================
// FUNÇÃO: PODE ENVIAR
// ============================================================

export function podeEnviarAtividade(
  atividade: Atividade,
  envio?: EnvioAluno
): boolean {

  // ----------------------------------------------------------
  // ATIVIDADE ENCERRADA
  // ----------------------------------------------------------

  if (
    atividade.status ===
    "ENCERRADA"
  ) {
    return false;
  }


  // ----------------------------------------------------------
  // JÁ ENTREGOU
  // ----------------------------------------------------------

  if (
    envio &&
    !atividade.permiteReenvio
  ) {
    return false;
  }


  // ----------------------------------------------------------
  // PRAZO
  // ----------------------------------------------------------

  if (
    prazoExpirado(
      atividade
    )
  ) {
    return false;
  }


  return true;
}


// ============================================================
// FUNÇÃO: CRIAR ATIVIDADE ALUNO
// ============================================================

export function criarAtividadeAluno(
  atividade: Atividade,
  envio?: EnvioAluno
): AtividadeAluno {

  const atrasada =
    prazoExpirado(
      atividade
    ) &&
    !envio;

  return {

    atividade,

    envio,

    entregue:
      !!envio,

    atrasada,

    podeEnviar:
      podeEnviarAtividade(
        atividade,
        envio
      )
  };
}


// ============================================================
// FUNÇÃO: MARCAR ENVIO COMO VISUALIZADO
// ============================================================

export function marcarEnvioVisualizado(
  envio: EnvioAluno
): EnvioAluno {

  return {

    ...envio,

    professorVisualizou:
      true,

    dataVisualizacao:
      new Date().toISOString(),

    status:
      envio.status ===
      "AVALIADO"
        ? "AVALIADO"
        : "VISUALIZADO"
  };
}


// ============================================================
// FUNÇÃO: AVALIAR ENVIO
// ============================================================

export function avaliarEnvioAluno(
  envio: EnvioAluno,
  competencia: "A" | "B" | "C" | "D",
  comentarioProfessor = "",
  nota?: number
): EnvioAluno {

  return {

    ...envio,

    status:
      "AVALIADO",

    professorVisualizou:
      true,

    dataVisualizacao:
      envio.dataVisualizacao ??
      new Date().toISOString(),

    competencia,

    comentarioProfessor,

    nota
  };
}


// ============================================================
// FUNÇÃO: CONTAR ARQUIVOS
// ============================================================

export function contarArquivos(
  envio: EnvioAluno
): number {

  return envio.arquivos.length;
}


// ============================================================
// FUNÇÃO: TAMANHO TOTAL
// ============================================================

export function tamanhoTotalArquivos(
  arquivos: ArquivoAtividade[]
): number {

  return arquivos.reduce(
    (total, arquivo) =>
      total + arquivo.tamanho,
    0
  );
}


// ============================================================
// FUNÇÃO: FORMATAR TAMANHO
// ============================================================

export function formatarTamanhoArquivo(
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

  if (
    bytes <
    1024 * 1024 * 1024
  ) {
    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    bytes /
    (1024 * 1024 * 1024)
  ).toFixed(1)} GB`;
}


// ============================================================
// FUNÇÃO: CRIAR CAIXA DE ENTRADA DO ALUNO
// ============================================================

export function criarCaixaEntradaAluno(
  atividades: Atividade[],
  envios: EnvioAluno[],
  alunoId: string
): CaixaEntradaAluno {

  const atividadesAluno =
    atividades
      .filter(
        atividade =>
          atividade.destinatarios.some(
            aluno =>
              aluno.alunoId ===
              alunoId
          )
      )
      .map(
        atividade => {

          const envio =
            envios.find(
              item =>
                item.atividadeId ===
                  atividade.id &&
                item.alunoId ===
                  alunoId
            );

          return criarAtividadeAluno(
            atividade,
            envio
          );
        }
      );

  return {

    atividades:
      atividadesAluno,

    total:
      atividadesAluno.length,

    pendentes:
      atividadesAluno.filter(
        item =>
          !item.entregue &&
          !item.atrasada
      ).length,

    entregues:
      atividadesAluno.filter(
        item =>
          item.entregue
      ).length,

    atrasadas:
      atividadesAluno.filter(
        item =>
          item.atrasada
      ).length
  };
}


// ============================================================
// FUNÇÃO: CRIAR CAIXA DE ENTRADA DO PROFESSOR
// ============================================================

export function criarCaixaEntradaProfessor(
  envios: EnvioAluno[],
  professorId: string
): CaixaEntradaProfessor {

  const enviosProfessor =
    envios.filter(
      envio =>
        envio.professorId ===
        professorId
    );

  return {

    envios:
      enviosProfessor,

    total:
      enviosProfessor.length,

    novos:
      enviosProfessor.filter(
        envio =>
          !envio.professorVisualizou
      ).length,

    visualizados:
      enviosProfessor.filter(
        envio =>
          envio.professorVisualizou
      ).length,

    avaliados:
      enviosProfessor.filter(
        envio =>
          envio.status ===
          "AVALIADO"
      ).length
  };
}


// ============================================================
// FIM DO ARQUIVO
// ============================================================