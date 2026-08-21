import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type { EstadoEmpresa, Linhagem, LoteProducao } from "@agrogestao/domain";
import { PrismaService } from "../prisma/prisma.service.js";
import { DocumentosFiscaisService } from "../documentos-fiscais/documentos-fiscais.service.js";
import { clamp } from "../common/numero.util.js";
import { aplicarTickLote } from "./lote-tick.js";
import type { CriarLoteDto } from "./dto/criar-lote.dto.js";
import type { AvancarDiaDto } from "./dto/avancar-dia.dto.js";

/** Identifica uma venda/compra sem cliente/fornecedor formal (Domain Bible secao 10, "canal spot"). */
const MERCADO_SPOT_ID = "mercado-spot";

/** Usado apenas enquanto a unidade nao escolheu um Fornecedor de racao (GDD secao 11.2). */
const PRECO_KG_RACAO_PADRAO = 2.5;
/** Usado apenas enquanto a unidade nao fechou nenhum Contrato de venda (Domain Bible secao 15). */
const PRECO_MEDIO_DUZIA_PADRAO = 4.5;

/**
 * Reputacao e relacionamento sao "o mundo lembra" (GDD Pilar 6/secao 14):
 * reagem ao resultado do dia e a manter um contrato ativo, nao ficam
 * parados desde a criacao da empresa. Perder reputacao e mais rapido que
 * ganhar — confianca e dificil de construir, facil de perder.
 */
const REPUTACAO_GANHO_DIA_POSITIVO = 1;
const REPUTACAO_PERDA_DIA_NEGATIVO = 2;
const CLIENTE_RELACIONAMENTO_GANHO_DIA = 1;
const CLIENTE_CONFIANCA_GANHO_DIA = 0.5;

@Injectable()
export class LotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentosFiscais: DocumentosFiscaisService
  ) {}

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

  /** Historico completo do lote (nao limitado aos ultimos 30 dias como o da empresa) — base pra conversao alimentar do ciclo inteiro. */
  buscarHistorico(loteId: string) {
    return this.prisma.historicoProducao.findMany({
      where: { loteId },
      orderBy: { dia: "asc" },
    });
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
        unidadeNegocio: {
          include: {
            empresa: true,
            fornecedorRacao: true,
            contratos: { where: { ativo: true }, take: 1, include: { cliente: true } },
          },
        },
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

    const contratoAtivo = loteDb.unidadeNegocio.contratos[0];
    const fornecedorAtivo = loteDb.unidadeNegocio.fornecedorRacao;

    // Preco de racao vem do Fornecedor escolhido (GDD secao 11.2); preco de
    // venda vem do Contrato ativo (Domain Bible secao 15). Ambos so caem no
    // valor de referencia se o jogador ainda nao decidiu, ou se quem chamou
    // o endpoint sobrescreveu explicitamente.
    const precoKgRacao =
      mercado.precoKgRacao ?? fornecedorAtivo?.precoKgRacao ?? PRECO_KG_RACAO_PADRAO;
    const precoMedioDuzia =
      mercado.precoMedioDuzia ?? contratoAtivo?.precoUnitario ?? PRECO_MEDIO_DUZIA_PADRAO;

    const {
      lote: loteAtualizado,
      empresaEstado: empresaAtualizada,
      resultado,
    } = aplicarTickLote(loteDominio, empresaEstado, {
      ...mercado,
      precoKgRacao,
      precoMedioDuzia,
    });

    // Reputacao e relacionamento "o mundo lembra" (GDD Pilar 6/secao 14):
    // resultado positivo constroi reputacao devagar, negativo derruba mais
    // rapido; manter um contrato ativo constroi relacionamento/confianca
    // com aquele cliente especifico, dia apos dia.
    const reputacaoAtualizada = clamp(
      empresaDb.reputacao +
        (resultado.resultado >= 0 ? REPUTACAO_GANHO_DIA_POSITIVO : -REPUTACAO_PERDA_DIA_NEGATIVO),
      0,
      100
    );

    const operacoes: Prisma.PrismaPromise<unknown>[] = [
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
          reputacao: reputacaoAtualizada,
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
    ];

    if (contratoAtivo) {
      operacoes.push(
        this.prisma.cliente.update({
          where: { id: contratoAtivo.clienteId },
          data: {
            relacionamento: clamp(
              contratoAtivo.cliente.relacionamento + CLIENTE_RELACIONAMENTO_GANHO_DIA,
              0,
              100
            ),
            confianca: clamp(contratoAtivo.cliente.confianca + CLIENTE_CONFIANCA_GANHO_DIA, 0, 100),
          },
        })
      );
    }

    const [loteSalvo, empresaSalva] = await this.prisma.$transaction(operacoes);

    // Documentos fiscais (Domain Bible secoes 17-18) so depois que o tick
    // persiste com sucesso — nao emite nota pra uma transacao que nao
    // aconteceu de verdade. Decorativos (sem validade fiscal), entao nao
    // entram no $transaction acima: se falharem, o dia ja avancou mesmo
    // assim, so a trilha de auditoria fica incompleta por esse tick.
    const transacaoId = `${loteId}:dia-${empresaEstado.diaAtual}`;

    if (resultado.racaoConsumidaKg > 0) {
      await this.documentosFiscais.emitir({
        empresaId: empresaDb.id,
        tipo: "NOTA_ENTRADA_COMPRA",
        emitenteId: fornecedorAtivo?.id ?? MERCADO_SPOT_ID,
        destinatarioId: empresaDb.id,
        itens: [
          {
            descricao: "Ração",
            quantidade: resultado.racaoConsumidaKg,
            unidade: "kg",
            valorUnitario: precoKgRacao,
            valorTotal: resultado.custoRacao,
          },
        ],
        transacaoId,
        loteId,
      });
    }

    if (resultado.ovosProduzidos > 0) {
      await this.documentosFiscais.emitir({
        empresaId: empresaDb.id,
        tipo: "NOTA_VENDA_DIRETA",
        emitenteId: empresaDb.id,
        destinatarioId: contratoAtivo?.clienteId ?? MERCADO_SPOT_ID,
        itens: [
          {
            descricao: "Ovos (produção do dia)",
            quantidade: resultado.ovosProduzidos / 12,
            unidade: "duzia",
            valorUnitario: precoMedioDuzia,
            valorTotal: resultado.receitaBruta,
          },
        ],
        transacaoId,
        contratoId: contratoAtivo?.id,
        loteId,
      });
    }

    return { lote: loteSalvo, empresa: empresaSalva, resultado };
  }
}
