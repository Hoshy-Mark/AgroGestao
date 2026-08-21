import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { UnidadesNegocioService } from "./unidades-negocio.service.js";
import { CriarUnidadeNegocioDto } from "./dto/criar-unidade-negocio.dto.js";
import { EscolherFornecedorDto } from "./dto/escolher-fornecedor.dto.js";
import { RenovarLoteDto } from "./dto/renovar-lote.dto.js";

@Controller("unidades-negocio")
export class UnidadesNegocioController {
  constructor(private readonly unidadesNegocioService: UnidadesNegocioService) {}

  @Post()
  criar(@Body() dto: CriarUnidadeNegocioDto) {
    return this.unidadesNegocioService.criar(dto);
  }

  @Get(":id")
  buscarPorId(@Param("id") id: string) {
    return this.unidadesNegocioService.buscarPorId(id);
  }

  @Patch(":id/fornecedor-racao")
  escolherFornecedorRacao(@Param("id") id: string, @Body() dto: EscolherFornecedorDto) {
    return this.unidadesNegocioService.escolherFornecedorRacao(id, dto);
  }

  @Post(":id/renovar-lote")
  renovarLote(@Param("id") id: string, @Body() dto: RenovarLoteDto) {
    return this.unidadesNegocioService.renovarLote(id, dto);
  }
}
