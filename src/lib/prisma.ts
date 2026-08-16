// ============================================================
// P.A.C.
// Plataforma de Atividade Curricular
//
// src/lib/prisma.ts
//
// Prisma 7 + PostgreSQL
// ============================================================

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// ============================================================
// VERIFICAR DATABASE_URL
// ============================================================

const connectionString =
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL não está configurada."
  );
}

// ============================================================
// SINGLETON
// Evita criar vários PrismaClient
// em ambiente de desenvolvimento/serverless.
// ============================================================

const globalForPrisma =
  globalThis as unknown as {
    prisma?: PrismaClient;
  };

// ============================================================
// ADAPTER POSTGRESQL
// ============================================================

const adapter =
  new PrismaPg({
    connectionString,
  });

// ============================================================
// PRISMA CLIENT
// ============================================================

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

// ============================================================
// DESENVOLVIMENTO
// ============================================================

if (
  process.env.NODE_ENV !==
  "production"
) {
  globalForPrisma.prisma =
    prisma;
}