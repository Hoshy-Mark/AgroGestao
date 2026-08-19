export interface RegistroHistorico {
  receitaBruta: number;
  custoRacao: number;
  funrural: number;
  custoMaoDeObra: number;
  resultado: number;
}

export interface HistoricoAgregado {
  receitaTotal: number;
  custoTotal: number;
  resultadoTotal: number;
  diasComRegistro: number;
}

/**
 * Soma um conjunto de registros de HistoricoProducao num resumo de periodo
 * (base do DRE, GDD secao 21.4). Pura, sem Prisma — o servico so busca as
 * linhas e chama isto.
 */
export function agregarHistorico(registros: RegistroHistorico[]): HistoricoAgregado {
  return registros.reduce<HistoricoAgregado>(
    (acumulado, registro) => ({
      receitaTotal: acumulado.receitaTotal + registro.receitaBruta,
      custoTotal:
        acumulado.custoTotal +
        registro.custoRacao +
        registro.funrural +
        registro.custoMaoDeObra,
      resultadoTotal: acumulado.resultadoTotal + registro.resultado,
      diasComRegistro: acumulado.diasComRegistro + 1,
    }),
    { receitaTotal: 0, custoTotal: 0, resultadoTotal: 0, diasComRegistro: 0 }
  );
}
