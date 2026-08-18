import type { EstadoEmpresa, LoteProducao } from "../entities/index.js";

/**
 * Tick diario do MotorPostura (GDD secao 10).
 *
 * Formulas provisorias — ver docs/GAME_ECONOMY.md secao 5. Nao devem ser
 * consideradas definitivas ate os itens em aberto na Domain Bible serem
 * resolvidos (docs/DOMAIN_BIBLE.md).
 */
export interface ParametrosMercadoDia {
  precoKgRacao: number;
  precoMedioOvo: number;
  /** Ovos por ave-dia quando a taxa de postura e 1.0 (100%). Placeholder ate a Domain Bible fechar o numero real. */
  ovosPorAvePostura?: number;
}

export interface ResultadoDiaProducao {
  ovosProduzidos: number;
  racaoConsumidaKg: number;
  custoRacao: number;
  receita: number;
  resultado: number;
}

const OVOS_POR_AVE_POSTURA_PADRAO = 1;

export function simularDiaProducao(
  lote: LoteProducao,
  mercado: ParametrosMercadoDia
): ResultadoDiaProducao {
  const ovosPorAvePostura =
    mercado.ovosPorAvePostura ?? OVOS_POR_AVE_POSTURA_PADRAO;

  const avesEmPostura =
    lote.fase === "producao" ? lote.quantidadeAves : 0;

  const ovosProduzidos =
    avesEmPostura * lote.taxaPostura * ovosPorAvePostura;

  const racaoConsumidaKg =
    lote.quantidadeAves * lote.consumoRacaoKgAveDia;

  const custoRacao = racaoConsumidaKg * mercado.precoKgRacao;
  const receita = ovosProduzidos * mercado.precoMedioOvo;

  return {
    ovosProduzidos,
    racaoConsumidaKg,
    custoRacao,
    receita,
    resultado: receita - custoRacao,
  };
}

/**
 * Aplica o resultado financeiro do dia ao estado da empresa e avanca o dia.
 * Compras a prazo e contas a receber ainda nao entram aqui (Fase 0 do
 * roadmap cobre so caixa/tempo/ativos/financeiro basico — GDD secao 25).
 */
export function avancarDiaEmpresa(
  estado: EstadoEmpresa,
  resultadoDia: ResultadoDiaProducao
): EstadoEmpresa {
  return {
    ...estado,
    caixa: estado.caixa + resultadoDia.resultado,
    diaAtual: estado.diaAtual + 1,
  };
}
