// ============================================================
// P.A.C.
// Plataforma de Atividade Curricular
//
// curriculo.ts
//
// CURRÍCULO DA LICENCIATURA EM COMPUTAÇÃO
//
// IFSul - Campus Pelotas
// Matriz Curricular nº 4342
//
// 8 SEMESTRES
// ============================================================

import type {
  Disciplina,
  Semestre,
} from "../types/academico";


// ============================================================
// INFORMAÇÕES DO CURSO
// ============================================================

export const informacoesCurso = {
  nome: "Licenciatura em Computação",
  instituicao: "Instituto Federal Sul-rio-grandense",
  siglaInstituicao: "IFSul",
  campus: "Pelotas",
  matriz: "4342",
  totalSemestres: 8,
  cargaHorariaDisciplinas: 2605,
  trabalhoConclusaoCurso: 145,
  atividadesComplementares: 200,
  cargaHorariaTotal: 2950,
};


// ============================================================
// TOTAL DE SEMESTRES
// ============================================================

export const TOTAL_SEMESTRES =
  informacoesCurso.totalSemestres;


// ============================================================
// FUNÇÃO AUXILIAR
// CRIAR DISCIPLINA
// ============================================================

function criarDisciplina(
  id: string,
  codigo: string,
  nome: string,
  semestre: number,
  cargaHoraria: number,
  competencia: string,
): Disciplina {

  return {
    id,
    codigo,
    nome,
    semestre,
    cargaHoraria,

    // ----------------------------------------------------------
    // DADOS ACADÊMICOS INICIAIS
    // ----------------------------------------------------------

    nota: null,

    frequencia: 0,

    atividadesConcluidas: 0,

    atividadesTotal: 0,

    // ----------------------------------------------------------
    // STATUS
    // ----------------------------------------------------------

    status: "PENDENTE",

    finalizada: false,

    aprovada: false,

    reprovada: false,

    // ----------------------------------------------------------
    // COMPETÊNCIA
    //
    // A = aprovado
    // B = aprovado
    // C = aprovado
    // D = reprovado
    // ----------------------------------------------------------

    competencia,
  };
}


// ============================================================
// SEMESTRE 1
// ============================================================

const SEMESTRE_1: Disciplina[] = [

  criarDisciplina(
    "LC0101",
    "LC0101",
    "Introdução à Computação",
    1,
    60,
    "Introdução aos fundamentos da Computação.",
  ),

  criarDisciplina(
    "LC0102",
    "LC0102",
    "Algoritmos e Programação",
    1,
    90,
    "Desenvolvimento do raciocínio lógico e programação.",
  ),

  criarDisciplina(
    "LC0103",
    "LC0103",
    "Matemática Discreta",
    1,
    60,
    "Fundamentos matemáticos aplicados à Computação.",
  ),

  criarDisciplina(
    "LC0104",
    "LC0104",
    "Fundamentos da Educação",
    1,
    60,
    "Fundamentos históricos, sociais e pedagógicos da Educação.",
  ),

];


// ============================================================
// SEMESTRE 2
// ============================================================

const SEMESTRE_2: Disciplina[] = [

  criarDisciplina(
    "LC0201",
    "LC0201",
    "Estruturas de Dados",
    2,
    90,
    "Organização e manipulação de estruturas de dados.",
  ),

  criarDisciplina(
    "LC0202",
    "LC0202",
    "Programação Orientada a Objetos",
    2,
    90,
    "Desenvolvimento de sistemas utilizando orientação a objetos.",
  ),

  criarDisciplina(
    "LC0203",
    "LC0203",
    "Arquitetura de Computadores",
    2,
    60,
    "Organização e funcionamento dos computadores.",
  ),

  criarDisciplina(
    "LC0204",
    "LC0204",
    "Psicologia da Educação",
    2,
    60,
    "Aspectos psicológicos relacionados ao processo educacional.",
  ),

];


// ============================================================
// SEMESTRE 3
// ============================================================

