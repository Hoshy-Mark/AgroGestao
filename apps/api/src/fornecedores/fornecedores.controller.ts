import { Controller, Get } from "@nestjs/common";
import { FornecedoresService } from "./fornecedores.service.js";

@Controller("fornecedores")
export class FornecedoresController {
  constructor(private readonly fornecedoresService: FornecedoresService) {}

  @Get()
  listar() {
    return this.fornecedoresService.listar();
  }
}
