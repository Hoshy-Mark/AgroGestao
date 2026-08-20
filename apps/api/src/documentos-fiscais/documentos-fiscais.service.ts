import { Injectable } from "@nestjs/common";
import type { ItemDocumentoFiscal, TipoDocumentoFiscal } from "@agrogestao/domain";
import { PrismaService } from "../prisma/prisma.service.js";
import { calcularValorTotal, gerarChaveFicticia } from "./documento-fiscal.util.js";

export interface EmitirDocumentoParams {
  empresaId: string;
  tipo: TipoDocumentoFiscal;
  emitenteId: string;
  destinatarioId: string;
  itens: ItemDocumentoFiscal[];
  transacaoId: string;
  contratoId?: string;
  loteId?: string;
}

/**
 * Persiste documentos fiscais (Domain Bible secoes 17-18). Diferente do
 * NumeradorDocumentoFiscal em memoria de packages/domain (que reseta a cada
 * boot — o proprio dominio documenta isso como limitacao "em producao"),
 * aqui o numero sequencial vem de contar os documentos ja persistidos por
 * empresa+tipo, entao sobrevive a restart.
 */
@Injectable()
export class DocumentosFiscaisService {
  constructor(private readonly prisma: PrismaService) {}

  async emitir(params: EmitirDocumentoParams) {
    const numero =
      (await this.prisma.documentoFiscal.count({
        where: { empresaId: params.empresaId, tipo: params.tipo },
      })) + 1;
    const serie = 1;

    return this.prisma.documentoFiscal.create({
      data: {
        empresaId: params.empresaId,
        numero,
        serie,
        tipo: params.tipo,
        status: "EMITIDO",
        emitenteId: params.emitenteId,
        destinatarioId: params.destinatarioId,
        itens: params.itens as unknown as object,
        valorTotal: calcularValorTotal(params.itens),
        chaveFicticia: gerarChaveFicticia(numero, serie, params.tipo),
        transacaoId: params.transacaoId,
        contratoId: params.contratoId,
        loteId: params.loteId,
      },
    });
  }

  listarPorEmpresa(empresaId: string) {
    return this.prisma.documentoFiscal.findMany({
      where: { empresaId },
      orderBy: { dataEmissao: "desc" },
    });
  }
}