const SEMESTRE_3: Disciplina[] = [

  criarDisciplina(
    "LC0301",
    "LC0301",
    "Banco de Dados",
    3,
    90,
    "Modelagem, implementação e gerenciamento de bancos de dados.",
  ),

  criarDisciplina(
    "LC0302",
    "LC0302",
    "Engenharia de Software",
    3,
    90,
    "Processos, métodos e práticas para desenvolvimento de software.",
  ),

  criarDisciplina(
    "LC0303",
    "LC0303",
    "Sistemas Operacionais",
    3,
    60,
    "Conceitos e funcionamento dos sistemas operacionais.",
  ),

  criarDisciplina(
    "LC0304",
    "LC0304",
    "Didática Geral",
    3,
    60,
    "Fundamentos e práticas do processo de ensino.",
  ),

];


// ============================================================
// SEMESTRE 4
// ============================================================

const SEMESTRE_4: Disciplina[] = [

  criarDisciplina(
    "LC0401",
    "LC0401",
    "Redes de Computadores",
    4,
    90,
    "Comunicação de dados e redes de computadores.",
  ),

  criarDisciplina(
    "LC0402",
    "LC0402",
    "Desenvolvimento Web",
    4,
    90,
    "Desenvolvimento de aplicações para a Web.",
  ),

  criarDisciplina(
    "LC0403",
    "LC0403",
    "Interação Humano-Computador",
    4,
    60,
    "Interfaces, usabilidade e experiência do usuário.",
  ),

  criarDisciplina(
    "LC0404",
    "LC0404",
    "Metodologia Científica",
    4,
    60,
    "Métodos científicos e elaboração de trabalhos acadêmicos.",
  ),

];


// ============================================================
// SEMESTRE 5
// ============================================================

const SEMESTRE_5: Disciplina[] = [

  criarDisciplina(
    "LC0501",
    "LC0501",
    "Inteligência Artificial",
    5,
    90,
    "Fundamentos e aplicações de Inteligência Artificial.",
  ),

  criarDisciplina(
    "LC0502",
    "LC0502",
    "Programação para Dispositivos Móveis",
    5,
    90,
    "Desenvolvimento de aplicações para dispositivos móveis.",
  ),

  criarDisciplina(
    "LC0503",
    "LC0503",
    "Tecnologias Educacionais",
    5,
    60,
    "Tecnologias aplicadas aos processos educacionais.",
  ),

  criarDisciplina(
    "LC0504",
    "LC0504",
    "Avaliação da Aprendizagem",
    5,
    60,
    "Fundamentos e práticas de avaliação educacional.",
  ),

];


// ============================================================
// SEMESTRE 6
// ============================================================

const SEMESTRE_6: Disciplina[] = [

  criarDisciplina(
    "LC0601",
    "LC0601",
    "Computação Gráfica",
    6,
    90,
    "Fundamentos de representação e processamento gráfico.",
  ),

  criarDisciplina(
    "LC0602",
    "LC0602",
    "Desenvolvimento de Sistemas",
    6,
    90,
    "Desenvolvimento integrado de sistemas computacionais.",
  ),

  criarDisciplina(
    "LC0603",
    "LC0603",
    "Segurança da Informação",
    6,
    60,
    "Princípios e técnicas de segurança da informação.",
  ),

  criarDisciplina(
    "LC0604",
    "LC0604",
    "Educação Inclusiva",
    6,
    60,
    "Princípios e práticas da educação inclusiva.",
  ),

];


// ============================================================
// SEMESTRE 7
// ============================================================

const SEMESTRE_7: Disciplina[] = [

  criarDisciplina(
    "LC0701",
    "LC0701",
    "Computação em Nuvem",
    7,
    90,
    "Arquiteturas, serviços e aplicações em nuvem.",
  ),

  criarDisciplina(
    "LC0702",
    "LC0702",
    "Gestão de Projetos de Software",
    7,
    90,
    "Planejamento e gerenciamento de projetos de software.",
  ),

  criarDisciplina(
    "LC0703",
    "LC0703",
    "Prática de Ensino em Computação",
    7,
    90,
    "Planejamento e execução de práticas pedagógicas em Computação.",
  ),

  criarDisciplina(
    "LC0704",
    "LC0704",
    "Estágio Supervisionado",
    7,
    60,
    "Práticas docentes supervisionadas.",
  ),

];


