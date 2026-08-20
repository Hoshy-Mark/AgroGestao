import { Module } from "@nestjs/common";
import { DocumentosFiscaisService } from "./documentos-fiscais.service.js";

@Module({
  providers: [DocumentosFiscaisService],
  exports: [DocumentosFiscaisService],
})
export class DocumentosFiscaisModule {}
