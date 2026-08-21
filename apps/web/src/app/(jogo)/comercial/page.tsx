import { listarClientes } from "@/lib/api";
import { carregarEmpresaAtual } from "@/lib/empresa";
import { EmConstrucao } from "@/components/EmConstrucao";
import { fecharContratoComCliente } from "./actions";
import styles from "./page.module.css";

const formatoMoedaPrecisa = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

export default async function ComercialPage() {
  const { empresaCompleta, conectadoApi } = await carregarEmpresaAtual();

  if (!conectadoApi || !empresaCompleta) {
    return (
      <EmConstrucao
        titulo="Comercial"
        texto="Assuma uma propriedade de verdade (com a API conectada) para fechar contrato com um cliente — em modo demo não há uma unidade real para negociar."
      />
    );
  }

  const unidade = empresaCompleta.unidadesNegocio?.[0];
  if (!unidade) {
    return (
      <EmConstrucao
        titulo="Comercial"
        texto="Você ainda não tem nenhuma unidade de negócio — o contrato de venda se fecha por UnidadeNegocio."
      />
    );
  }

  const clientes = await listarClientes();
  const contratoAtivo = unidade.contratos?.[0];

  return (
    <section>
      <div className={styles.header}>
        <h2 className={styles.titulo}>Clientes</h2>
        <p className={styles.subtitulo}>
          Feche um contrato de venda direta para a {unidade.nome}. Cliente
          de volume paga menos por dúzia; cliente pequeno paga mais mas
          compra bem menos — os dois são caminhos válidos (Domain Bible §15).
        </p>
      </div>

      <div className={styles.lista}>
        {clientes.map((cliente) => {
          const selecionado = contratoAtivo?.clienteId === cliente.id;
          const fecharComEste = fecharContratoComCliente.bind(
            null,
            unidade.id,
            cliente.id
          );

          return (
            <div
              key={cliente.id}
              className={styles.card}
              data-selecionado={selecionado}
            >
              <div className={styles.cardTopo}>
                <span className={styles.nome}>{cliente.nome}</span>
                {selecionado && <span className={styles.badge}>Contrato atual</span>}
              </div>

              <div className={styles.specs}>
                <div>
                  <span className={styles.specLabel}>Preço</span>
                  <span className={styles.specValor}>
                    {formatoMoedaPrecisa.format(cliente.precoOfertadoDuzia)}/dúzia
                  </span>
                </div>
                <div>
                  <span className={styles.specLabel}>Volume mensal</span>
                  <span className={styles.specValor}>
                    {cliente.volumeMensalDuzias.toLocaleString("pt-BR")} dz
                  </span>
                </div>
                <div>
                  <span className={styles.specLabel}>Recebimento</span>
                  <span className={styles.specValor}>{cliente.prazoMedioDias} dias</span>
                </div>
                <div>
                  <span className={styles.specLabel}>Relacionamento</span>
                  <span className={styles.specValor}>{Math.round(cliente.relacionamento)}/100</span>
                </div>
                <div>
                  <span className={styles.specLabel}>Confiança</span>
                  <span className={styles.specValor}>{Math.round(cliente.confianca)}/100</span>
                </div>
              </div>

              {!selecionado && (
                <form action={fecharComEste}>
                  <button className={styles.botao} type="submit">
                    Fechar contrato
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
