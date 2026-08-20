-- CreateTable
CREATE TABLE "DocumentoFiscal" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "serie" INTEGER NOT NULL DEFAULT 1,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EMITIDO',
    "dataEmissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emitenteId" TEXT NOT NULL,
    "destinatarioId" TEXT NOT NULL,
    "itens" JSONB NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "chaveFicticia" TEXT NOT NULL,
    "transacaoId" TEXT NOT NULL,
    "contratoId" TEXT,
    "loteId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoFiscal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentoFiscal_empresaId_tipo_idx" ON "DocumentoFiscal"("empresaId", "tipo");

-- CreateIndex
CREATE INDEX "DocumentoFiscal_empresaId_dataEmissao_idx" ON "DocumentoFiscal"("empresaId", "dataEmissao");
