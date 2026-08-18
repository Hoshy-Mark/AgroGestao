import type { Linhagem } from "../entities/index.js";

/**
 * Curva de postura por semana de idade (Domain Bible secao 2.2): fracao de
 * aves vivas que poe por dia, interpolada linearmente entre os pontos de
 * referencia documentados (inicio de postura 17-18 sem., pico 24-30 sem.
 * a 90-95%+, plato 45-60 sem., declinio ate o descarte em ~90 sem.).
 *
 * Duas curvas (branca/vermelha) porque a Domain Bible registra metas de
 * conversao alimentar diferentes por linhagem (secao 3.2) — o pico de
 * postura segue a mesma logica de linhagens leves vs. semipesadas.
 */
interface PontoCurva {
  semana: number;
  taxa: number;
}

const CURVA_BRANCA: PontoCurva[] = [
  { semana: 16, taxa: 0 },
  { semana: 17, taxa: 0.05 },
  { semana: 18, taxa: 0.1 },
  { semana: 20, taxa: 0.5 },
  { semana: 24, taxa: 0.9 },
  { semana: 30, taxa: 0.95 },
  { semana: 52, taxa: 0.88 },
  { semana: 60, taxa: 0.8 },
  { semana: 90, taxa: 0.1 },
];

const CURVA_VERMELHA: PontoCurva[] = [
  { semana: 16, taxa: 0 },
  { semana: 17, taxa: 0.05 },
  { semana: 18, taxa: 0.1 },
  { semana: 20, taxa: 0.45 },
  { semana: 24, taxa: 0.85 },
  { semana: 30, taxa: 0.9 },
  { semana: 52, taxa: 0.83 },
  { semana: 60, taxa: 0.75 },
  { semana: 90, taxa: 0.1 },
];

function curvaPorLinhagem(linhagem: Linhagem): PontoCurva[] {
  return linhagem === "branca" ? CURVA_BRANCA : CURVA_VERMELHA;
}

function interpolar(pontos: PontoCurva[], semana: number): number {
  const primeiro = pontos[0]!;
  const ultimo = pontos[pontos.length - 1]!;

  if (semana <= primeiro.semana) return primeiro.taxa;
  if (semana >= ultimo.semana) return ultimo.taxa;

  for (let i = 0; i < pontos.length - 1; i++) {
    const atual = pontos[i]!;
    const proximo = pontos[i + 1]!;
    if (semana >= atual.semana && semana <= proximo.semana) {
      const progresso =
        (semana - atual.semana) / (proximo.semana - atual.semana);
      return atual.taxa + (proximo.taxa - atual.taxa) * progresso;
    }
  }

  return ultimo.taxa;
}

/** Fracao (0-1) de aves em postura no dia, dada a idade em semanas e a linhagem. */
export function taxaPosturaPorSemana(
  idadeSemanas: number,
  linhagem: Linhagem
): number {
  return interpolar(curvaPorLinhagem(linhagem), idadeSemanas);
}
