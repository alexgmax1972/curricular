import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// ============================================================
// GET /api/entregas
//
// Exemplos:
//
// /api/entregas
// /api/entregas?atividadeId=xxx
// /api/entregas?alunoId=xxx
// ============================================================

export async function GET(
  request: NextRequest,
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const atividadeId =
      searchParams.get("atividadeId");

    const alunoId =
      searchParams.get("alunoId");

    const entregas =
      await prisma.entrega.findMany({
        where: {
          ...(atividadeId
            ? {
                atividadeId,
              }
            : {}),

          ...(alunoId
            ? {
                alunoId,
              }
            : {}),
        },

        include: {
          aluno: {
            select: {
              id: true,
              nome: true,
              usuario: true,
            },
          },

          atividade: {
            select: {
              id: true,
              titulo: true,
              descricao: true,
              disciplina: true,
              semestre: true,
              prazo: true,
            },
          },

          arquivos: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      sucesso: true,
      total: entregas.length,
      entregas,
    });
  } catch (error) {
    console.error(
      "Erro ao buscar entregas:",
      error,
    );

    return NextResponse.json(
      {
        sucesso: false,
        mensagem:
          "Erro ao buscar entregas.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// POST /api/entregas
// ============================================================

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      await request.json();

    const {
      atividadeId,
      alunoId,
      comentario,
      arquivoId,
    } = body;

    // ========================================================
    // VALIDAÇÃO
    // ========================================================

    if (
      !atividadeId ||
      !alunoId
    ) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "atividadeId e alunoId são obrigatórios.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // VERIFICAR ALUNO
    // ========================================================

    const aluno =
      await prisma.aluno.findUnique({
        where: {
          id: String(alunoId),
        },
      });

    if (!aluno) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "Aluno não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // VERIFICAR ATIVIDADE
    // ========================================================

    const atividade =
      await prisma.atividade.findUnique({
        where: {
          id: String(atividadeId),
        },
      });

    if (!atividade) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "Atividade não encontrada.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // VERIFICAR ENTREGA EXISTENTE
    // ========================================================

    const entregaExistente =
      await prisma.entrega.findUnique({
        where: {
          atividadeId_alunoId: {
            atividadeId:
              String(atividadeId),

            alunoId:
              String(alunoId),
          },
        },
      });

    if (entregaExistente) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "O aluno já possui uma entrega para esta atividade.",

          entrega:
            entregaExistente,
        },
        {
          status: 409,
        },
      );
    }

    // ========================================================
    // VERIFICAR PRAZO
    // ========================================================

    const agora =
      new Date();

    const atrasada =
      atividade.prazo !== null &&
      agora > atividade.prazo;

    // ========================================================
    // CRIAR ENTREGA
    // ========================================================

    const entrega =
      await prisma.entrega.create({
        data: {
          atividadeId:
            String(atividadeId),

          alunoId:
            String(alunoId),

          comentario:
            comentario
              ? String(
                  comentario,
                ).trim()
              : null,

          status:
            atrasada
              ? "ATRASADA"
              : "ENTREGUE",
        },

        include: {
          aluno: {
            select: {
              id: true,
              nome: true,
              usuario: true,
            },
          },

          atividade: {
            select: {
              id: true,
              titulo: true,
              disciplina: true,
              semestre: true,
              prazo: true,
            },
          },

          arquivos: true,
        },
      });

    // ========================================================
    // ASSOCIAR ARQUIVO
    // ========================================================

    if (arquivoId) {
      await prisma.arquivo.update({
        where: {
          id: String(arquivoId),
        },

        data: {
          entregaId:
            entrega.id,

          atividadeId:
            null,
        },
      });
    }

    // ========================================================
    // BUSCAR ENTREGA ATUALIZADA
    // ========================================================

    const entregaFinal =
      await prisma.entrega.findUnique({
        where: {
          id: entrega.id,
        },

        include: {
          aluno: {
            select: {
              id: true,
              nome: true,
              usuario: true,
            },
          },

          atividade: true,

          arquivos: true,
        },
      });

    return NextResponse.json(
      {
        sucesso: true,

        mensagem:
          atrasada
            ? "Atividade entregue após o prazo."
            : "Atividade entregue com sucesso.",

        entrega:
          entregaFinal,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao registrar entrega:",
      error,
    );

    return NextResponse.json(
      {
        sucesso: false,

        mensagem:
          "Não foi possível registrar a entrega.",
      },
      {
        status: 500,
      },
    );
  }
}