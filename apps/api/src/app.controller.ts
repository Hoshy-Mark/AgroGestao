import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("health")
  health() {
    return { status: "ok", fase: "1 - vertical slice (empresas/unidades-negocio/lotes)" };
  }
}
