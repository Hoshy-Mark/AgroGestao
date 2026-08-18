import {
  avancarDiaEmpresa,
  simularDiaLote,
  type EstadoEmpresa,
  type LoteProducao,
  type ParametrosMercadoDia,
  type ResultadoDiaLote,
} from "@agrogestao/domain";

export interface TickLoteResultado {
  lote: LoteProducao;
  empresaEstado: EstadoEmpresa;
  resultado: ResultadoDiaLote;
}

/**
 * Orquestra um tick diario: roda o MotorPostura sobre o lote e propaga o
 * resultado financeiro para o estado da empresa. Funcao pura, sem I/O —
 * o servico (lotes.service.ts) e quem le/grava no Prisma em volta dela.
 * Testavel sem banco, coerente com o principio de modelagem do GDD secao 23
 * ("regras de negocio devem ser testaveis isoladamente").
 */
export function aplicarTickLote(
  lote: LoteProducao,
  empresaEstado: EstadoEmpresa,
  mercado: ParametrosMercadoDia
): TickLoteResultado {
  const { lote: loteAtualizado, resultado } = simularDiaLote(lote, mercado);
  const empresaAtualizada = avancarDiaEmpresa(empresaEstado, resultado);

  return {
    lote: loteAtualizado,
    empresaEstado: empresaAtualizada,
    resultado,
  };
}
