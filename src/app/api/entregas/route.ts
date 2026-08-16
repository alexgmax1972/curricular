import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// ============================================================
// P.A.C.
// Plataforma de Atividade Curricular
//
// src/app/api/entregas/route.ts
//
// API DE ENTREGAS DE ATIVIDADES
//
// Banco: Prisma + PostgreSQL
// ============================================================

type StatusEntrega =
  | "ENVIADA"
  | "AVALIADA"
  | "DEVOLVIDA";

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

    // ========================================================
    // FILTROS
    // ========================================================

    const entregas =
      await prisma.entrega.findMany({
        where: {
          ...(atividadeId
            ? {
                atividadeId:
                  atividadeId.trim(),
              }
            : {}),

          ...(alunoId
            ? {
                alunoId:
                  alunoId.trim(),
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
// POST /api/entregas
//
// Cria uma entrega.
//
// Body:
//
// {
//   "atividadeId": "...",
//   "alunoId": "...",
//   "comentario": "...",
//   "arquivoId": "..."
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
      body.comentario !==
        undefined &&
      body.comentario !== null
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
    // VERIFICAR ENTREGA EXISTENTE
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

      // O arquivo não pode estar associado
      // a outra entrega.

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
    // VERIFICAR PRAZO
    // ========================================================

    const agora =
      new Date();

    const atrasada =
      atividade.prazo !== null &&
      agora > atividade.prazo;

    // ========================================================
    // CRIAR ENTREGA
    //
    // O status inicial continua ENVIADA.
    //
    // A informação de atraso pode ser determinada pelo
    // prazo da atividade sem criar um novo status no banco.
    // ========================================================

    const entrega =
      await prisma.$transaction(
        async (tx) => {
          const novaEntrega =
            await tx.entrega.create({
              data: {
                atividadeId,
                alunoId,
                comentario:
                  comentario || null,
                status:
                  "ENVIADA",
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

                // O arquivo pertence agora à entrega.
                atividadeId:
                  null,
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
          atrasada
            ? "Atividade entregue após o prazo."
            : "Atividade entregue com sucesso.",

        atrasada,

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
// PATCH /api/entregas
//
// Atualiza uma entrega.
//
// Body:
//
// {
//   "id": "...",
//   "nota": "A",
//   "comentario": "...",
//   "status": "AVALIADA"
// }
// ============================================================

export async function PATCH(
  request: NextRequest,
) {
  try {
    const body =
      await request.json();

    const id =
      String(
        body.id ?? "",
      ).trim();

    // ========================================================
    // VALIDAR ID
    // ========================================================

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
    // COMENTÁRIO
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
    // DADOS PARA ATUALIZAÇÃO
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
    // SE RECEBEU UMA NOTA,
    // MARCA AUTOMATICAMENTE COMO AVALIADA
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

    // ========================================================
    // VALIDAR ID
    // ========================================================

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