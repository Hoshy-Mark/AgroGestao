import type { ItemDocumentoFiscal, TipoDocumentoFiscal } from "@agrogestao/domain";

/**
 * Reimplementa o formato de chave decorativa de
 * packages/domain/src/fiscal/documentoFiscal.ts (a funcao original nao e
 * exportada — e um detalhe privado da fabrica em memoria daquele modulo).
 * Mesmo formato, mesmo proposito: autenticidade visual, sem validade fiscal.
 */
export function gerarChaveFicticia(
  numero: number,
  serie: number,
  tipo: TipoDocumentoFiscal
): string {
  const base = `${serie}`.padStart(3, "0") + `${numero}`.padStart(9, "0");
  const hashTipo = tipo.length.toString().padStart(2, "0");
  return `FIC-${base}-${hashTipo}-0000`;
}

export function calcularValorTotal(itens: ItemDocumentoFiscal[]): number {
  return itens.reduce((soma, item) => soma + item.valorTotal, 0);
}
