"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AppShell.module.css";

const NAV_ITEMS = [
  { icon: "🏠", label: "Visão Geral", href: "/" },
  { icon: "🐔", label: "Negócios", href: "/negocios" },
  { icon: "💰", label: "Financeiro", href: "/financeiro" },
  { icon: "🤝", label: "Comercial", href: "/comercial" },
  { icon: "📈", label: "Mercado", href: "/mercado" },
  { icon: "📊", label: "Relatórios", href: "/relatorios" },
  { icon: "📖", label: "Codex", href: "/codex" },
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
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>🌾</span>
          <span>AgroGestão</span>
        </div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ""}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.navFooter}>
          Fase 1 — Vertical slice
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
                disabled
                title="Controles de velocidade ainda não fazem nada — o tempo avança pelo botão Avançar dia"
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
