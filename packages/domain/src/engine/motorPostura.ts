import type { EstadoEmpresa, EstagioLote, LoteProducao } from "../entities/index.js";
import { estagioPorIdadeSemanas, idadeEmSemanas } from "../entities/index.js";
import { taxaPosturaPorSemana } from "./curvaPostura.js";
import { multiplicadorSazonal } from "./sazonalidade.js";

/**
 * Tick diario do MotorPostura (GDD secao 10), com parametros consolidados
 * na Domain Bible secao 23 (v0.3). Numeros ainda sao ponto de partida para
 * calibracao, nao valores finais — ver docs/DOMAIN_BIBLE.md secao 23/24.
 */

/** Consumo diario por ave (kg), por estagio do lote — Domain Bible secao 3.1. */
const CONSUMO_DIARIO_KG: Record<EstagioLote, number> = {
  // 112g/ave/dia e o valor de producao, sourced (Domain Bible 3.1). O valor
  // de RECRIA nao vem direto da fonte: e derivado somando as sub-fases da
  // Embrapa (pre-inicial 0,336 + inicial 1,379 + crescimento 1,442 +
  // desenvolvimento 0,791 + pre-postura 1,274 = 5,222 kg) sobre ~126 dias
  // (0-18 semanas) => ~41g/ave/dia. Aproximacao a validar, nao e um numero
  // diario que a fonte declara explicitamente.
  RECRIA: 0.041,
  INICIO_POSTURA: 0.112,
  PRODUCAO: 0.112,
  DECLINIO: 0.112,
  DESCARTE: 0.112,
};

/**
 * Mortalidade diaria base — sourced a partir de Sarcinelli et al. (2007):
 * 8-10% de mortalidade ao longo de toda a fase de producao (72 semanas /
 * 504 dias), distribuida uniformemente: 9% / 504 ≈ 0,0179%/dia. A
 * distribuicao uniforme e uma simplificacao reconhecida (na pratica a
 * mortalidade concentra mais no inicio da postura e no fim do ciclo) —
 * ver Domain Bible secao 4 e secao 24 (pendencias).
 */
const TAXA_MORTALIDADE_DIARIA_BASE = 0.00018;

/** Funrural: 1,2% + 0,1% GILRAT sobre receita bruta, regime com Livro Caixa (Domain Bible 13.3). */
const ALIQUOTA_FUNRURAL_PADRAO = 0.013;

/** Salario CLT de referencia do funcionario herdado (CBO 6233-10), ponto de partida dentro da faixa R$1.800-2.550 (Domain Bible secao 20). */
export const CUSTO_MENSAL_FUNCIONARIO_CLT_PADRAO = 2000;

export interface ParametrosMercadoDia {
  precoKgRacao: number;
  /** Preco de venda por duzia de ovos (a unidade comercial do setor e a caixa de 30 duzias — Domain Bible 5.2). */
  precoMedioDuzia: number;
  /** Sobrescreve a aliquota padrao (ex.: 0,20 no regime simplificado sem Livro Caixa — Domain Bible 13.3). */
  aliquotaFunrural?: number;
  /** Mes do calendario simulado (1-12). Quando informado, aplica o multiplicador sazonal sobre `precoMedioDuzia` (Domain Bible secao 19). */
  mes?: number;
  /**
   * Custo mensal do(s) funcionario(s) CLT, rateado por dia (Domain Bible
   * secao 20). Simplificacao do MVP: fica no tick do lote, nao num nivel
   * de empresa separado — precisa migrar quando houver mais de um lote,
   * para nao contar o custo em dobro.
   */
  custoMaoDeObraMensal?: number;
}

export interface ResultadoDiaLote {
  estagio: EstagioLote;
  avesVivasInicioDia: number;
  avesMortasHoje: number;
  avesVivasFimDia: number;
  ovosProduzidos: number;
  racaoConsumidaKg: number;
  custoRacao: number;
  receitaBruta: number;
  funrural: number;
  receitaLiquida: number;
  custoMaoDeObra: number;
  resultado: number;
}

