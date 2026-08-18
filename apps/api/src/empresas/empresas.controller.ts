import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { EmpresasService } from "./empresas.service.js";
import { CriarEmpresaDto } from "./dto/criar-empresa.dto.js";

@Controller("empresas")
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post()
  criar(@Body() dto: CriarEmpresaDto) {
    return this.empresasService.criar(dto);
  }

  @Get()
  listar() {
    return this.empresasService.listar();
  }

  @Get(":id")
  buscarPorId(@Param("id") id: string) {
    return this.empresasService.buscarPorId(id);
  }
}
