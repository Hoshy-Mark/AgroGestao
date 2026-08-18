/**
 * Vertical de lancamento: Avicultura de Postura (GDD secao 10).
 * LoteProducao representa um grupo de aves em um mesmo estagio produtivo.
 */
export type FaseProducao = "recria" | "transicao" | "producao";

export interface LoteProducao {
  id: string;
  unidadeNegocioId: string;
  fase: FaseProducao;
  quantidadeAves: number;
  taxaPostura: number; // 0-1, fracao de aves que poe por dia
  consumoRacaoKgAveDia: number; // consumo diario de racao por ave, em kg
  iniciadoEm: string; // ISO date
}

export interface UnidadeNegocio {
  id: string;
  empresaId: string;
  nome: string;
  tipo: "matriz" | "poedeira";
  capacidadeAves: number;
  loteAtualId: string | null;
}
