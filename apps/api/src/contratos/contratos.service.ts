import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CriarContratoDto } from "./dto/criar-contrato.dto.js";

@Injectable()
export class ContratosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fecha um contrato de venda direta (Domain Bible secao 15) com o cliente
   * escolhido, usando o perfil de oferta dele (preco/volume/prazo) como
   * termos do contrato. So um contrato ativo por UnidadeNegocio: fechar um
   * novo desativa o anterior — mesma logica de troca do Fornecedor de racao.
   */
  async fecharContrato(dto: CriarContratoDto) {
    const cliente = await this.prisma.cliente.findUniqueOrThrow({
      where: { id: dto.clienteId },
    });

    return this.prisma.$transaction(async (tx) => {
      await tx.contrato.updateMany({
        where: { unidadeNegocioId: dto.unidadeNegocioId, ativo: true },
        data: { ativo: false },
      });

      return tx.contrato.create({
        data: {
          clienteId: dto.clienteId,
          unidadeNegocioId: dto.unidadeNegocioId,
          precoUnitario: cliente.precoOfertadoDuzia,
          volumeMensalDuzias: cliente.volumeMensalDuzias,
          prazoRecebimentoDias: cliente.prazoMedioDias,
          ativo: true,
        },
        include: { cliente: true },
      });
    });
  }
}
