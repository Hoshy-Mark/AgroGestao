import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { LotesService } from "./lotes.service.js";
import { CriarLoteDto } from "./dto/criar-lote.dto.js";
import { AvancarDiaDto } from "./dto/avancar-dia.dto.js";

@Controller("lotes")
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

  @Post()
  criar(@Body() dto: CriarLoteDto) {
    return this.lotesService.criar(dto);
  }

  @Get(":id")
  buscarPorId(@Param("id") id: string) {
    return this.lotesService.buscarPorId(id);
  }

  @Post(":id/avancar-dia")
  avancarDia(@Param("id") id: string, @Body() dto: AvancarDiaDto) {
    return this.lotesService.avancarDia(id, dto);
  }
}
