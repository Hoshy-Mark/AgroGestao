import { buscarHistoricoMensal } from "@/lib/api";
import { carregarEmpresaAtual } from "@/lib/empresa";
import { EmConstrucao } from "@/components/EmConstrucao";
import styles from "./page.module.css";

const formatoMoedaPrecisa = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

function sinalDe(valor: number): "positivo" | "negativo" | undefined {
  if (valor > 0) return "positivo";
  if (valor < 0) return "negativo";
  return undefined;
}

export default async function FinanceiroPage() {
  const { empresaCompleta, conectadoApi } = await carregarEmpresaAtual();

  if (!conectadoApi || !empresaCompleta) {
    return (
      <EmConstrucao
        titulo="Financeiro"
        texto="Assuma uma propriedade de verdade (com a API conectada) para ver o DRE — em modo demo não há histórico real."
      />
    );
  }

  const historico = await buscarHistoricoMensal(empresaCompleta.id).catch(() => null);
  const registros = historico?.registros ?? [];

  if (registros.length === 0) {
    return (
      <EmConstrucao
        titulo="Financeiro"
        texto={`Nenhum dia avançado ainda para a ${empresaCompleta.nome} — o DRE aparece aqui assim que você clicar em "Avançar 1 dia" na Visão Geral.`}
      />
    );
  }

  const receitaBrutaTotal = registros.reduce((s, r) => s + r.receitaBruta, 0);
  const funruralTotal = registros.reduce((s, r) => s + r.funrural, 0);
  const custoRacaoTotal = registros.reduce((s, r) => s + r.custoRacao, 0);
  const custoMaoDeObraTotal = registros.reduce((s, r) => s + r.custoMaoDeObra, 0);
  const receitaLiquidaTotal = receitaBrutaTotal - funruralTotal;
  const resultadoTotal = registros.reduce((s, r) => s + r.resultado, 0);

  return (
    <section>
      <div className={styles.header}>
        <h2 className={styles.titulo}>Demonstrativo de Resultado</h2>
        <p className={styles.subtitulo}>
          Últimos {registros.length} dia{registros.length === 1 ? "" : "s"}{" "}
          simulados avançados (GDD §21.4) — não é um mês de calendário real,
          é a janela de dias que o histórico de produção guarda.
        </p>
      </div>

      <div className={styles.dre}>
        <div className={styles.dreLinha}>
          <span className={styles.dreRotulo}>Receita bruta</span>
          <span className={styles.dreValor} data-sinal="positivo">
            {formatoMoedaPrecisa.format(receitaBrutaTotal)}
          </span>
        </div>
        <div className={styles.dreLinha}>
          <span className={styles.dreRotulo}>(−) Funrural</span>
          <span className={styles.dreValor} data-sinal="negativo">
            {formatoMoedaPrecisa.format(funruralTotal)}
          </span>
        </div>
        <div className={styles.dreLinha} data-enfase="total">
          <span className={styles.dreRotulo}>= Receita líquida</span>
          <span className={styles.dreValor}>
            {formatoMoedaPrecisa.format(receitaLiquidaTotal)}
          </span>
        </div>
        <div className={styles.dreLinha}>
          <span className={styles.dreRotulo}>(−) Ração</span>
          <span className={styles.dreValor} data-sinal="negativo">
            {formatoMoedaPrecisa.format(custoRacaoTotal)}
          </span>
        </div>
        <div className={styles.dreLinha}>
          <span className={styles.dreRotulo}>(−) Mão de obra</span>
          <span className={styles.dreValor} data-sinal="negativo">
            {formatoMoedaPrecisa.format(custoMaoDeObraTotal)}
          </span>
        </div>
        <div className={styles.dreLinha} data-enfase="total">
          <span className={styles.dreRotulo}>= Resultado do período</span>
          <span className={styles.dreValor} data-sinal={sinalDe(resultadoTotal)}>
            {formatoMoedaPrecisa.format(resultadoTotal)}
          </span>
        </div>
      </div>

      <div className={styles.tabelaWrap}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Dia</th>
              <th>Ovos</th>
              <th>Receita bruta</th>
              <th>Funrural</th>
              <th>Ração</th>
              <th>Mão de obra</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {[...registros]
              .sort((a, b) => b.dia - a.dia)
              .map((registro) => (
                <tr key={registro.id}>
                  <td>{registro.dia}</td>
                  <td>{Math.round(registro.ovosProduzidos)}</td>
                  <td>{formatoMoedaPrecisa.format(registro.receitaBruta)}</td>
                  <td data-sinal="negativo">
                    {formatoMoedaPrecisa.format(registro.funrural)}
                  </td>
                  <td data-sinal="negativo">
                    {formatoMoedaPrecisa.format(registro.custoRacao)}
                  </td>
                  <td data-sinal="negativo">
                    {formatoMoedaPrecisa.format(registro.custoMaoDeObra)}
                  </td>
                  <td data-sinal={sinalDe(registro.resultado)}>
                    {formatoMoedaPrecisa.format(registro.resultado)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
