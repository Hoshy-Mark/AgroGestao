import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CriarUnidadeNegocioDto } from "./dto/criar-unidade-negocio.dto.js";
import type { EscolherFornecedorDto } from "./dto/escolher-fornecedor.dto.js";

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
      include: {
        lotes: true,
        fornecedorRacao: true,
        contratos: { where: { ativo: true }, include: { cliente: true } },
      },
    });
  }

  /** Troca o fornecedor de ração da unidade (GDD secao 11.2) — decisão comercial recorrente do início de jogo. */
  escolherFornecedorRacao(unidadeId: string, dto: EscolherFornecedorDto) {
    return this.prisma.unidadeNegocio.update({
      where: { id: unidadeId },
      data: { fornecedorRacaoId: dto.fornecedorId },
      include: { fornecedorRacao: true },
    });
  }
}
