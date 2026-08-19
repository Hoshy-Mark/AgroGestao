import { agregarHistorico, type RegistroHistorico } from "./historico-agregado.js";

const registro = (overrides: Partial<RegistroHistorico> = {}): RegistroHistorico => ({
  receitaBruta: 100,
  custoRacao: 40,
  funrural: 5,
  custoMaoDeObra: 20,
  resultado: 35,
  ...overrides,
});

describe("agregarHistorico", () => {
  it("retorna zeros para uma lista vazia", () => {
    expect(agregarHistorico([])).toEqual({
      receitaTotal: 0,
      custoTotal: 0,
      resultadoTotal: 0,
      diasComRegistro: 0,
    });
  });

  it("soma receita, custo (racao + funrural + mao de obra) e resultado ao longo dos registros", () => {
    const registros = [registro(), registro({ receitaBruta: 200, custoRacao: 50, resultado: 90 })];

    const agregado = agregarHistorico(registros);

    expect(agregado.receitaTotal).toBe(300);
    expect(agregado.custoTotal).toBe(40 + 5 + 20 + 50 + 5 + 20);
    expect(agregado.resultadoTotal).toBe(125);
    expect(agregado.diasComRegistro).toBe(2);
  });
});
