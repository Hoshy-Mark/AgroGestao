import type { EstadoEmpresa, LoteProducao } from "@agrogestao/domain";
import { aplicarTickLote } from "./lote-tick.js";

const lote: LoteProducao = {
  id: "lote-1",
  unidadeNegocioId: "unidade-1",
  linhagem: "branca",
  quantidadeAvesAlojadas: 1500,
  quantidadeAvesVivas: 1500,
  idadeDias: 27 * 7, // pico de postura
};

const empresaEstado: EstadoEmpresa = {
  caixa: 8000,
  divida: 15000,
  limiteCredito: 0,
  reputacao: 40,
  conhecimento: 0,
  diaAtual: 0,
};

describe("aplicarTickLote", () => {
  it("propaga o resultado financeiro do lote para o caixa da empresa e avanca o dia", () => {
    const { lote: loteAtualizado, empresaEstado: empresaAtualizada, resultado } =
      aplicarTickLote(lote, empresaEstado, {
        precoKgRacao: 1.8,
        precoMedioDuzia: 4.2,
      });

    expect(loteAtualizado.idadeDias).toBe(lote.idadeDias + 1);
    expect(empresaAtualizada.diaAtual).toBe(1);
    expect(empresaAtualizada.caixa).toBeCloseTo(
      empresaEstado.caixa + resultado.resultado
    );
    // demais campos do estado nao mudam num tick de producao
    expect(empresaAtualizada.divida).toBe(empresaEstado.divida);
    expect(empresaAtualizada.reputacao).toBe(empresaEstado.reputacao);
  });

  it("aplica sazonalidade e custo de mao de obra quando informados", () => {
    const { resultado: base } = aplicarTickLote(lote, empresaEstado, {
      precoKgRacao: 1.8,
      precoMedioDuzia: 4.2,
    });
    const { resultado: comMercado } = aplicarTickLote(lote, empresaEstado, {
      precoKgRacao: 1.8,
      precoMedioDuzia: 4.2,
      mes: 3, // pico sazonal
      custoMaoDeObraMensal: 3000,
    });

    expect(comMercado.custoMaoDeObra).toBeCloseTo(100); // 3000 / 30
    expect(comMercado.receitaBruta).toBeGreaterThan(base.receitaBruta);
  });

  it("nao muta o lote nem o estado da empresa recebidos como entrada", () => {
    const loteOriginal = { ...lote };
    const empresaOriginal = { ...empresaEstado };

    aplicarTickLote(lote, empresaEstado, {
      precoKgRacao: 1.8,
      precoMedioDuzia: 4.2,
    });

    expect(lote).toEqual(loteOriginal);
    expect(empresaEstado).toEqual(empresaOriginal);
  });
});
