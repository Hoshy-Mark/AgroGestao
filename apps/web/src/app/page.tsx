import { criarEmpresaHerdada } from "@agrogestao/domain";
import styles from "./page.module.css";

// Placeholder ate a tela conversar com a API (apps/api). Por enquanto usa o
// mesmo motor de dominio para garantir que o estado inicial bate com o
// que o backend vai gerar (docs/GAME_ECONOMY.md secao 1).
const empresa = criarEmpresaHerdada({
  id: "empresa-exemplo",
  nome: "Granja Herdada",
  caixaInicial: 8000,
  dividaHerdada: 15000,
  fundadaEm: new Date().toISOString(),
});

const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export default function DashboardPage() {
  return (
    <main className={styles.phone}>
      <header className={styles.header}>
        <span className={styles.empresaNome}>{empresa.nome}</span>
        <span className={styles.caixa}>
          {formatoMoeda.format(empresa.estado.caixa)}
        </span>
      </header>
      <div className={styles.subheader}>
        <span>Conhecimento {empresa.estado.conhecimento}</span>
        <span>Dia {empresa.estado.diaAtual}</span>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>Visão geral</div>
        <div className={styles.visaoGeral}>
          <div className={styles.metrica}>
            <div className={styles.metricaLabel}>Receita</div>
            <div className={styles.metricaValor}>—</div>
          </div>
          <div className={styles.metrica}>
            <div className={styles.metricaLabel}>Custos</div>
            <div className={styles.metricaValor}>—</div>
          </div>
          <div className={styles.metrica}>
            <div className={styles.metricaLabel}>Lucro</div>
            <div className={styles.metricaValor}>—</div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>Negócios</div>
        <div className={styles.negocios}>
          <div className={styles.negocioCard}>
            <div className={styles.negocioNome}>Matriz</div>
            <div className={styles.negocioDetalhe}>não implantada</div>
          </div>
          <div className={styles.negocioCard}>
            <div className={styles.negocioNome}>Poedeira</div>
            <div className={styles.negocioDetalhe}>1 lote em produção</div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>Próximas atividades</div>
        <div className={styles.atividades}>
          <div className={`${styles.atividade} ${styles.atividadeAlerta}`}>
            ⚠ Ração acabando em breve
          </div>
          <div className={styles.atividade}>💰 Financiamento herdado — parcela do mês</div>
          <div className={styles.atividade}>🚚 Entrega ao cliente herdado</div>
        </div>
      </section>

      <div className={styles.spacer} />

      <nav className={styles.nav}>
        <span>🏠</span>
        <span>🏢</span>
        <span>💰</span>
        <span>📊</span>
        <span>☰</span>
      </nav>
    </main>
  );
}
