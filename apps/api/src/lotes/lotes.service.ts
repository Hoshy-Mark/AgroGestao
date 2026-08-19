import { Injectable } from "@nestjs/common";
import type { EstadoEmpresa, Linhagem, LoteProducao } from "@agrogestao/domain";
import { PrismaService } from "../prisma/prisma.service.js";
import { aplicarTickLote } from "./lote-tick.js";
import type { CriarLoteDto } from "./dto/criar-lote.dto.js";
import type { AvancarDiaDto } from "./dto/avancar-dia.dto.js";

/** Usado apenas enquanto a unidade nao escolheu um Fornecedor de racao (GDD secao 11.2). */
const PRECO_KG_RACAO_PADRAO = 2.5;

@Injectable()
export class LotesService {
  constructor(private readonly prisma: PrismaService) {}

  criar(dto: CriarLoteDto) {
    return this.prisma.lote.create({
      data: {
        unidadeNegocioId: dto.unidadeNegocioId,
        linhagem: dto.linhagem,
        quantidadeAvesAlojadas: dto.quantidadeAvesAlojadas,
        quantidadeAvesVivas: dto.quantidadeAvesAlojadas,
        idadeDias: dto.idadeDiasInicial ?? 0,
      },
    });
  }

  buscarPorId(id: string) {
    return this.prisma.lote.findUniqueOrThrow({ where: { id } });
  }

  /**
   * Roda um dia do MotorPostura sobre o lote e propaga o resultado
   * financeiro para o caixa da empresa dona da UnidadeNegocio, tudo numa
   * transacao (lote e empresa avancam o dia juntos ou nao avancam).
   */
  async avancarDia(loteId: string, mercado: AvancarDiaDto) {
    const loteDb = await this.prisma.lote.findUniqueOrThrow({
      where: { id: loteId },
      include: {
        unidadeNegocio: { include: { empresa: true, fornecedorRacao: true } },
      },
    });
    const empresaDb = loteDb.unidadeNegocio.empresa;

    const loteDominio: LoteProducao = {
      id: loteDb.id,
      unidadeNegocioId: loteDb.unidadeNegocioId,
      linhagem: loteDb.linhagem as Linhagem,
      quantidadeAvesAlojadas: loteDb.quantidadeAvesAlojadas,
      quantidadeAvesVivas: loteDb.quantidadeAvesVivas,
      idadeDias: loteDb.idadeDias,
    };
    const empresaEstado: EstadoEmpresa = {
      caixa: empresaDb.caixa,
      divida: empresaDb.divida,
      limiteCredito: empresaDb.limiteCredito,
      reputacao: empresaDb.reputacao,
      conhecimento: empresaDb.conhecimento,
      diaAtual: empresaDb.diaAtual,
    };

    // O preco de racao vem do Fornecedor escolhido pela unidade (GDD secao
    // 11.2); so cai no valor de referencia se o jogador ainda nao escolheu
    // nenhum, ou se quem chamou o endpoint sobrescreveu explicitamente.
    const precoKgRacao =
      mercado.precoKgRacao ??
      loteDb.unidadeNegocio.fornecedorRacao?.precoKgRacao ??
      PRECO_KG_RACAO_PADRAO;

    const {
      lote: loteAtualizado,
      empresaEstado: empresaAtualizada,
      resultado,
    } = aplicarTickLote(loteDominio, empresaEstado, { ...mercado, precoKgRacao });

    const [loteSalvo, empresaSalva] = await this.prisma.$transaction([
      this.prisma.lote.update({
        where: { id: loteId },
        data: {
          quantidadeAvesVivas: loteAtualizado.quantidadeAvesVivas,
          idadeDias: loteAtualizado.idadeDias,
        },
      }),
      this.prisma.empresa.update({
        where: { id: empresaDb.id },
        data: {
          caixa: empresaAtualizada.caixa,
          diaAtual: empresaAtualizada.diaAtual,
        },
      }),
      this.prisma.historicoProducao.create({
        data: {
          loteId,
          dia: empresaEstado.diaAtual,
          estagio: resultado.estagio,
          ovosProduzidos: resultado.ovosProduzidos,
          racaoConsumidaKg: resultado.racaoConsumidaKg,
          custoRacao: resultado.custoRacao,
          receitaBruta: resultado.receitaBruta,
          funrural: resultado.funrural,
          custoMaoDeObra: resultado.custoMaoDeObra,
          resultado: resultado.resultado,
        },
      }),
    ]);

    return { lote: loteSalvo, empresa: empresaSalva, resultado };
  }
}
