import {
  calcularConversaoAlimentar,
  estagioPorIdadeSemanas,
  idadeEmSemanas,
  type EstagioLote,
} from "@agrogestao/domain";
import { buscarHistoricoLote } from "@/lib/api";
import { carregarEmpresaAtual } from "@/lib/empresa";
import { EmConstrucao } from "@/components/EmConstrucao";
import { renovarPlantel } from "./actions";
import styles from "./page.module.css";

const ESTAGIO_LABEL: Record<EstagioLote, string> = {
  RECRIA: "Recria",
  INICIO_POSTURA: "Início de postura",
  PRODUCAO: "Produção",
  DECLINIO: "Declínio",
  DESCARTE: "Descarte",
};

const LINHAGEM_LABEL: Record<"branca" | "vermelha", string> = {
  branca: "Branca",
  vermelha: "Vermelha",
};

const ESTAGIOS_PARA_RENOVAR: ReadonlySet<EstagioLote> = new Set(["DECLINIO", "DESCARTE"]);

export default async function NegociosPage() {
  const { empresaCompleta, conectadoApi } = await carregarEmpresaAtual();

  if (!conectadoApi || !empresaCompleta) {
    return (
      <EmConstrucao
        titulo="Negócios"
        texto="Assuma uma propriedade de verdade (com a API conectada) para ver o detalhe do seu lote — em modo demo não há dado real."
      />
    );
  }

  const unidade = empresaCompleta.unidadesNegocio?.[0];
  const lote = unidade?.lotes?.[0];

  if (!unidade || !lote) {
    return (
      <EmConstrucao
        titulo="Negócios"
        texto="Você ainda não tem nenhum lote alojado — o detalhe da unidade aparece aqui assim que houver produção rodando."
      />
    );
  }

  const idadeSemanas = idadeEmSemanas(lote.idadeDias);
  const estagio = estagioPorIdadeSemanas(idadeSemanas);
  const mortas = lote.quantidadeAvesAlojadas - lote.quantidadeAvesVivas;

  const historico = await buscarHistoricoLote(lote.id).catch(() => []);
  const racaoAcumuladaKg = historico.reduce((s, r) => s + r.racaoConsumidaKg, 0);
  const ovosAcumulados = historico.reduce((s, r) => s + r.ovosProduzidos, 0);
  const conversaoAlimentar = calcularConversaoAlimentar(racaoAcumuladaKg, ovosAcumulados);

  const podeRenovar = ESTAGIOS_PARA_RENOVAR.has(estagio);
  const renovarComUnidade = renovarPlantel.bind(null, unidade.id);

  return (
    <section>
      <div className={styles.header}>
        <h2 className={styles.titulo}>Negócios</h2>
        <p className={styles.subtitulo}>
          Detalhe da unidade e do lote em produção — mortalidade acumulada e
          conversão alimentar são as métricas centrais de desempenho (Domain
          Bible §3.2, §4).
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTopo}>
          <span className={styles.nome}>{unidade.nome}</span>
          <span className={styles.fase}>{ESTAGIO_LABEL[estagio]}</span>
        </div>

        <div className={styles.barTrack}>
          <div
            className={styles.barFill}
            style={{
              width: `${Math.min(100, (lote.quantidadeAvesVivas / unidade.capacidadeAves) * 100)}%`,
            }}
          />
        </div>
        <div className={styles.capacidade}>
          {lote.quantidadeAvesVivas.toLocaleString("pt-BR")} /{" "}
          {unidade.capacidadeAves.toLocaleString("pt-BR")} aves
        </div>

        <div className={styles.specs}>
          <div>
            <span className={styles.specLabel}>Linhagem</span>
            <span className={styles.specValor}>{LINHAGEM_LABEL[lote.linhagem]}</span>
          </div>
          <div>
            <span className={styles.specLabel}>Idade</span>
            <span className={styles.specValor}>{idadeSemanas.toFixed(0)} semanas</span>
          </div>
          <div>
            <span className={styles.specLabel}>Alojadas</span>
            <span className={styles.specValor}>
              {lote.quantidadeAvesAlojadas.toLocaleString("pt-BR")}
            </span>
          </div>
          <div>
            <span className={styles.specLabel}>Mortalidade acumulada</span>
            <span className={styles.specValor}>
              {mortas.toLocaleString("pt-BR")} (
              {((mortas / lote.quantidadeAvesAlojadas) * 100).toFixed(1)}%)
            </span>
          </div>
          <div>
            <span className={styles.specLabel}>Conversão alimentar</span>
            <span className={styles.specValor}>
              {conversaoAlimentar !== null
                ? `${conversaoAlimentar.toFixed(2)} kg/dz`
                : "— (ainda sem postura)"}
            </span>
          </div>
        </div>

        {podeRenovar && (
          <div className={styles.alertaRenovar}>
            <div className={styles.alertaTitulo}>
              {estagio === "DESCARTE" ? "Lote no fim do ciclo" : "Produção em declínio"}
            </div>
            <p className={styles.alertaTexto}>
              {estagio === "DESCARTE"
                ? "Esse lote já passou do ponto de compensar o custo de manutenção. Renovar agora recomeça a produção do zero (recria); esperar mais só reduz a receita sem reduzir o custo."
                : "A produção começou a cair — Domain Bible §2.3: você pode renovar agora ou esperar mais um pouco e arriscar um período com receita menor."}
            </p>
            <form action={renovarComUnidade}>
              <button className={styles.botao} type="submit">
                Renovar plantel
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
