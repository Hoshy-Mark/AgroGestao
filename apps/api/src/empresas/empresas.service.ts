import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { criarEmpresaHerdada } from "@agrogestao/domain";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CriarEmpresaDto } from "./dto/criar-empresa.dto.js";

@Injectable()
export class EmpresasService {
  constructor(private readonly prisma: PrismaService) {}

  /** Cria a empresa a partir da herenca inicial (GDD secao 5), via packages/domain, e persiste. */
  criar(dto: CriarEmpresaDto) {
    const empresa = criarEmpresaHerdada({
      id: randomUUID(),
      nome: dto.nome,
      caixaInicial: dto.caixaInicial,
      dividaHerdada: dto.dividaHerdada,
      fundadaEm: new Date().toISOString(),
    });

    return this.prisma.empresa.create({
      data: {
        id: empresa.id,
        nome: empresa.nome,
        fundadaEm: new Date(empresa.fundadaEm),
        caixa: empresa.estado.caixa,
        divida: empresa.estado.divida,
        limiteCredito: empresa.estado.limiteCredito,
        reputacao: empresa.estado.reputacao,
        conhecimento: empresa.estado.conhecimento,
        diaAtual: empresa.estado.diaAtual,
      },
    });
  }

  listar() {
    return this.prisma.empresa.findMany({
      include: { unidadesNegocio: true },
    });
  }

  buscarPorId(id: string) {
    return this.prisma.empresa.findUniqueOrThrow({
      where: { id },
      include: { unidadesNegocio: { include: { lotes: true } } },
    });
  }
}
