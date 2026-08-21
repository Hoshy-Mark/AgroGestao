/** Restringe um valor a um intervalo [min, max] — usado pelas escalas 0-100 de reputação/relacionamento/confiança (GDD secao 14). */
export function clamp(valor: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valor));
}
