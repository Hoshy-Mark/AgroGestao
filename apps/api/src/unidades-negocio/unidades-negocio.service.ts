import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CriarUnidadeNegocioDto } from "./dto/criar-unidade-negocio.dto.js";

@Injectable()
export class UnidadesNegocioService {
  constructor(private readonly prisma: PrismaService) {}

  criar(dto: CriarUnidadeNegocioDto) {
    return this.prisma.unidadeNegocio.create({
      data: {
        empresaId: dto.empresaId,
        nome: dto.nome,
        tipo: dto.tipo,
        capacidadeAves: dto.capacidadeAves,
      },
    });
  }

  buscarPorId(id: string) {
    return this.prisma.unidadeNegocio.findUniqueOrThrow({
      where: { id },
      include: { lotes: true },
    });
  }
}
