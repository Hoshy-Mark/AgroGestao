import { describe, expect, it } from "vitest";
import {
  avancarDiaEmpresa,
  calcularConversaoAlimentar,
  criarEmpresaHerdada,
  simularDiaLote,
  type LoteProducao,
} from "../src/index.js";

const loteEmProducao: LoteProducao = {
  id: "lote-1",
  unidadeNegocioId: "unidade-1",
  linhagem: "branca",
  quantidadeAvesAlojadas: 1500,
  quantidadeAvesVivas: 1500,
  idadeDias: 27 * 7, // 27 semanas: dentro do pico de postura (24-30 sem.)
};

const mercado = { precoKgRacao: 1.8, precoMedioDuzia: 4.2 };

describe("simularDiaLote", () => {
  it("calcula estagio, mortalidade, producao e resultado financeiro do dia", () => {
    const { lote, resultado } = simularDiaLote(loteEmProducao, mercado);

    expect(resultado.estagio).toBe("PRODUCAO");
    expect(resultado.avesMortasHoje).toBeGreaterThanOrEqual(0);
    expect(resultado.avesVivasFimDia).toBe(1500 - resultado.avesMortasHoje);
    expect(resultado.ovosProduzidos).toBeGreaterThan(0);
    expect(resultado.racaoConsumidaKg).toBeCloseTo(
      resultado.avesVivasFimDia * 0.112
    );
    expect(resultado.funrural).toBeCloseTo(resultado.receitaBruta * 0.013);
    expect(resultado.receitaLiquida).toBeCloseTo(
      resultado.receitaBruta - resultado.funrural
    );
    expect(resultado.resultado).toBeCloseTo(
      resultado.receitaLiquida - resultado.custoRacao
    );

    // envelhece um dia e reflete a mortalidade aplicada
    expect(lote.idadeDias).toBe(loteEmProducao.idadeDias + 1);
    expect(lote.quantidadeAvesVivas).toBe(resultado.avesVivasFimDia);
  });

  it("nao produz ovos enquanto o lote esta em recria (< 17 semanas)", () => {
    const loteJovem: LoteProducao = { ...loteEmProducao, idadeDias: 10 * 7 };
    const { resultado } = simularDiaLote(loteJovem, mercado);

    expect(resultado.estagio).toBe("RECRIA");
    expect(resultado.ovosProduzidos).toBe(0);
    expect(resultado.racaoConsumidaKg).toBeGreaterThan(0); // ainda consome racao
    expect(resultado.resultado).toBeLessThan(0); // so custo, sem receita
  });

  it("aplica o multiplicador sazonal sobre a receita quando o mes e informado", () => {
    const { resultado: semSazonalidade } = simularDiaLote(loteEmProducao, mercado);
    const { resultado: marco } = simularDiaLote(loteEmProducao, {
      ...mercado,
      mes: 3, // pico sazonal (Domain Bible secao 19)
    });

    expect(marco.receitaBruta).toBeGreaterThan(semSazonalidade.receitaBruta);
  });

  it("desconta o custo de mao de obra diario quando informado", () => {
    const { resultado: semCusto } = simularDiaLote(loteEmProducao, mercado);
    const { resultado: comCusto } = simularDiaLote(loteEmProducao, {
      ...mercado,
      custoMaoDeObraMensal: 3000,
    });

    expect(comCusto.custoMaoDeObra).toBeCloseTo(100); // 3000 / 30
    expect(comCusto.resultado).toBeCloseTo(semCusto.resultado - 100);
  });

  it("aplica uma taxa de postura menor no inicio da postura do que no pico", () => {
    const loteInicioPostura: LoteProducao = {
      ...loteEmProducao,
      idadeDias: 18 * 7,
    };
    const { resultado: inicio } = simularDiaLote(loteInicioPostura, mercado);
    const { resultado: pico } = simularDiaLote(loteEmProducao, mercado);

    const taxaInicio = inicio.ovosProduzidos / inicio.avesVivasFimDia;
    const taxaPico = pico.ovosProduzidos / pico.avesVivasFimDia;

    expect(taxaInicio).toBeLessThan(taxaPico);
  });
});

describe("calcularConversaoAlimentar", () => {
  it("retorna kg de racao por duzia produzida", () => {
    expect(calcularConversaoAlimentar(135, 120)).toBeCloseTo(13.5); // 120 ovos = 10 duzias
  });

  it("retorna null quando nao ha duzias produzidas ainda (ex.: lote em recria)", () => {
    expect(calcularConversaoAlimentar(50, 0)).toBeNull();
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

    const { resultado } = simularDiaLote(loteEmProducao, mercado);
    const novoEstado = avancarDiaEmpresa(empresa.estado, resultado);

    expect(novoEstado.caixa).toBeCloseTo(8000 + resultado.resultado);
    expect(novoEstado.diaAtual).toBe(1);
  });
});
