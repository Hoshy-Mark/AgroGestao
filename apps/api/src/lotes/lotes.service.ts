import { Injectable } from "@nestjs/common";
import type { EstadoEmpresa, Linhagem, LoteProducao } from "@agrogestao/domain";
import { PrismaService } from "../prisma/prisma.service.js";
import { DocumentosFiscaisService } from "../documentos-fiscais/documentos-fiscais.service.js";
import { aplicarTickLote } from "./lote-tick.js";
import type { CriarLoteDto } from "./dto/criar-lote.dto.js";
import type { AvancarDiaDto } from "./dto/avancar-dia.dto.js";

/** Identifica uma venda/compra sem cliente/fornecedor formal (Domain Bible secao 10, "canal spot"). */
const MERCADO_SPOT_ID = "mercado-spot";

/** Usado apenas enquanto a unidade nao escolheu um Fornecedor de racao (GDD secao 11.2). */
const PRECO_KG_RACAO_PADRAO = 2.5;
/** Usado apenas enquanto a unidade nao fechou nenhum Contrato de venda (Domain Bible secao 15). */
const PRECO_MEDIO_DUZIA_PADRAO = 4.5;

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
            contratos: { where: { ativo: true }, take: 1 },
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

    // Preco de racao vem do Fornecedor escolhido (GDD secao 11.2); preco de
    // venda vem do Contrato ativo (Domain Bible secao 15). Ambos so caem no
    // valor de referencia se o jogador ainda nao decidiu, ou se quem chamou
    // o endpoint sobrescreveu explicitamente.
    const precoKgRacao =
      mercado.precoKgRacao ??
      loteDb.unidadeNegocio.fornecedorRacao?.precoKgRacao ??
      PRECO_KG_RACAO_PADRAO;
    const precoMedioDuzia =
      mercado.precoMedioDuzia ??
      loteDb.unidadeNegocio.contratos[0]?.precoUnitario ??
      PRECO_MEDIO_DUZIA_PADRAO;

    const {
      lote: loteAtualizado,
      empresaEstado: empresaAtualizada,
      resultado,
    } = aplicarTickLote(loteDominio, empresaEstado, {
      ...mercado,
      precoKgRacao,
      precoMedioDuzia,
    });

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

    // Documentos fiscais (Domain Bible secoes 17-18) so depois que o tick
    // persiste com sucesso — nao emite nota pra uma transacao que nao
    // aconteceu de verdade. Decorativos (sem validade fiscal), entao nao
    // entram no $transaction acima: se falharem, o dia ja avancou mesmo
    // assim, so a trilha de auditoria fica incompleta por esse tick.
    const contratoAtivo = loteDb.unidadeNegocio.contratos[0];
    const fornecedorAtivo = loteDb.unidadeNegocio.fornecedorRacao;
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
