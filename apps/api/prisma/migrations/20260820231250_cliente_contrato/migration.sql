-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "relacionamento" INTEGER NOT NULL DEFAULT 50,
    "confianca" INTEGER NOT NULL DEFAULT 50,
    "sensibilidadePreco" INTEGER NOT NULL,
    "prazoMedioDias" INTEGER NOT NULL,
    "precoOfertadoDuzia" DOUBLE PRECISION NOT NULL,
    "volumeMensalDuzias" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrato" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "unidadeNegocioId" TEXT NOT NULL,
    "precoUnitario" DOUBLE PRECISION NOT NULL,
    "volumeMensalDuzias" INTEGER NOT NULL,
    "prazoRecebimentoDias" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "iniciadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contrato_unidadeNegocioId_ativo_idx" ON "Contrato"("unidadeNegocioId", "ativo");

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_unidadeNegocioId_fkey" FOREIGN KEY ("unidadeNegocioId") REFERENCES "UnidadeNegocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
