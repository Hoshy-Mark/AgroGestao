/**
 * Sazonalidade de preco de venda (Domain Bible secao 19): o preco do ovo no
 * mercado brasileiro tem padrao sazonal reconhecido (Cepea/Esalq) — pico em
 * torno da Quaresma/Pascoa (fev-abr), vale em dez/jan. Pontos medios fixos
 * por mes, sem variacao estocastica ano a ano (simplificacao do MVP).
 */
const MULTIPLICADOR_SAZONAL_POR_MES: Record<number, number> = {
  1: 0.875, // vale sazonal (ferias escolares, menor poder de compra)
  2: 1.05, // inicio da alta (Quaresma + volta as aulas)
  3: 1.2, // pico (Quaresma/Pascoa)
  4: 1.1, // Pascoa + cauda da Quaresma
  5: 1,
  6: 1,
  7: 1,
  8: 1,
  9: 1,
  10: 1,
  11: 1,
  12: 0.875, // vale sazonal (queda de consumo, alta oferta pre-ano novo)
};

/** Multiplicador sazonal sobre `precoMedioDuzia`, dado o mes (1-12). */
export function multiplicadorSazonal(mes: number): number {
  return MULTIPLICADOR_SAZONAL_POR_MES[mes] ?? 1;
}
