/**
 * Vertical de lancamento: Avicultura de Postura (GDD secao 10, Domain Bible secoes 1-6).
 * LoteProducao representa um grupo de aves de mesma idade/linhagem.
 */
export type Linhagem = "branca" | "vermelha";

/**
 * Estagio biologico do lote (Domain Bible secao 2.1). Cria e recria sao
 * fundidas numa unica fase RECRIA, conforme a simplificacao ja registrada
 * no documento.
 */
export type EstagioLote =
  | "RECRIA"
  | "INICIO_POSTURA"
  | "PRODUCAO"
  | "DECLINIO"
  | "DESCARTE";

export interface LoteProducao {
  id: string;
  unidadeNegocioId: string;
  linhagem: Linhagem;
  /** Numero de aves alojadas no inicio do lote — base para o calculo de viabilidade (Domain Bible 7.3). */
  quantidadeAvesAlojadas: number;
  quantidadeAvesVivas: number;
  idadeDias: number;
}

export interface UnidadeNegocio {
  id: string;
  empresaId: string;
  nome: string;
  tipo: "matriz" | "poedeira";
  capacidadeAves: number;
  loteAtualId: string | null;
}

/**
 * Estagio do lote a partir da idade em semanas (Domain Bible secao 2.1/2.3).
 * Limites de referencia, a calibrar por linhagem em fases futuras.
 */
export function estagioPorIdadeSemanas(idadeSemanas: number): EstagioLote {
  if (idadeSemanas < 17) return "RECRIA";
  if (idadeSemanas < 24) return "INICIO_POSTURA";
  if (idadeSemanas < 60) return "PRODUCAO";
  if (idadeSemanas < 90) return "DECLINIO";
  return "DESCARTE";
}

export function idadeEmSemanas(idadeDias: number): number {
  return idadeDias / 7;
}
