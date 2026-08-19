import { cookies } from "next/headers";
import {
  estagioPorIdadeSemanas,
  idadeEmSemanas,
  type EstagioLote,
} from "@agrogestao/domain";
import type { EmpresaApi, HistoricoMensalApi } from "@/lib/api";
import { buscarHistoricoMensal } from "@/lib/api";
import { carregarEmpresaAtual } from "@/lib/empresa";
import { avancarDia } from "./actions";
import styles from "./page.module.css";

const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const formatoMoedaPrecisa = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const ESTAGIO_LABEL: Record<EstagioLote, string> = {
  RECRIA: "Recria",
  INICIO_POSTURA: "Início de postura",
  PRODUCAO: "Produção",
  DECLINIO: "Declínio",
  DESCARTE: "Descarte",
};

interface NegocioResumo {
  loteId: string | null;
  nome: string;
  fase: string;
  avesVivas: number;
  capacidadeAves: number;
  detalhe: string;
}

interface ResultadoDia {
  estagio: string;
  ovosProduzidos: number;
  racaoConsumidaKg: number;
  custoRacao: number;
  receitaBruta: number;
  funrural: number;
  custoMaoDeObra: number;
  resultado: number;
}

const negociosMock: NegocioResumo[] = [
  {
    loteId: null,
    nome: "Poedeira Comercial",
    fase: "Produção",
    avesVivas: 1500,
    capacidadeAves: 2000,
    detalhe: "Taxa de postura 85% · conversão a apurar",
  },
];

function paraNegocios(empresa: EmpresaApi): NegocioResumo[] {
  const unidades = empresa.unidadesNegocio ?? [];
  if (unidades.length === 0) return [];

  return unidades.map((unidade) => {
    const lote = unidade.lotes?.[0];
    if (!lote) {
      return {
        loteId: null,
        nome: unidade.nome,
        fase: "Sem lote",
        avesVivas: 0,
        capacidadeAves: unidade.capacidadeAves,
        detalhe: "Nenhum lote alojado ainda",
      };
    }

    const idadeSemanas = idadeEmSemanas(lote.idadeDias);
    const estagio = estagioPorIdadeSemanas(idadeSemanas);

    return {
      loteId: lote.id,
      nome: unidade.nome,
      fase: ESTAGIO_LABEL[estagio],
      avesVivas: lote.quantidadeAvesVivas,
      capacidadeAves: unidade.capacidadeAves,
      detalhe: `${idadeSemanas.toFixed(0)} semanas de idade · linhagem ${lote.linhagem}`,
    };
  });
}

async function lerUltimoResultado(): Promise<ResultadoDia | null> {
  const bruto = (await cookies()).get("ultimoResultado")?.value;
  if (!bruto) return null;
  try {
    return JSON.parse(bruto) as ResultadoDia;
  } catch {
    return null;
  }
}

const atividades = [
  { icone: "⚠", texto: "Estoque de ração acaba em 7 dias", severidade: "alerta" as const },
  { icone: "💰", texto: "Parcela do financiamento herdado vence amanhã", severidade: "neutro" as const },
  { icone: "🚚", texto: "Entrega para Mercado São José às 08:00", severidade: "neutro" as const },
  { icone: "📋", texto: "Contrato herdado vence em 12 dias", severidade: "info" as const },
];

