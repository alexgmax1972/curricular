import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// ============================================================
// P.A.C.
// Plataforma de Atividade Curricular
//
// src/app/api/atividades/route.ts
//
// API DE ATIVIDADES
//
// Banco: Prisma + PostgreSQL
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const professorId =
      searchParams.get("professorId");

    const disciplina =
      searchParams.get("disciplina");

    const semestreTexto =
      searchParams.get("semestre");

    const semestre =
      semestreTexto !== null &&
      semestreTexto.trim() !== ""
        ? Number(semestreTexto)
        : undefined;

    // ========================================================
    // BUSCAR ATIVIDADES
    // ========================================================

    const atividades =
      await prisma.atividade.findMany({
        where: {
          ...(professorId
            ? {
                professorId: professorId.trim(),
              }
            : {}),

          ...(disciplina
            ? {
                disciplina: disciplina.trim(),
              }
            : {}),

          ...(semestre !== undefined &&
          Number.isInteger(semestre)
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

    return NextResponse.json(
      {
        sucesso: true,
        total: atividades.length,
        atividades,
      },
      {
        status: 200,
      },
    );
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
// Cria uma nova atividade.
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ========================================================
    // DADOS
    // ========================================================

    const titulo =
      String(body.titulo ?? "").trim();

    const descricao =
      body.descricao !== undefined &&
      body.descricao !== null
        ? String(body.descricao).trim()
        : null;

    const professorId =
      String(body.professorId ?? "").trim();

    const disciplina =
      body.disciplina !== undefined &&
      body.disciplina !== null
        ? String(body.disciplina).trim()
        : null;

    const semestre =
      body.semestre;

    const prazo =
      body.prazo;

    // ========================================================
    // VALIDAÇÃO
    // ========================================================

    if (!titulo) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "O título da atividade é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    if (!professorId) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "O professorId é obrigatório.",
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
          id: professorId,
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
      semestre !== undefined &&
      semestre !== null &&
      semestre !== ""
    ) {
      const numero = Number(semestre);

      if (
        !Number.isInteger(numero) ||
        numero <= 0
      ) {
        return NextResponse.json(
          {
            sucesso: false,
            mensagem:
              "O semestre deve ser um número inteiro maior que zero.",
          },
          {
            status: 400,
          },
        );
      }

      semestreNumero = numero;
    }

    // ========================================================
    // PREPARAR PRAZO
    // ========================================================

    let prazoData:
      Date | null = null;

    if (
      prazo !== undefined &&
      prazo !== null &&
      prazo !== ""
    ) {
      const data = new Date(prazo);

      if (
        Number.isNaN(data.getTime())
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
          titulo,

          descricao:
            descricao || null,

          professorId,

          disciplina:
            disciplina || null,

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