const ESTAGIOS_EM_POSTURA: ReadonlySet<EstagioLote> = new Set([
  "INICIO_POSTURA",
  "PRODUCAO",
  "DECLINIO",
]);

/**
 * Simula um dia para um lote: envelhece o lote, aplica mortalidade,
 * calcula producao de ovos pela curva de postura e o resultado financeiro
 * do dia (receita liquida de Funrural menos custo de racao).
 */
export function simularDiaLote(
  lote: LoteProducao,
  mercado: ParametrosMercadoDia
): { lote: LoteProducao; resultado: ResultadoDiaLote } {
  const idadeSemanas = idadeEmSemanas(lote.idadeDias);
  const estagio = estagioPorIdadeSemanas(idadeSemanas);

  const avesMortasHoje =
    estagio === "DESCARTE"
      ? 0
      : Math.round(lote.quantidadeAvesVivas * TAXA_MORTALIDADE_DIARIA_BASE);
  const avesVivasFimDia = Math.max(0, lote.quantidadeAvesVivas - avesMortasHoje);

  const taxaPostura = ESTAGIOS_EM_POSTURA.has(estagio)
    ? taxaPosturaPorSemana(idadeSemanas, lote.linhagem)
    : 0;
  const ovosProduzidos = avesVivasFimDia * taxaPostura;

  const racaoConsumidaKg = avesVivasFimDia * CONSUMO_DIARIO_KG[estagio];
  const custoRacao = racaoConsumidaKg * mercado.precoKgRacao;

  const precoDuziaAjustado =
    mercado.precoMedioDuzia * (mercado.mes ? multiplicadorSazonal(mercado.mes) : 1);

  const duziasProduzidas = ovosProduzidos / 12;
  const receitaBruta = duziasProduzidas * precoDuziaAjustado;
  const aliquotaFunrural = mercado.aliquotaFunrural ?? ALIQUOTA_FUNRURAL_PADRAO;
  const funrural = receitaBruta * aliquotaFunrural;
  const receitaLiquida = receitaBruta - funrural;

  const custoMaoDeObra = (mercado.custoMaoDeObraMensal ?? 0) / 30;

  const resultado: ResultadoDiaLote = {
    estagio,
    avesVivasInicioDia: lote.quantidadeAvesVivas,
    avesMortasHoje,
    avesVivasFimDia,
    ovosProduzidos,
    racaoConsumidaKg,
    custoRacao,
    receitaBruta,
    funrural,
    receitaLiquida,
    custoMaoDeObra,
    resultado: receitaLiquida - custoRacao - custoMaoDeObra,
  };

  const loteAtualizado: LoteProducao = {
    ...lote,
    quantidadeAvesVivas: avesVivasFimDia,
    idadeDias: lote.idadeDias + 1,
  };

  return { lote: loteAtualizado, resultado };
}

/**
 * Conversao alimentar acumulada (kg de racao / duzia produzida) — Domain
 * Bible secao 3.2. E uma metrica de periodo, nao de um unico dia: com zero
 * duzias produzidas (lote em RECRIA) o indicador ainda nao existe.
 */
export function calcularConversaoAlimentar(
  racaoKgAcumulada: number,
  ovosAcumulados: number
): number | null {
  const duziasAcumuladas = ovosAcumulados / 12;
  if (duziasAcumuladas <= 0) return null;
  return racaoKgAcumulada / duziasAcumuladas;
}

/** Aplica o resultado financeiro do dia ao estado da empresa e avanca o dia. */
export function avancarDiaEmpresa(
  estado: EstadoEmpresa,
  resultadoDia: ResultadoDiaLote
): EstadoEmpresa {
  return {
    ...estado,
    caixa: estado.caixa + resultadoDia.resultado,
    diaAtual: estado.diaAtual + 1,
  };
}
