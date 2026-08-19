-- AlterTable
ALTER TABLE "UnidadeNegocio" ADD COLUMN     "fornecedorRacaoId" TEXT;

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "precoKgRacao" DOUBLE PRECISION NOT NULL,
    "prazoPagamentoDias" INTEGER NOT NULL,
    "prazoEntregaDias" INTEGER NOT NULL,
    "confiabilidade" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UnidadeNegocio" ADD CONSTRAINT "UnidadeNegocio_fornecedorRacaoId_fkey" FOREIGN KEY ("fornecedorRacaoId") REFERENCES "Fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
