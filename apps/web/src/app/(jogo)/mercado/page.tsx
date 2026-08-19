import { listarFornecedores } from "@/lib/api";
import { carregarEmpresaAtual } from "@/lib/empresa";
import { EmConstrucao } from "@/components/EmConstrucao";
import { escolherFornecedor } from "./actions";
import styles from "./page.module.css";

const formatoMoedaPrecisa = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

export default async function MercadoPage() {
  const { empresaCompleta, conectadoApi } = await carregarEmpresaAtual();

  if (!conectadoApi || !empresaCompleta) {
    return (
      <EmConstrucao
        titulo="Mercado"
        texto="Assuma uma propriedade de verdade (com a API conectada) para escolher fornecedor de ração — em modo demo não há uma unidade real para negociar."
      />
    );
  }

  const unidade = empresaCompleta.unidadesNegocio?.[0];
  if (!unidade) {
    return (
      <EmConstrucao
        titulo="Mercado"
        texto="Você ainda não tem nenhuma unidade de negócio — o fornecedor de ração se escolhe por UnidadeNegocio."
      />
    );
  }

  const fornecedores = await listarFornecedores();

  return (
    <section>
      <div className={styles.header}>
        <h2 className={styles.titulo}>Fornecedores de ração</h2>
        <p className={styles.subtitulo}>
          Escolha quem abastece a {unidade.nome}. Preço menor não significa
          custo menor — prazo de entrega e confiabilidade também importam
          (Domain Bible §10/§11).
        </p>
      </div>

      <div className={styles.lista}>
        {fornecedores.map((fornecedor) => {
          const selecionado = unidade.fornecedorRacaoId === fornecedor.id;
          const escolherEste = escolherFornecedor.bind(null, unidade.id, fornecedor.id);

          return (
            <div
              key={fornecedor.id}
              className={styles.card}
              data-selecionado={selecionado}
            >
              <div className={styles.cardTopo}>
                <span className={styles.nome}>{fornecedor.nome}</span>
                {selecionado && <span className={styles.badge}>Atual</span>}
              </div>

              <div className={styles.specs}>
                <div>
                  <span className={styles.specLabel}>Preço</span>
                  <span className={styles.specValor}>
                    {formatoMoedaPrecisa.format(fornecedor.precoKgRacao)}/kg
                  </span>
                </div>
                <div>
                  <span className={styles.specLabel}>Pagamento</span>
                  <span className={styles.specValor}>
                    {fornecedor.prazoPagamentoDias === 0
                      ? "À vista"
                      : `${fornecedor.prazoPagamentoDias} dias`}
                  </span>
                </div>
                <div>
                  <span className={styles.specLabel}>Entrega</span>
                  <span className={styles.specValor}>{fornecedor.prazoEntregaDias} dias</span>
                </div>
                <div>
                  <span className={styles.specLabel}>Confiabilidade</span>
                  <span className={styles.specValor}>{fornecedor.confiabilidade}/100</span>
                </div>
              </div>

              {!selecionado && (
                <form action={escolherEste}>
                  <button className={styles.botao} type="submit">
                    Usar este fornecedor
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
