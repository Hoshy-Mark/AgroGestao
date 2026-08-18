/**
 * Perecibilidade e armazenamento de ovos (Domain Bible secao 21): o
 * Estoque de ovos tem prazo de validade comercial, referenciado em ~30
 * dias a partir da postura. A classificacao efetiva degrada linearmente
 * ate esse limite; depois disso, o lote e uma perda total.
 */
export const PRAZO_MAXIMO_ESTOQUE_DIAS = 30;

export interface LoteEstoqueOvos {
  id: string;
  duzias: number;
  diasEmEstoque: number;
}

/**
 * Fator de qualidade (1 = recem-coletado, 0 = no limite antes da perda),
 * usado para degradar o preco de venda efetivo enquanto o lote permanece
 * em estoque.
 */
export function fatorQualidadeEstoque(diasEmEstoque: number): number {
  if (diasEmEstoque <= 0) return 1;
  if (diasEmEstoque >= PRAZO_MAXIMO_ESTOQUE_DIAS) return 0;
  return 1 - diasEmEstoque / PRAZO_MAXIMO_ESTOQUE_DIAS;
}

/**
 * Avanca um dia no estoque. Retorna `null` quando o lote ultrapassa o
 * prazo maximo — representa a perda total (baixa do Estoque).
 */
export function avancarDiaEstoqueOvos(
  lote: LoteEstoqueOvos
): LoteEstoqueOvos | null {
  const diasEmEstoque = lote.diasEmEstoque + 1;
  if (diasEmEstoque > PRAZO_MAXIMO_ESTOQUE_DIAS) return null;
  return { ...lote, diasEmEstoque };
}
