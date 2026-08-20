import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { EmpresasModule } from "./empresas/empresas.module.js";
import { UnidadesNegocioModule } from "./unidades-negocio/unidades-negocio.module.js";
import { LotesModule } from "./lotes/lotes.module.js";
import { FornecedoresModule } from "./fornecedores/fornecedores.module.js";
import { ClientesModule } from "./clientes/clientes.module.js";
import { ContratosModule } from "./contratos/contratos.module.js";

@Module({
  imports: [
    PrismaModule,
    EmpresasModule,
    UnidadesNegocioModule,
    LotesModule,
    FornecedoresModule,
    ClientesModule,
    ContratosModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
