import type { ItemDocumentoFiscal } from "@agrogestao/domain";
import { calcularValorTotal, gerarChaveFicticia } from "./documento-fiscal.util.js";

describe("gerarChaveFicticia", () => {
  it("monta a chave decorativa a partir de numero, serie e tipo", () => {
    expect(gerarChaveFicticia(1, 1, "NOTA_VENDA_DIRETA")).toBe(
      "FIC-001000000001-17-0000" // "NOTA_VENDA_DIRETA".length === 17
    );
  });

  it("preenche numero e serie com zeros a esquerda", () => {
    const chave = gerarChaveFicticia(42, 2, "NOTA_ENTRADA_COMPRA");
    expect(chave).toMatch(/^FIC-002000000042-\d{2}-0000$/);
  });
});

describe("calcularValorTotal", () => {
  it("soma o valorTotal de todos os itens", () => {
    const itens: ItemDocumentoFiscal[] = [
      { descricao: "Ração", quantidade: 100, unidade: "kg", valorUnitario: 2.5, valorTotal: 250 },
      { descricao: "Ovos", quantidade: 10, unidade: "duzia", valorUnitario: 5, valorTotal: 50 },
    ];
    expect(calcularValorTotal(itens)).toBe(300);
  });

  it("retorna 0 para uma lista vazia", () => {
    expect(calcularValorTotal([])).toBe(0);
  });
});
