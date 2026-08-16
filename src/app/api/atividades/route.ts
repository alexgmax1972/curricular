import { NextRequest, NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";

// ============================================================
// P.A.C.
// Plataforma de Atividade Curricular
//
// API DE ATIVIDADES
//
// Banco: Prisma + SQLite
// ============================================================

// ============================================================
// GET /api/atividades
//
// Exemplos:
//
// /api/atividades
// /api/atividades?professorId=xxx
// /api/atividades?disciplina=Programação
// /api/atividades?semestre=1
// ============================================================

export async function GET(
  request: NextRequest,
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const professorId =
      searchParams.get(
        "professorId",
      );

    const disciplina =
      searchParams.get(
        "disciplina",
      );

    const semestreTexto =
      searchParams.get(
        "semestre",
      );

    const semestre =
      semestreTexto
        ? Number(semestreTexto)
        : undefined;

    // ========================================================
    // BUSCAR ATIVIDADES NO PRISMA
    // ========================================================

    const atividades =
      await prisma.atividade.findMany({
        where: {
          ...(professorId
            ? {
                professorId,
              }
            }
            : {}),

          ...(disciplina
            ? {
                disciplina,
              }
            : {}),

          ...(semestre !==
            undefined &&
          Number.isInteger(
            semestre,
          )
            ? {
                semestre,
              }
            : {}),
        },

        include: {
          professor: {
            select: {
              id: true,
              nome: true,
              usuario: true,
              disciplina: true,
            },
          },

          arquivos: true,

          entregas: {
            include: {
              aluno: {
                select: {
                  id: true,
                  nome: true,
                  usuario: true,
                },
              },

              arquivos: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    // ========================================================
    // RESPOSTA
    // ========================================================

    return NextResponse.json({
      sucesso: true,

      total:
        atividades.length,

      atividades,
    });
  } catch (error) {
    console.error(
      "Erro ao buscar atividades:",
      error,
    );

    return NextResponse.json(
      {
        sucesso: false,

        mensagem:
          "Erro ao buscar atividades.",
      },

      {
        status: 500,
      },
    );
  }
}

// ============================================================
// POST /api/atividades
//
// Cria uma nova atividade no banco.
//
// Body:
//
// {
//   "titulo": "Trabalho de Programação",
//   "descricao": "Desenvolver um sistema...",
//   "professorId": "...",
//   "disciplina": "Programação",
//   "semestre": 1,
//   "prazo": "2026-08-30T23:59:00"
// }
// ============================================================

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      await request.json();

    const {
      titulo,
      descricao,
      professorId,
      disciplina,
      semestre,
      prazo,
    } = body;

    // ========================================================
    // VALIDAÇÃO
    // ========================================================

    if (
      !titulo ||
      !professorId
    ) {
      return NextResponse.json(
        {
          sucesso: false,

          mensagem:
            "Título e professor são obrigatórios.",
        },

        {
          status: 400,
        },
      );
    }

    // ========================================================
    // VERIFICAR PROFESSOR
    // ========================================================

    const professor =
      await prisma.professor.findUnique({
        where: {
          id: String(
            professorId,
          ),
        },
      });

    if (!professor) {
      return NextResponse.json(
        {
          sucesso: false,

          mensagem:
            "Professor não encontrado.",
        },

        {
          status: 404,
        },
      );
    }

    // ========================================================
    // PREPARAR SEMESTRE
    // ========================================================

    let semestreNumero:
      number | null = null;

    if (
      semestre !==
        undefined &&
      semestre !==
        null &&
      semestre !== ""
    ) {
      const numero =
        Number(semestre);

      if (
        Number.isInteger(
          numero,
        ) &&
        numero > 0
      ) {
        semestreNumero =
          numero;
      }
    }

    // ========================================================
    // PREPARAR PRAZO
    // ========================================================

    let prazoData:
      Date | null = null;

    if (prazo) {
      const data =
        new Date(prazo);

      if (
        Number.isNaN(
          data.getTime(),
        )
      ) {
        return NextResponse.json(
          {
            sucesso: false,

            mensagem:
              "A data do prazo é inválida.",
          },

          {
            status: 400,
          },
        );
      }

      prazoData = data;
    }

    // ========================================================
    // CRIAR ATIVIDADE
    // ========================================================

    const atividade =
      await prisma.atividade.create({
        data: {
          titulo:
            String(
              titulo,
            ).trim(),

          descricao:
            descricao
              ? String(
                  descricao,
                ).trim()
              : null,

          professorId:
            String(
              professorId,
            ),

          disciplina:
            disciplina
              ? String(
                  disciplina,
                ).trim()
              : null,

          semestre:
            semestreNumero,

          prazo:
            prazoData,
        },

        include: {
          professor: {
            select: {
              id: true,
              nome: true,
              usuario: true,
              disciplina: true,
            },
          },

          arquivos: true,

          entregas: true,
        },
      });

    // ========================================================
    // RESPOSTA
    // ========================================================

    return NextResponse.json(
      {
        sucesso: true,

        mensagem:
          "Atividade criada com sucesso.",

        atividade,
      },

      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao criar atividade:",
      error,
    );

    return NextResponse.json(
      {
        sucesso: false,

        mensagem:
          "Não foi possível criar a atividade.",
      },

      {
        status: 500,
      },
    );
  }
}