import { listarDocumentos, type TipoDocumentoFiscalApi } from "@/lib/api";
import { carregarEmpresaAtual } from "@/lib/empresa";
import { EmConstrucao } from "@/components/EmConstrucao";
import styles from "./page.module.css";

const formatoMoedaPrecisa = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const TIPO_LABEL: Record<TipoDocumentoFiscalApi, string> = {
  NOTA_ENTRADA_COMPRA: "Compra",
  NOTA_VENDA_DIRETA: "Venda direta",
  NOTA_REMESSA_CONSIGNACAO: "Remessa (consignação)",
  NOTA_VENDA_CONSIGNACAO: "Venda (consignação)",
  NOTA_DEVOLUCAO_CONSIGNACAO: "Devolução (consignação)",
  NOTA_ACERTO_INTEGRACAO: "Acerto (integração)",
  NOTA_DESCARTE_LOTE: "Descarte de lote",
  NOTA_TRANSPORTE: "Transporte",
};

/** Compra = dinheiro saindo do caixa; o resto = dinheiro entrando. */
const TOM_ENTRADA: ReadonlySet<TipoDocumentoFiscalApi> = new Set(["NOTA_ENTRADA_COMPRA"]);

export default async function RelatoriosPage() {
  const { empresaCompleta, conectadoApi } = await carregarEmpresaAtual();

  if (!conectadoApi || !empresaCompleta) {
    return (
      <EmConstrucao
        titulo="Relatórios"
        texto="Assuma uma propriedade de verdade (com a API conectada) para ver a trilha de documentos — em modo demo não há transações reais."
      />
    );
  }

  const documentos = await listarDocumentos(empresaCompleta.id);

  return (
    <section>
      <div className={styles.header}>
        <h2 className={styles.titulo}>Documentos fiscais</h2>
        <p className={styles.subtitulo}>
          Cada compra de ração e venda de ovos gera um documento — a trilha
          de auditoria da operação (Domain Bible §17-18). Números e chaves
          são fictícios, sem validade fiscal real.
        </p>
      </div>

      <div className={styles.tabelaWrap}>
        {documentos.length === 0 ? (
          <div className={styles.vazio}>
            Nenhum documento ainda — clique em &quot;Avançar 1 dia&quot; na
            Visão Geral pra gerar a primeira compra/venda.
          </div>
        ) : (
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Nº</th>
                <th>Tipo</th>
                <th>Data</th>
                <th>Item</th>
                <th style={{ textAlign: "right" }}>Valor</th>
                <th>Chave</th>
              </tr>
            </thead>
            <tbody>
              {documentos.map((doc) => {
                const tom = TOM_ENTRADA.has(doc.tipo) ? "entrada" : "saida";
                return (
                  <tr key={doc.id}>
                    <td className={styles.numero}>#{doc.numero}</td>
                    <td>
                      <span className={styles.tipoBadge} data-tom={tom}>
                        {TIPO_LABEL[doc.tipo]}
                      </span>
                    </td>
                    <td>{formatoData.format(new Date(doc.dataEmissao))}</td>
                    <td>{doc.itens.map((item) => item.descricao).join(", ")}</td>
                    <td className={styles.valor} data-tom={tom}>
                      {tom === "entrada" ? "− " : "+ "}
                      {formatoMoedaPrecisa.format(doc.valorTotal)}
                    </td>
                    <td className={styles.chave}>{doc.chaveFicticia}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