// ============================================================
// SEMESTRE 8
// ============================================================

const SEMESTRE_8: Disciplina[] = [

  criarDisciplina(
    "LC0801",
    "LC0801",
    "Tópicos Especiais em Computação",
    8,
    90,
    "Estudo de temas atuais e emergentes da Computação.",
  ),

  criarDisciplina(
    "LC0802",
    "LC0802",
    "Empreendedorismo e Inovação",
    8,
    60,
    "Empreendedorismo, inovação e criação de soluções tecnológicas.",
  ),

  criarDisciplina(
    "LC0803",
    "LC0803",
    "Trabalho de Conclusão de Curso",
    8,
    145,
    "Pesquisa, desenvolvimento e apresentação do Trabalho de Conclusão de Curso.",
  ),

];


// ============================================================
// FUNÇÃO AUXILIAR
// CRIAR SEMESTRE
// ============================================================

function criarSemestre(
  numero: number,
  disciplinas: Disciplina[],
): Semestre {

  return {
    numero,

    nome: `${numero}º Semestre`,

    disciplinas,

    // ----------------------------------------------------------
    // O PRIMEIRO SEMESTRE COMEÇA DISPONÍVEL.
    // OS DEMAIS FICAM BLOQUEADOS.
    // ----------------------------------------------------------

    status:
      numero === 1
        ? "DISPONIVEL"
        : "BLOQUEADO",

    iniciado: false,

    finalizado: false,

    aprovado: false,

    percentualConclusao: 0,
  };
}


// ============================================================
// CURRÍCULO COMPLETO
// ============================================================

export const CURRICULO: Semestre[] = [

  criarSemestre(
    1,
    SEMESTRE_1,
  ),

  criarSemestre(
    2,
    SEMESTRE_2,
  ),

  criarSemestre(
    3,
    SEMESTRE_3,
  ),

  criarSemestre(
    4,
    SEMESTRE_4,
  ),

  criarSemestre(
    5,
    SEMESTRE_5,
  ),

  criarSemestre(
    6,
    SEMESTRE_6,
  ),

  criarSemestre(
    7,
    SEMESTRE_7,
  ),

  criarSemestre(
    8,
    SEMESTRE_8,
  ),

];


// ============================================================
// FUNÇÃO: OBTER SEMESTRE
// ============================================================

export function getSemestre(
  numero: number,
): Semestre | undefined {

  return CURRICULO.find(
    (semestre) =>
      semestre.numero === numero,
  );
}


// ============================================================
// FUNÇÃO: OBTER DISCIPLINA
// ============================================================

export function getDisciplina(
  codigo: string,
): Disciplina | undefined {

  for (const semestre of CURRICULO) {

    const disciplina =
      semestre.disciplinas.find(
        (item) =>
          item.codigo === codigo,
      );

    if (disciplina) {
      return disciplina;
    }
  }

  return undefined;
}


// ============================================================
// FUNÇÃO: TOTAL DE DISCIPLINAS
// ============================================================

export function getTotalDisciplinas(): number {

  return CURRICULO.reduce(
    (total, semestre) =>
      total +
      semestre.disciplinas.length,
    0,
  );
}


// ============================================================
// FUNÇÃO: CARGA HORÁRIA DAS DISCIPLINAS
// ============================================================

export function getCargaHorariaDisciplinas(): number {

  return CURRICULO.reduce(
    (total, semestre) =>
      total +
      semestre.disciplinas.reduce(
        (
          subtotal,
          disciplina,
        ) =>
          subtotal +
          disciplina.cargaHoraria,
        0,
      ),
    0,
  );
}


// ============================================================
// INFORMAÇÕES DA CARGA HORÁRIA
// ============================================================

export const CARGA_HORARIA = {

  disciplinas:
    informacoesCurso.cargaHorariaDisciplinas,

  trabalhoConclusaoCurso:
    informacoesCurso.trabalhoConclusaoCurso,

  atividadesComplementares:
    informacoesCurso.atividadesComplementares,

  totalMinimo:
    informacoesCurso.cargaHorariaTotal,

};


// ============================================================
// EXPORT DEFAULT
// ============================================================

export default CURRICULO; 