import { describe, expect, it } from "vitest";
import {
  avancarDiaEmpresa,
  criarEmpresaHerdada,
  simularDiaProducao,
  type LoteProducao,
} from "../src/index.js";

const loteBase: LoteProducao = {
  id: "lote-1",
  unidadeNegocioId: "unidade-1",
  fase: "producao",
  quantidadeAves: 1500,
  taxaPostura: 0.85,
  consumoRacaoKgAveDia: 0.11,
  iniciadoEm: "2026-01-01",
};

describe("simularDiaProducao", () => {
  it("calcula producao, custo e receita do dia a partir do lote e do mercado", () => {
    const resultado = simularDiaProducao(loteBase, {
      precoKgRacao: 1.8,
      precoMedioOvo: 0.35,
    });

    expect(resultado.ovosProduzidos).toBeCloseTo(1275); // 1500 * 0.85
    expect(resultado.racaoConsumidaKg).toBeCloseTo(165); // 1500 * 0.11
    expect(resultado.custoRacao).toBeCloseTo(297); // 165 * 1.8
    expect(resultado.receita).toBeCloseTo(446.25); // 1275 * 0.35
    expect(resultado.resultado).toBeCloseTo(149.25);
  });

  it("nao produz ovos quando o lote ainda esta em recria", () => {
    const resultado = simularDiaProducao(
      { ...loteBase, fase: "recria" },
      { precoKgRacao: 1.8, precoMedioOvo: 0.35 }
    );

    expect(resultado.ovosProduzidos).toBe(0);
    expect(resultado.racaoConsumidaKg).toBeGreaterThan(0); // ainda consome racao
  });
});

describe("avancarDiaEmpresa", () => {
  it("soma o resultado do dia ao caixa e avanca o contador de dias", () => {
    const empresa = criarEmpresaHerdada({
      id: "empresa-1",
      nome: "Granja Herdada",
      caixaInicial: 8000,
      dividaHerdada: 15000,
      fundadaEm: "2026-01-01",
    });

    const resultadoDia = simularDiaProducao(loteBase, {
      precoKgRacao: 1.8,
      precoMedioOvo: 0.35,
    });

    const novoEstado = avancarDiaEmpresa(empresa.estado, resultadoDia);

    expect(novoEstado.caixa).toBeCloseTo(8000 + resultadoDia.resultado);
    expect(novoEstado.diaAtual).toBe(1);
  });
});