export default async function DashboardPage() {
  const [{ empresa, empresaCompleta, conectadoApi }, ultimoResultado] = await Promise.all([
    carregarEmpresaAtual(),
    lerUltimoResultado(),
  ]);

  const negocios = empresaCompleta ? paraNegocios(empresaCompleta) : negociosMock;

  let historico: HistoricoMensalApi | null = null;
  if (conectadoApi && empresaCompleta) {
    // historico e "nice to have": se falhar sozinho, a tela ainda funciona
    // com os totais do periodo em branco, em vez de derrubar o dashboard.
    historico = await buscarHistoricoMensal(empresaCompleta.id).catch(() => null);
  }

  const primeiroLoteId = negocios.find((n) => n.loteId)?.loteId ?? null;
  const avancarDiaComLote = primeiroLoteId ? avancarDia.bind(null, primeiroLoteId) : null;

  const temHistorico = !!historico && historico.diasComRegistro > 0;
  const sufixoPeriodo = historico
    ? `(últ. ${historico.diasComRegistro} dia${historico.diasComRegistro === 1 ? "" : "s"})`
    : "(mês)";

  const kpis = [
    {
      label: `Receita ${sufixoPeriodo}`,
      valor: temHistorico ? formatoMoedaPrecisa.format(historico!.receitaTotal) : "—",
      tom: "neutro" as const,
    },
    {
      label: `Custos ${sufixoPeriodo}`,
      valor: temHistorico ? formatoMoedaPrecisa.format(historico!.custoTotal) : "—",
      tom: "neutro" as const,
    },
    {
      label: `Lucro ${sufixoPeriodo}`,
      valor: temHistorico ? formatoMoedaPrecisa.format(historico!.resultadoTotal) : "—",
      tom: temHistorico && historico!.resultadoTotal < 0 ? ("alerta" as const) : ("neutro" as const),
    },
    { label: "Dívida", valor: formatoMoeda.format(empresa.divida), tom: "alerta" as const },
  ];

  return (
    <>
      <section className={styles.mentorCard}>
        <div className={styles.mentorAvatar}>👴</div>
        <div className={styles.mentorFala}>
          <div className={styles.mentorNome}>Seu Osvaldo · funcionário veterano</div>
          {ultimoResultado ? (
            <p>
              “Fechei o dia: coletamos {Math.round(ultimoResultado.ovosProduzidos)} ovos e
              consumimos {ultimoResultado.racaoConsumidaKg.toFixed(1)} kg de ração
              {ultimoResultado.resultado >= 0
                ? ` — sobrou ${formatoMoedaPrecisa.format(ultimoResultado.resultado)} no caixa.`
                : ` — o caixa saiu ${formatoMoedaPrecisa.format(Math.abs(ultimoResultado.resultado))} no vermelho hoje.`}
              ”
            </p>
          ) : (
            <p>
              “Seu avô sempre comprava a ração da mesma empresa. Quer que eu faça o
              pedido, ou prefere ver se tem coisa melhor no mercado primeiro?”
            </p>
          )}
        </div>
        {avancarDiaComLote ? (
          <form action={avancarDiaComLote}>
            <button className={styles.mentorAcao} type="submit">
              Avançar 1 dia
            </button>
          </form>
        ) : (
          <button className={styles.mentorAcao} type="button" disabled>
            Decidir
          </button>
        )}
      </section>

      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Visão geral</h2>
          <span className={styles.sectionHint}>Como estou?</span>
        </div>
        <div className={styles.kpiGrid}>
          {kpis.map((kpi) => (
            <div key={kpi.label} className={styles.kpiCard} data-tom={kpi.tom}>
              <div className={styles.kpiLabel}>{kpi.label}</div>
              <div className={styles.kpiValor}>{kpi.valor}</div>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.grid2}>
        <section>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Negócios</h2>
            <span className={styles.sectionHint}>O que posso fazer depois?</span>
          </div>
          <div className={styles.negociosStack}>
            {negocios.length === 0 && (
              <div className={styles.negocioDetalhe}>Nenhum negócio ainda.</div>
            )}
            {negocios.map((n) => (
              <div key={n.nome} className={styles.negocioCard}>
                <div className={styles.negocioTopo}>
                  <span className={styles.negocioNome}>{n.nome}</span>
                  <span className={styles.negocioFase}>{n.fase}</span>
                </div>
                {n.capacidadeAves > 0 && (
                  <>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${(n.avesVivas / n.capacidadeAves) * 100}%` }}
                      />
                    </div>
                    <div className={styles.negocioCapacidade}>
                      {n.avesVivas.toLocaleString("pt-BR")} / {n.capacidadeAves.toLocaleString("pt-BR")} aves
                    </div>
                  </>
                )}
                <div className={styles.negocioDetalhe}>{n.detalhe}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Próximas atividades</h2>
            <span className={styles.sectionHint}>O que preciso fazer?</span>
          </div>
          <div className={styles.atividades}>
            {atividades.map((a) => (
              <div
                key={a.texto}
                className={styles.atividade}
                data-severidade={a.severidade}
              >
                <span className={styles.atividadeIcone}>{a.icone}</span>
                <span>{a.texto}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={styles.codexTeaser}>
        <span className={styles.codexIcone}>📖</span>
        <div>
          <div className={styles.codexTitulo}>Novo conceito no Codex</div>
          <div className={styles.codexTexto}>
            Capital de giro — a diferença entre pagar seus fornecedores e receber
            dos seus clientes pode te deixar sem caixa mesmo dando lucro.
          </div>
        </div>
      </section>
    </>
  );
}
