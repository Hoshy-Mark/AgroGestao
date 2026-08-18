import { Module } from "@nestjs/common";
import { UnidadesNegocioController } from "./unidades-negocio.controller.js";
import { UnidadesNegocioService } from "./unidades-negocio.service.js";

@Module({
  controllers: [UnidadesNegocioController],
  providers: [UnidadesNegocioService],
  exports: [UnidadesNegocioService],
})
export class UnidadesNegocioModule {}
