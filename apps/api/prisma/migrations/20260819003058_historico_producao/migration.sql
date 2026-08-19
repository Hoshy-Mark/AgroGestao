-- CreateTable
CREATE TABLE "HistoricoProducao" (
    "id" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "dia" INTEGER NOT NULL,
    "estagio" TEXT NOT NULL,
    "ovosProduzidos" DOUBLE PRECISION NOT NULL,
    "racaoConsumidaKg" DOUBLE PRECISION NOT NULL,
    "custoRacao" DOUBLE PRECISION NOT NULL,
    "receitaBruta" DOUBLE PRECISION NOT NULL,
    "funrural" DOUBLE PRECISION NOT NULL,
    "custoMaoDeObra" DOUBLE PRECISION NOT NULL,
    "resultado" DOUBLE PRECISION NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoProducao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HistoricoProducao_loteId_dia_idx" ON "HistoricoProducao"("loteId", "dia");

-- AddForeignKey
ALTER TABLE "HistoricoProducao" ADD CONSTRAINT "HistoricoProducao_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
