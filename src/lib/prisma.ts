import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

/* ============================================================
P.A.C.
Plataforma de Atividade Curricular

Prisma 7.9.1
MySQL 8
Adapter MariaDB
============================================================ */

const globalForPrisma = globalThis as unknown as {
prisma: PrismaClient | undefined;
};

/* ============================================================
ADAPTER MYSQL
============================================================ */

const adapter = new PrismaMariaDb({
host: process.env.DATABASE_HOST || "localhost",
port: Number(process.env.DATABASE_PORT || "3306"),
user: process.env.DATABASE_USER || "root",
password: process.env.DATABASE_PASSWORD || "",
database: process.env.DATABASE_NAME || "pac",
connectionLimit: 5,
});

/* ============================================================
CLIENTE PRISMA
============================================================ */

export const prisma =
globalForPrisma.prisma ??
new PrismaClient({
adapter,
});

/* ============================================================
SINGLETON EM DESENVOLVIMENTO
============================================================ */

if (process.env.NODE_ENV !== "production") {
globalForPrisma.prisma = prisma;
}
