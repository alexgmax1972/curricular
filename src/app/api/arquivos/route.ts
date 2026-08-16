// ============================================================
// P.A.C.
// Plataforma de Atividade Curricular
//
// src/app/api/arquivos/route.ts
//
// API DE ARQUIVOS
//
// Prisma + PostgreSQL
// ============================================================

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// ============================================================
// GET
//
// GET /api/arquivos
//
// Filtros:
//
// /api/arquivos?atividadeId=...
// /api/arquivos?entregaId=...
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const atividadeId = searchParams.get("atividadeId");
    const entregaId = searchParams.get("entregaId");

    const where: {
      atividadeId?: string;
      entregaId?: string;
    } = {};

    if (atividadeId) {
      where.atividadeId = atividadeId;
    }

    if (entregaId) {
      where.entregaId = entregaId;
    }

    const arquivos = await prisma.arquivo.findMany({
      where,

      include: {
        atividade: {
          select: {
            id: true,
            titulo: true,
            disciplina: true,
            semestre: true,
          },
        },

        entrega: {
          select: {
            id: true,
            atividadeId: true,
            alunoId: true,
            status: true,
            nota: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        sucesso: true,
        total: arquivos.length,
        arquivos,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Erro ao buscar arquivos:", error);

    return NextResponse.json(
      {
        sucesso: false,
        mensagem: "Erro ao buscar arquivos.",
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
// POST /api/arquivos
//
// Cria o registro do arquivo.
//
// JSON:
//
// {
//   "nomeOriginal": "atividade.pdf",
//   "nomeArquivo": "abc123.pdf",
//   "caminho": "/uploads/abc123.pdf",
//   "url": "https://...",
//   "mimeType": "application/pdf",
//   "tamanho": 123456,
//   "atividadeId": "...",
//   "entregaId": "..."
// }
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ========================================================
    // DADOS
    // ========================================================

    const nomeOriginal = String(
      body.nomeOriginal ?? "",
    ).trim();

    const nomeArquivo = String(
      body.nomeArquivo ?? "",
    ).trim();

    const caminho = String(
      body.caminho ?? "",
    ).trim();

    const url = String(
      body.url ?? "",
    ).trim();

    const mimeType =
      body.mimeType !== undefined &&
      body.mimeType !== null
        ? String(body.mimeType).trim()
        : null;

    let tamanho: number | null = null;

    if (
      body.tamanho !== undefined &&
      body.tamanho !== null &&
      body.tamanho !== ""
    ) {
      tamanho = Number(body.tamanho);

      if (!Number.isInteger(tamanho) || tamanho < 0) {
        return NextResponse.json(
          {
            sucesso: false,
            mensagem:
              "O tamanho do arquivo deve ser um número inteiro maior ou igual a zero.",
          },
          {
            status: 400,
          },
        );
      }
    }

    const atividadeId =
      body.atividadeId !== undefined &&
      body.atividadeId !== null &&
      String(body.atividadeId).trim() !== ""
        ? String(body.atividadeId).trim()
        : null;

    const entregaId =
      body.entregaId !== undefined &&
      body.entregaId !== null &&
      String(body.entregaId).trim() !== ""
        ? String(body.entregaId).trim()
        : null;

    // ========================================================
    // VALIDAÇÃO
    // ========================================================

    if (!nomeOriginal) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "O nome original do arquivo é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    if (!nomeArquivo) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "O nome do arquivo é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    if (!caminho) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "O caminho do arquivo é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    if (!url) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "A URL do arquivo é obrigatória.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // VERIFICAR ATIVIDADE
    // ========================================================

    if (atividadeId) {
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
    }

    // ========================================================
    // VERIFICAR ENTREGA
    // ========================================================

    if (entregaId) {
      const entrega =
        await prisma.entrega.findUnique({
          where: {
            id: entregaId,
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
    }

    // ========================================================
    // VERIFICAR CONSISTÊNCIA
    //
    // Se houver atividade e entrega, a entrega precisa
    // pertencer à mesma atividade.
    // ========================================================

    if (atividadeId && entregaId) {
      const entrega =
        await prisma.entrega.findUnique({
          where: {
            id: entregaId,
          },
          select: {
            atividadeId: true,
          },
        });

      if (
        entrega &&
        entrega.atividadeId !== atividadeId
      ) {
        return NextResponse.json(
          {
            sucesso: false,
            mensagem:
              "A entrega não pertence à atividade informada.",
          },
          {
            status: 400,
          },
        );
      }
    }

    // ========================================================
    // CRIAR ARQUIVO
    // ========================================================

    const arquivo =
      await prisma.arquivo.create({
        data: {
          nomeOriginal,
          nomeArquivo,
          caminho,
          url,
          mimeType,
          tamanho,
          atividadeId,
          entregaId,
        },

        include: {
          atividade: {
            select: {
              id: true,
              titulo: true,
              disciplina: true,
              semestre: true,
            },
          },

          entrega: {
            select: {
              id: true,
              atividadeId: true,
              alunoId: true,
              status: true,
              nota: true,
            },
          },
        },
      });

    // ========================================================
    // RESPOSTA
    // ========================================================

    return NextResponse.json(
      {
        sucesso: true,

        mensagem:
          "Arquivo registrado com sucesso.",

        arquivo,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao registrar arquivo:",
      error,
    );

    return NextResponse.json(
      {
        sucesso: false,
        mensagem:
          "Não foi possível registrar o arquivo.",
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
// PATCH /api/arquivos
//
// JSON:
//
// {
//   "id": "...",
//   "nomeOriginal": "...",
//   "nomeArquivo": "...",
//   "caminho": "...",
//   "url": "...",
//   "mimeType": "...",
//   "tamanho": 123
// }
// ============================================================

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const id = String(
      body.id ?? "",
    ).trim();

    if (!id) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "O ID do arquivo é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // VERIFICAR ARQUIVO
    // ========================================================

    const arquivoExistente =
      await prisma.arquivo.findUnique({
        where: {
          id,
        },
      });

    if (!arquivoExistente) {
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

    // ========================================================
    // DADOS OPCIONAIS
    // ========================================================

    const data: {
      nomeOriginal?: string;
      nomeArquivo?: string;
      caminho?: string;
      url?: string;
      mimeType?: string | null;
      tamanho?: number | null;
    } = {};

    if (
      body.nomeOriginal !== undefined
    ) {
      const valor = String(
        body.nomeOriginal,
      ).trim();

      if (!valor) {
        return NextResponse.json(
          {
            sucesso: false,
            mensagem:
              "O nome original não pode ficar vazio.",
          },
          {
            status: 400,
          },
        );
      }

      data.nomeOriginal = valor;
    }

    if (
      body.nomeArquivo !== undefined
    ) {
      const valor = String(
        body.nomeArquivo,
      ).trim();

      if (!valor) {
        return NextResponse.json(
          {
            sucesso: false,
            mensagem:
              "O nome do arquivo não pode ficar vazio.",
          },
          {
            status: 400,
          },
        );
      }

      data.nomeArquivo = valor;
    }

    if (
      body.caminho !== undefined
    ) {
      const valor = String(
        body.caminho,
      ).trim();

      if (!valor) {
        return NextResponse.json(
          {
            sucesso: false,
            mensagem:
              "O caminho não pode ficar vazio.",
          },
          {
            status: 400,
          },
        );
      }

      data.caminho = valor;
    }

    if (
      body.url !== undefined
    ) {
      const valor = String(
        body.url,
      ).trim();

      if (!valor) {
        return NextResponse.json(
          {
            sucesso: false,
            mensagem:
              "A URL não pode ficar vazia.",
          },
          {
            status: 400,
          },
        );
      }

      data.url = valor;
    }

    if (
      body.mimeType !== undefined
    ) {
      data.mimeType =
        body.mimeType === null
          ? null
          : String(
              body.mimeType,
            ).trim();
    }

    if (
      body.tamanho !== undefined
    ) {
      if (
        body.tamanho === null ||
        body.tamanho === ""
      ) {
        data.tamanho = null;
      } else {
        const tamanho = Number(
          body.tamanho,
        );

        if (
          !Number.isInteger(tamanho) ||
          tamanho < 0
        ) {
          return NextResponse.json(
            {
              sucesso: false,
              mensagem:
                "O tamanho deve ser um número inteiro maior ou igual a zero.",
            },
            {
              status: 400,
            },
          );
        }

        data.tamanho = tamanho;
      }
    }

    // ========================================================
    // ATUALIZAR
    // ========================================================

    const arquivo =
      await prisma.arquivo.update({
        where: {
          id,
        },

        data,

        include: {
          atividade: {
            select: {
              id: true,
              titulo: true,
              disciplina: true,
              semestre: true,
            },
          },

          entrega: {
            select: {
              id: true,
              atividadeId: true,
              alunoId: true,
              status: true,
              nota: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        sucesso: true,

        mensagem:
          "Arquivo atualizado com sucesso.",

        arquivo,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao atualizar arquivo:",
      error,
    );

    return NextResponse.json(
      {
        sucesso: false,
        mensagem:
          "Não foi possível atualizar o arquivo.",
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
// DELETE /api/arquivos?id=...
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
            "O ID do arquivo é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // VERIFICAR
    // ========================================================

    const arquivo =
      await prisma.arquivo.findUnique({
        where: {
          id,
        },

        include: {
          atividade: {
            select: {
              id: true,
              titulo: true,
            },
          },

          entrega: {
            select: {
              id: true,
              atividadeId: true,
              alunoId: true,
            },
          },
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

    // ========================================================
    // EXCLUIR REGISTRO
    // ========================================================

    await prisma.arquivo.delete({
      where: {
        id,
      },
    });

    // ========================================================
    // IMPORTANTE
    //
    // O Prisma remove o registro do banco.
    //
    // A exclusão física do arquivo no Storage deverá ser
    // feita pelo serviço de armazenamento utilizado pela
    // aplicação.
    // ========================================================

    return NextResponse.json(
      {
        sucesso: true,

        mensagem:
          "Arquivo removido com sucesso.",

        arquivo,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao excluir arquivo:",
      error,
    );

    return NextResponse.json(
      {
        sucesso: false,
        mensagem:
          "Não foi possível excluir o arquivo.",
      },
      {
        status: 500,
      },
    );
  }
}