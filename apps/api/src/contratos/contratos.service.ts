import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { clamp } from "../common/numero.util.js";
import type { CriarContratoDto } from "./dto/criar-contrato.dto.js";

/** Trocar de cliente custa relacionamento com quem ficou pra tras (GDD secao 14, "o mundo lembra"). */
const CLIENTE_PENALIDADE_TROCA = 8;

@Injectable()
export class ContratosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fecha um contrato de venda direta (Domain Bible secao 15) com o cliente
   * escolhido, usando o perfil de oferta dele (preco/volume/prazo) como
   * termos do contrato. So um contrato ativo por UnidadeNegocio: fechar um
   * novo desativa o anterior — mesma logica de troca do Fornecedor de racao.
   * Se o contrato anterior era com outro cliente, esse cliente perde um
   * pouco de relacionamento — trocar de parceiro comercial tem custo social.
   */
  async fecharContrato(dto: CriarContratoDto) {
    const cliente = await this.prisma.cliente.findUniqueOrThrow({
      where: { id: dto.clienteId },
    });

    return this.prisma.$transaction(async (tx) => {
      const contratoAnterior = await tx.contrato.findFirst({
        where: { unidadeNegocioId: dto.unidadeNegocioId, ativo: true },
        include: { cliente: true },
      });

      await tx.contrato.updateMany({
        where: { unidadeNegocioId: dto.unidadeNegocioId, ativo: true },
        data: { ativo: false },
      });

      if (contratoAnterior && contratoAnterior.clienteId !== dto.clienteId) {
        await tx.cliente.update({
          where: { id: contratoAnterior.clienteId },
          data: {
            relacionamento: clamp(
              contratoAnterior.cliente.relacionamento - CLIENTE_PENALIDADE_TROCA,
              0,
              100
            ),
          },
        });
      }

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
