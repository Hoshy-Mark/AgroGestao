import { Body, Controller, Post } from "@nestjs/common";
import { ContratosService } from "./contratos.service.js";
import { CriarContratoDto } from "./dto/criar-contrato.dto.js";

@Controller("contratos")
export class ContratosController {
  constructor(private readonly contratosService: ContratosService) {}

  @Post()
  fecharContrato(@Body() dto: CriarContratoDto) {
    return this.contratosService.fecharContrato(dto);
  }
}
