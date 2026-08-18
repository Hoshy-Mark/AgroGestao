import { describe, expect, it } from "vitest";
import {
  FabricaDocumentoFiscal,
  NumeradorDocumentoFiscal,
  type ItemDocumentoFiscal,
} from "../src/fiscal/documentoFiscal.js";

const itemOvos: ItemDocumentoFiscal = {
  descricao: "Ovos classe extra (caixa 30dz)",
  quantidade: 10,
  unidade: "caixa30dz",
  valorUnitario: 150,
  valorTotal: 1500,
};

function novaFabrica() {
  return new FabricaDocumentoFiscal(new NumeradorDocumentoFiscal());
}

describe("FabricaDocumentoFiscal", () => {
  it("emite um documento com numero sequencial, chave ficticia e valor total somado dos itens", () => {
    const fabrica = novaFabrica();

    const doc = fabrica.emitir({
      tipo: "NOTA_VENDA_DIRETA",
      emitenteId: "empresa-1",
      destinatarioId: "cliente-1",
      itens: [itemOvos],
      dataEmissao: "2026-01-10",
      referencia: { transacaoId: "contrato-1", contratoId: "contrato-1" },
      gerarId: () => "doc-fixo-1",
    });

    expect(doc.id).toBe("doc-fixo-1");
    expect(doc.numero).toBe(1);
    expect(doc.serie).toBe(1);
    expect(doc.status).toBe("EMITIDO");
    expect(doc.valorTotal).toBe(1500);
    expect(doc.chaveFicticia).toMatch(/^FIC-/);
  });

  it("mantem sequencias independentes por tipo de documento", () => {
    const fabrica = novaFabrica();

    const compra1 = fabrica.emitir({
      tipo: "NOTA_ENTRADA_COMPRA",
      emitenteId: "fornecedor-1",
      destinatarioId: "empresa-1",
      itens: [itemOvos],
      dataEmissao: "2026-01-05",
      referencia: { transacaoId: "pedido-1" },
    });
    const venda1 = fabrica.emitir({
      tipo: "NOTA_VENDA_DIRETA",
      emitenteId: "empresa-1",
      destinatarioId: "cliente-1",
      itens: [itemOvos],
      dataEmissao: "2026-01-10",
      referencia: { transacaoId: "contrato-1" },
    });
    const compra2 = fabrica.emitir({
      tipo: "NOTA_ENTRADA_COMPRA",
      emitenteId: "fornecedor-1",
      destinatarioId: "empresa-1",
      itens: [itemOvos],
      dataEmissao: "2026-01-12",
      referencia: { transacaoId: "pedido-2" },
    });

    expect(compra1.numero).toBe(1);
    expect(venda1.numero).toBe(1); // serie propria do tipo NOTA_VENDA_DIRETA
    expect(compra2.numero).toBe(2);
  });

  it("cancelar preserva o documento original e retorna uma copia com status CANCELADO", () => {
    const fabrica = novaFabrica();
    const doc = fabrica.emitir({
      tipo: "NOTA_DESCARTE_LOTE",
      emitenteId: "empresa-1",
      destinatarioId: "abatedouro-1",
      itens: [itemOvos],
      dataEmissao: "2026-06-01",
      referencia: { transacaoId: "lote-1", loteId: "lote-1" },
    });

    const cancelado = fabrica.cancelar(doc);

    expect(doc.status).toBe("EMITIDO");
    expect(cancelado.status).toBe("CANCELADO");
    expect(cancelado.id).toBe(doc.id);
  });
});
