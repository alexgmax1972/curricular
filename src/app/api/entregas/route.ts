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
// Prisma 7 + PostgreSQL
// ============================================================

// ============================================================
// TIPOS
// ============================================================

type StatusEntrega =
  | "ENVIADA"
  | "AVALIADA"
  | "DEVOLVIDA";

type NotaEntrega =
  | "A"
  | "B"
  | "C"
  | "D";

// ============================================================
// GET
//
// GET /api/entregas
//
// Exemplos:
//
// /api/entregas
// /api/entregas?atividadeId=xxx
// /api/entregas?alunoId=xxx
// /api/entregas?atividadeId=xxx&alunoId=xxx
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
      where.atividadeId =
        atividadeId.trim();
    }

    if (alunoId) {
      where.alunoId =
        alunoId.trim();
    }

    // ========================================================
    // BUSCAR ENTREGAS
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

        total:
          entregas.length,

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
      body.arquivoId !==
        undefined &&
      body.arquivoId !== null &&
      String(body.arquivoId).trim()
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
          ).trim() || null
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
    // VERIFICAR ENTREGA EXISTENTE
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

      // ------------------------------------------------------
      // O arquivo não pode pertencer a outra entrega
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // O arquivo não pode pertencer a outra atividade
      // ------------------------------------------------------

      if (
        arquivo.atividadeId &&
        arquivo.atividadeId !==
          atividadeId
      ) {
        return NextResponse.json(
          {
            sucesso: false,

            mensagem:
              "Este arquivo pertence a outra atividade.",
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
      agora.getTime() >
        atividade.prazo.getTime();

    // ========================================================
    // OBSERVAÇÃO
    //
    // O status do banco permanece:
    //
    // ENVIADA
    // AVALIADA
    // DEVOLVIDA
    //
    // A informação de atraso é retornada
    // separadamente para não criar um status
    // incompatível com a regra atual.
    // ========================================================

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

          // --------------------------------------------------
          // ASSOCIAR ARQUIVO
          // --------------------------------------------------

          if (arquivoId) {
            await tx.arquivo.update({
              where: {
                id: arquivoId,
              },

              data: {
                entregaId:
                  novaEntrega.id,

                atividadeId:
                  null,
              },
            });
          }

          // --------------------------------------------------
          // BUSCAR ENTREGA COMPLETA
          // --------------------------------------------------

          return tx.entrega.findUnique({
            where: {
              id:
                novaEntrega.id,
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
// PATCH
//
// PATCH /api/entregas
//
// Usado principalmente pelo professor para:
//
// - atribuir nota
// - escrever comentário/feedback
// - alterar status
//
// JSON:
//
// {
//   "id": "...",
//   "nota": "A",
//   "comentario": "Excelente trabalho."
// }
//
// OU:
//
// {
//   "id": "...",
//   "status": "DEVOLVIDA"
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
    // ========================================================

    let nota:
      | NotaEntrega
      | null
      | undefined =
      undefined;

    if (
      body.nota !==
      undefined
    ) {
      if (
        body.nota ===
        null
      ) {
        nota = null;
      } else {
        const notaRecebida =
          String(
            body.nota,
          )
            .trim()
            .toUpperCase();

        if (
          ![
            "A",
            "B",
            "C",
            "D",
          ].includes(
            notaRecebida,
          )
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

        nota =
          notaRecebida as NotaEntrega;
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
        body.comentario ===
        null
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
    //
    // A ENTREGA FICA AUTOMATICAMENTE AVALIADA.
    // ========================================================

    if (
      nota !==
        undefined &&
      nota !==
        null
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
// DELETE /api/entregas?id=xxx
// ============================================================

export async function DELETE(
  request: NextRequest,
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const id =
      searchParams.get(
        "id",
      );

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
    // VERIFICAR ENTREGA
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
    // EXCLUIR ENTREGA
    //
    // ATENÇÃO:
    // Os arquivos relacionados possuem
    // onDelete: Cascade no schema.
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