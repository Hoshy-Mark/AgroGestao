import styles from "./AppShell.module.css";

const NAV_ITEMS = [
  { icon: "🏠", label: "Visão Geral", active: true },
  { icon: "🐔", label: "Negócios" },
  { icon: "💰", label: "Financeiro" },
  { icon: "🤝", label: "Comercial" },
  { icon: "📈", label: "Mercado" },
  { icon: "📊", label: "Relatórios" },
  { icon: "📖", label: "Codex" },
];

const SPEEDS = ["⏸", "1x", "2x", "4x", "8x"];

export function AppShell({
  empresaNome,
  dia,
  caixa,
  reputacao,
  conhecimento,
  children,
}: {
  empresaNome: string;
  dia: number;
  caixa: string;
  reputacao: number;
  conhecimento: number;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>🌾</span>
          <span>AgroGestão</span>
        </div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className={`${styles.navItem} ${item.active ? styles.navItemActive : ""}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div className={styles.navFooter}>
          Fase 0 — Fundação
          <br />
          v0.1.0
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarBrand}>
            <div className={styles.empresaNome}>{empresaNome}</div>
            <div className={styles.diaAtual}>Dia {dia}</div>
          </div>

          <div className={styles.speedControls}>
            {SPEEDS.map((s, i) => (
              <button
                key={s}
                className={`${styles.speedBtn} ${i === 1 ? styles.speedBtnActive : ""}`}
                type="button"
              >
                {s}
              </button>
            ))}
          </div>

          <div className={styles.topbarStats}>
            <div className={styles.statPill}>
              <span className={styles.statPillIcon}>💰</span>
              <span className={styles.statPillValue}>{caixa}</span>
            </div>
            <div className={styles.statPill}>
              <span className={styles.statPillIcon}>⭐</span>
              <span className={styles.statPillValue}>{reputacao}</span>
            </div>
            <div className={styles.statPill}>
              <span className={styles.statPillIcon}>🧠</span>
              <span className={styles.statPillValue}>{conhecimento}</span>
            </div>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
