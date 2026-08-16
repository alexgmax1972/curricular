// ============================================================
// P.A.C.
// Plataforma de Atividade Curricular
//
// src/app/api/entregas/route.ts
//
// API DE ENTREGAS DE ATIVIDADES
//
// Prisma + SQLite
// ============================================================

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// ============================================================
// TIPOS
// ============================================================

type StatusEntrega =
  | "ENVIADA"
  | "AVALIADA"
  | "DEVOLVIDA";

// ============================================================
// GET
//
// GET /api/entregas
//
// Filtros:
//
// /api/entregas?alunoId=...
// /api/entregas?atividadeId=...
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

    // ========================================================
    // FILTROS
    // ========================================================

    const where: {
      atividadeId?: string;
      alunoId?: string;
    } = {};

    if (atividadeId) {
      where.atividadeId = atividadeId;
    }

    if (alunoId) {
      where.alunoId = alunoId;
    }

    // ========================================================
    // BUSCAR NO BANCO
    // ========================================================

    const entregas =
      await prisma.entrega.findMany({
        where,

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

    // ========================================================
    // RESPOSTA
    // ========================================================

    return NextResponse.json(
      {
        sucesso: true,

        total: entregas.length,

        entregas,
      },
      {
        status: 200,
      },
    );
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
// POST
//
// POST /api/entregas
//
// Cria uma nova entrega.
//
// JSON:
//
// {
//   "atividadeId": "...",
//   "alunoId": "...",
//   "arquivoId": "...",
//   "comentario": "Minha atividade"
// }
// ============================================================

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      await request.json();

    // ========================================================
    // DADOS
    // ========================================================

    const atividadeId =
      String(
        body.atividadeId ?? "",
      ).trim();

    const alunoId =
      String(
        body.alunoId ?? "",
      ).trim();

    const arquivoId =
      body.arquivoId
        ? String(
            body.arquivoId,
          ).trim()
        : null;

    const comentario =
      body.comentario
        ? String(
            body.comentario,
          ).trim()
        : null;

    // ========================================================
    // VALIDAÇÃO
    // ========================================================

    if (!atividadeId) {
      return NextResponse.json(
        {
          sucesso: false,

          mensagem:
            "O atividadeId é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    if (!alunoId) {
      return NextResponse.json(
        {
          sucesso: false,

          mensagem:
            "O alunoId é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // VERIFICAR ATIVIDADE
    // ========================================================

    const atividade =
      await prisma.atividade.findUnique({
        where: {
          id: atividadeId,
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
    // VERIFICAR ALUNO
    // ========================================================

    const aluno =
      await prisma.aluno.findUnique({
        where: {
          id: alunoId,
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
    // VERIFICAR SE JÁ ENTREGOU
    //
    // O schema possui:
    //
    // @@unique([atividadeId, alunoId])
    // ========================================================

    const entregaExistente =
      await prisma.entrega.findUnique({
        where: {
          atividadeId_alunoId: {
            atividadeId,
            alunoId,
          },
        },

        include: {
          arquivos: true,
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
    // VERIFICAR ARQUIVO
    // ========================================================

    if (arquivoId) {
      const arquivo =
        await prisma.arquivo.findUnique({
          where: {
            id: arquivoId,
          },
        });

      if (!arquivo) {
        return NextResponse.json(
          {
            sucesso: false,

            mensagem:
              "Arquivo não encontrado.",
          },
          {
            status: 404,
          },
        );
      }

      // Não permitir anexar arquivo
      // que já esteja ligado a outra entrega.

      if (arquivo.entregaId) {
        return NextResponse.json(
          {
            sucesso: false,

            mensagem:
              "Este arquivo já está associado a uma entrega.",
          },
          {
            status: 409,
          },
        );
      }
    }

    // ========================================================
    // CRIAR ENTREGA
    // ========================================================

    const entrega =
      await prisma.$transaction(
        async (tx) => {
          const novaEntrega =
            await tx.entrega.create({
              data: {
                atividadeId,

                alunoId,

                comentario,

                status:
                  "ENVIADA",
              },
            });

          // ==================================================
          // ASSOCIAR ARQUIVO
          // ==================================================

          if (arquivoId) {
            await tx.arquivo.update({
              where: {
                id: arquivoId,
              },

              data: {
                entregaId:
                  novaEntrega.id,
              },
            });
          }

          // ==================================================
          // BUSCAR ENTREGA COMPLETA
          // ==================================================

          return tx.entrega.findUnique({
            where: {
              id: novaEntrega.id,
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
          });
        },
      );

    // ========================================================
    // RESPOSTA
    // ========================================================

    return NextResponse.json(
      {
        sucesso: true,

        mensagem:
          "Atividade entregue com sucesso.",

        entrega,
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

// ============================================================
// PATCH
//
// PATCH /api/entregas
//
// Corrigir uma entrega.
//
// JSON:
//
// {
//   "id": "...",
//   "nota": "A",
//   "feedback": "Excelente trabalho.",
//   "status": "AVALIADA"
// }
// ============================================================

export async function PATCH(
  request: NextRequest,
) {
  try {
    const body =
      await request.json();

    // ========================================================
    // ID
    // ========================================================

    const id =
      String(
        body.id ?? "",
      ).trim();

    if (!id) {
      return NextResponse.json(
        {
          sucesso: false,

          mensagem:
            "O ID da entrega é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // BUSCAR ENTREGA
    // ========================================================

    const entregaExistente =
      await prisma.entrega.findUnique({
        where: {
          id,
        },
      });

    if (!entregaExistente) {
      return NextResponse.json(
        {
          sucesso: false,

          mensagem:
            "Entrega não encontrada.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // NOTA
    //
    // Seu Prisma usa:
    //
    // nota String?
    //
    // E o sistema P.A.C. utiliza:
    //
    // A = PASSOU
    // B = PASSOU
    // C = PASSOU
    // D = REPROVADO
    // ========================================================

    let nota:
      | string
      | null
      | undefined =
      undefined;

    if (
      body.nota !==
      undefined
    ) {
      nota =
        body.nota === null
          ? null
          : String(
              body.nota,
            )
              .trim()
              .toUpperCase();

      if (
        nota !== null &&
        ![
          "A",
          "B",
          "C",
          "D",
        ].includes(nota)
      ) {
        return NextResponse.json(
          {
            sucesso: false,

            mensagem:
              "A nota deve ser A, B, C ou D.",
          },
          {
            status: 400,
          },
        );
      }
    }

    // ========================================================
    // COMENTÁRIO / FEEDBACK
    //
    // No seu schema o campo é "comentario".
    // ========================================================

    let comentario:
      | string
      | null
      | undefined =
      undefined;

    if (
      body.comentario !==
      undefined
    ) {
      comentario =
        body.comentario === null
          ? null
          : String(
              body.comentario,
            ).trim();
    }

    // ========================================================
    // STATUS
    // ========================================================

    let status:
      | StatusEntrega
      | undefined =
      undefined;

    if (
      body.status !==
      undefined
    ) {
      const statusRecebido =
        String(
          body.status,
        )
          .trim()
          .toUpperCase();

      if (
        ![
          "ENVIADA",
          "AVALIADA",
          "DEVOLVIDA",
        ].includes(
          statusRecebido,
        )
      ) {
        return NextResponse.json(
          {
            sucesso: false,

            mensagem:
              "Status inválido. Use ENVIADA, AVALIADA ou DEVOLVIDA.",
          },
          {
            status: 400,
          },
        );
      }

      status =
        statusRecebido as StatusEntrega;
    }

    // ========================================================
    // MONTAR DADOS
    // ========================================================

    const data: {
      nota?: string | null;
      comentario?: string | null;
      status?: string;
    } = {};

    if (
      nota !==
      undefined
    ) {
      data.nota =
        nota;
    }

    if (
      comentario !==
      undefined
    ) {
      data.comentario =
        comentario;
    }

    if (
      status !==
      undefined
    ) {
      data.status =
        status;
    }

    // ========================================================
    // SE INFORMOU NOTA
    // AUTOMATICAMENTE FICA AVALIADA
    // ========================================================

    if (
      nota !==
        undefined &&
      nota !== null
    ) {
      data.status =
        "AVALIADA";
    }

    // ========================================================
    // ATUALIZAR
    // ========================================================

    const entrega =
      await prisma.entrega.update({
        where: {
          id,
        },

        data,

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
      });

    // ========================================================
    // RESPOSTA
    // ========================================================

    return NextResponse.json(
      {
        sucesso: true,

        mensagem:
          "Entrega atualizada com sucesso.",

        entrega,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao atualizar entrega:",
      error,
    );

    return NextResponse.json(
      {
        sucesso: false,

        mensagem:
          "Não foi possível atualizar a entrega.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// DELETE
//
// DELETE /api/entregas?id=...
// ============================================================

export async function DELETE(
  request: NextRequest,
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const id =
      searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          sucesso: false,

          mensagem:
            "O ID da entrega é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // VERIFICAR
    // ========================================================

    const entrega =
      await prisma.entrega.findUnique({
        where: {
          id,
        },

        include: {
          arquivos: true,
        },
      });

    if (!entrega) {
      return NextResponse.json(
        {
          sucesso: false,

          mensagem:
            "Entrega não encontrada.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // EXCLUIR
    //
    // Os arquivos relacionados também serão
    // excluídos devido ao onDelete: Cascade.
    // ========================================================

    await prisma.entrega.delete({
      where: {
        id,
      },
    });

    // ========================================================
    // RESPOSTA
    // ========================================================

    return NextResponse.json(
      {
        sucesso: true,

        mensagem:
          "Entrega removida com sucesso.",

        entrega,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao excluir entrega:",
      error,
    );

    return NextResponse.json(
      {
        sucesso: false,

        mensagem:
          "Não foi possível excluir a entrega.",
      },
      {
        status: 500,
      },
    );
  }
}