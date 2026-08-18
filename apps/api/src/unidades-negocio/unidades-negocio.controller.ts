import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { UnidadesNegocioService } from "./unidades-negocio.service.js";
import { CriarUnidadeNegocioDto } from "./dto/criar-unidade-negocio.dto.js";

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
}
