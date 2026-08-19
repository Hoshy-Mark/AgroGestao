-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "fundadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "caixa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "divida" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "limiteCredito" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reputacao" INTEGER NOT NULL DEFAULT 40,
    "conhecimento" INTEGER NOT NULL DEFAULT 0,
    "diaAtual" INTEGER NOT NULL DEFAULT 0,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadaEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnidadeNegocio" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "capacidadeAves" INTEGER NOT NULL,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnidadeNegocio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lote" (
    "id" TEXT NOT NULL,
    "unidadeNegocioId" TEXT NOT NULL,
    "linhagem" TEXT NOT NULL,
    "quantidadeAvesAlojadas" INTEGER NOT NULL,
    "quantidadeAvesVivas" INTEGER NOT NULL,
    "idadeDias" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UnidadeNegocio" ADD CONSTRAINT "UnidadeNegocio_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_unidadeNegocioId_fkey" FOREIGN KEY ("unidadeNegocioId") REFERENCES "UnidadeNegocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
