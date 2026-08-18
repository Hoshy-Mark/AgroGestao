import { describe, expect, it } from "vitest";
import {
  avancarDiaEstoqueOvos,
  fatorQualidadeEstoque,
  PRAZO_MAXIMO_ESTOQUE_DIAS,
  type LoteEstoqueOvos,
} from "../src/engine/estoqueOvos.js";

describe("fatorQualidadeEstoque", () => {
  it("comeca em 1 (recem-coletado)", () => {
    expect(fatorQualidadeEstoque(0)).toBe(1);
  });

  it("degrada linearmente ate o limite", () => {
    expect(fatorQualidadeEstoque(15)).toBeCloseTo(0.5);
  });

  it("chega a 0 no limite maximo e nao fica negativo depois dele", () => {
    expect(fatorQualidadeEstoque(PRAZO_MAXIMO_ESTOQUE_DIAS)).toBe(0);
    expect(fatorQualidadeEstoque(PRAZO_MAXIMO_ESTOQUE_DIAS + 10)).toBe(0);
  });
});

describe("avancarDiaEstoqueOvos", () => {
  const lote: LoteEstoqueOvos = { id: "estoque-1", duzias: 100, diasEmEstoque: 0 };

  it("incrementa diasEmEstoque a cada dia", () => {
    const avancado = avancarDiaEstoqueOvos(lote);
    expect(avancado?.diasEmEstoque).toBe(1);
    expect(avancado?.duzias).toBe(100);
  });

  it("retorna null (perda total) ao ultrapassar o prazo maximo", () => {
    const noLimite: LoteEstoqueOvos = {
      ...lote,
      diasEmEstoque: PRAZO_MAXIMO_ESTOQUE_DIAS,
    };
    expect(avancarDiaEstoqueOvos(noLimite)).toBeNull();
  });
});
