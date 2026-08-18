import { Controller, Get } from "@nestjs/common";
import { criarEmpresaHerdada } from "@agrogestao/domain";

@Controller()
export class AppController {
  @Get("health")
  health() {
    return { status: "ok", fase: "0 - fundacao" };
  }

  @Get("empresa/exemplo")
  empresaExemplo() {
    // Placeholder ate existir persistencia via Prisma (docs/GAME_ECONOMY.md secao 1).
    return criarEmpresaHerdada({
      id: "empresa-exemplo",
      nome: "Granja Herdada",
      caixaInicial: 8000,
      dividaHerdada: 15000,
      fundadaEm: new Date().toISOString(),
    });
  }
}
