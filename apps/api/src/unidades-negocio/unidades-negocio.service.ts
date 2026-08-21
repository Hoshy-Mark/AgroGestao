import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CriarUnidadeNegocioDto } from "./dto/criar-unidade-negocio.dto.js";
import type { EscolherFornecedorDto } from "./dto/escolher-fornecedor.dto.js";
import type { RenovarLoteDto } from "./dto/renovar-lote.dto.js";

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
        lotes: { where: { ativo: true } },
        fornecedorRacao: true,
        contratos: { where: { ativo: true }, include: { cliente: true } },
        /// total de lotes ja alojados (ativos + inativos) — >1 indica que o
        /// plantel ja foi renovado ao menos uma vez (Domain Bible §2.3),
        /// usado pelo Codex pra desbloquear esse conceito sem precisar de
        /// um log de eventos separado.
        _count: { select: { lotes: true } },
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

  /**
   * Renova o plantel (Domain Bible secao 2.3): desativa o(s) lote(s) ativo(s)
   * da unidade e aloja um novo, do zero (RECRIA). O historico do lote antigo
   * fica preservado — so deixa de contar como "o lote atual" da unidade.
   */
  async renovarLote(unidadeId: string, dto: RenovarLoteDto) {
    return this.prisma.$transaction(async (tx) => {
      await tx.lote.updateMany({
        where: { unidadeNegocioId: unidadeId, ativo: true },
        data: { ativo: false },
      });

      return tx.lote.create({
        data: {
          unidadeNegocioId: unidadeId,
          linhagem: dto.linhagem,
          quantidadeAvesAlojadas: dto.quantidadeAvesAlojadas,
          quantidadeAvesVivas: dto.quantidadeAvesAlojadas,
          idadeDias: 0,
          ativo: true,
        },
      });
    });
  }
}
