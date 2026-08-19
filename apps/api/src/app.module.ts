import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { EmpresasModule } from "./empresas/empresas.module.js";
import { UnidadesNegocioModule } from "./unidades-negocio/unidades-negocio.module.js";
import { LotesModule } from "./lotes/lotes.module.js";
import { FornecedoresModule } from "./fornecedores/fornecedores.module.js";

@Module({
  imports: [
    PrismaModule,
    EmpresasModule,
    UnidadesNegocioModule,
    LotesModule,
    FornecedoresModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
