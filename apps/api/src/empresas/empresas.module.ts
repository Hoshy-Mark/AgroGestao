import { Module } from "@nestjs/common";
import { EmpresasController } from "./empresas.controller.js";
import { EmpresasService } from "./empresas.service.js";
import { DocumentosFiscaisModule } from "../documentos-fiscais/documentos-fiscais.module.js";

@Module({
  imports: [DocumentosFiscaisModule],
  controllers: [EmpresasController],
  providers: [EmpresasService],
  exports: [EmpresasService],
})
export class EmpresasModule {}
