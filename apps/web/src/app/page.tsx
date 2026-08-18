import Link from "next/link";
import { cookies } from "next/headers";
import { criarEmpresaHerdada } from "@agrogestao/domain";
import { ApiError, buscarEmpresa, type EmpresaApi } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import styles from "./page.module.css";

const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

interface EmpresaResumo {
  nome: string;
  diaAtual: number;
  caixa: number;
  divida: number;
  reputacao: number;
  conhecimento: number;
}

// Mock local — garante que a tela sempre renderiza algo coerente mesmo sem
// API/Postgres no ar (README: "sem Postgres so da pra rodar o frontend").
function empresaMock(): EmpresaResumo {
  const empresa = criarEmpresaHerdada({
    id: "empresa-mock",
    nome: "Granja Herdada",
    caixaInicial: 8000,
    dividaHerdada: 15000,
    fundadaEm: new Date().toISOString(),
  });
  return {
    nome: empresa.nome,
    diaAtual: empresa.estado.diaAtual,
    caixa: empresa.estado.caixa,
    divida: empresa.estado.divida,
    reputacao: empresa.estado.reputacao,
    conhecimento: empresa.estado.conhecimento,
  };
}

function paraResumo(empresa: EmpresaApi): EmpresaResumo {
  return {
    nome: empresa.nome,
    diaAtual: empresa.diaAtual,
    caixa: empresa.caixa,
    divida: empresa.divida,
    reputacao: empresa.reputacao,
    conhecimento: empresa.conhecimento,
  };
}

async function carregarEmpresa(): Promise<{
  empresa: EmpresaResumo;
  conectadoApi: boolean;
  erroApi?: string;
}> {
  const empresaId = (await cookies()).get("empresaId")?.value;
  if (!empresaId) {
    return { empresa: empresaMock(), conectadoApi: false };
  }

  try {
    const empresa = await buscarEmpresa(empresaId);
    return { empresa: paraResumo(empresa), conectadoApi: true };
  } catch (erro) {
    const mensagem = erro instanceof ApiError ? erro.message : "erro desconhecido";
    return { empresa: empresaMock(), conectadoApi: false, erroApi: mensagem };
  }
}

const negocios = [
  {
    nome: "Poedeira Comercial",
    fase: "Produção",
    aves: 1500,
    capacidade: 2000,
    detalhe: "Taxa de postura 85% · conversão a apurar",
  },
  {
    nome: "Matriz",
    fase: "Não implantada",
    aves: 0,
    capacidade: 0,
    detalhe: "Requer investimento inicial",
  },
];

const atividades = [
  { icone: "⚠", texto: "Estoque de ração acaba em 7 dias", severidade: "alerta" as const },
  { icone: "💰", texto: "Parcela do financiamento herdado vence amanhã", severidade: "neutro" as const },
  { icone: "🚚", texto: "Entrega para Mercado São José às 08:00", severidade: "neutro" as const },
  { icone: "📋", texto: "Contrato herdado vence em 12 dias", severidade: "info" as const },
];

export default async function DashboardPage() {
  const { empresa, conectadoApi, erroApi } = await carregarEmpresa();

  const kpis = [
    { label: "Receita (mês)", valor: "—", tom: "neutro" as const },
    { label: "Custos (mês)", valor: "—", tom: "neutro" as const },
    { label: "Lucro (mês)", valor: "—", tom: "neutro" as const },
    { label: "Dívida", valor: formatoMoeda.format(empresa.divida), tom: "alerta" as const },
  ];

  return (
    <AppShell
      empresaNome={empresa.nome}
      dia={empresa.diaAtual}
      caixa={formatoMoeda.format(empresa.caixa)}
      reputacao={empresa.reputacao}
      conhecimento={empresa.conhecimento}
    >
      {!conectadoApi && (
        <section className={styles.demoBanner}>
          <span>
            {erroApi
              ? "Modo demo — não foi possível falar com a API (" + erroApi + ")."
              : "Modo demo — dados locais, ainda sem empresa criada na API."}
          </span>
          <Link className={styles.demoBannerLink} href="/nova-empresa">
            Assumir uma propriedade de verdade →
          </Link>
        </section>
      )}

      <section className={styles.mentorCard}>
        <div className={styles.mentorAvatar}>👴</div>
        <div className={styles.mentorFala}>
          <div className={styles.mentorNome}>Seu Osvaldo · funcionário veterano</div>
          <p>
            “Seu avô sempre comprava a ração da mesma empresa. Quer que eu faça o
            pedido, ou prefere ver se tem coisa melhor no mercado primeiro?”
          </p>
        </div>
        <button className={styles.mentorAcao} type="button">
          Decidir
        </button>
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
            {negocios.map((n) => (
              <div key={n.nome} className={styles.negocioCard}>
                <div className={styles.negocioTopo}>
                  <span className={styles.negocioNome}>{n.nome}</span>
                  <span className={styles.negocioFase}>{n.fase}</span>
                </div>
                {n.capacidade > 0 && (
                  <>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${(n.aves / n.capacidade) * 100}%` }}
                      />
                    </div>
                    <div className={styles.negocioCapacidade}>
                      {n.aves.toLocaleString("pt-BR")} / {n.capacidade.toLocaleString("pt-BR")} aves
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
    </AppShell>
  );
}
