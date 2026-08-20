import { Module } from "@nestjs/common";
import { LotesController } from "./lotes.controller.js";
import { LotesService } from "./lotes.service.js";
import { DocumentosFiscaisModule } from "../documentos-fiscais/documentos-fiscais.module.js";

@Module({
  imports: [DocumentosFiscaisModule],
  controllers: [LotesController],
  providers: [LotesService],
  exports: [LotesService],
})
export class LotesModule {}
